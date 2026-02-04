"use client"
import axios, { AxiosInstance, AxiosError, AxiosRequestConfig, InternalAxiosRequestConfig } from 'axios';
import { toast } from '@/hooks/use-toast';
import { authClient, getJwtToken, invalidateTokenCache } from '@/lib/auth-client';
import { useAuthStore } from '@/stores/authStores';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

/**
 * API Client - State of the Art Implementation
 *
 * Fonctionnalités:
 * 1. Injection automatique du JWT via intercepteur
 * 2. Refresh silencieux sur 401 avec queue de requêtes
 * 3. Gestion centralisée des erreurs
 * 4. Pas de stockage persistant du token (sécurité)
 */

// État pour le refresh silencieux
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string | null) => void;
  reject: (error: Error) => void;
}> = [];

/**
 * Traite la queue de requêtes en attente après un refresh
 */
const processQueue = (error: Error | null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

/**
 * Effectue la déconnexion et redirection
 */
const logoutAndRedirect = async () => {
  const clearAuth = useAuthStore.getState().clearAuth;

  // Invalider le cache token
  invalidateTokenCache();

  // Nettoyer le store
  clearAuth();

  // Tenter de déconnecter du serveur (best effort)
  try {
    await authClient.signOut();
  } catch (error) {
    console.error('Erreur lors de la déconnexion du serveur:', error);
  }

  // Rediriger vers la page de connexion
  if (typeof window !== 'undefined') {
    window.location.href = '/login';
  }
};

/**
 * Tente un refresh silencieux du token
 */
const attemptSilentRefresh = async (): Promise<string | null> => {
  try {
    // Invalider le cache pour forcer un nouveau token
    invalidateTokenCache();

    // Récupérer un nouveau token via Better Auth
    const token = await getJwtToken();

    if (!token) {
      throw new Error('Unable to refresh token');
    }

    return token;
  } catch {
    return null;
  }
};

// Création de l'instance Axios
const axiosInstance: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

/**
 * Intercepteur de requête
 * Injecte automatiquement le JWT depuis le cache mémoire
 */
axiosInstance.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    try {
      const token = await getJwtToken();

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Erreur lors de la récupération du token:', error);
    }

    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * Intercepteur de réponse
 * Gère le refresh silencieux sur 401 avec queue de requêtes
 */
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Gestion du 401 avec refresh silencieux
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Marquer la requête comme déjà retentée
      originalRequest._retry = true;

      // Si un refresh est déjà en cours, mettre en queue
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({
            resolve: (token) => {
              if (token) {
                originalRequest.headers.Authorization = `Bearer ${token}`;
                resolve(axiosInstance(originalRequest));
              } else {
                reject(error);
              }
            },
            reject,
          });
        });
      }

      isRefreshing = true;

      try {
        const newToken = await attemptSilentRefresh();

        if (newToken) {
          // Refresh réussi, traiter la queue
          processQueue(null, newToken);

          // Réexécuter la requête originale
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return axiosInstance(originalRequest);
        } else {
          // Refresh échoué, déconnecter
          processQueue(new Error('Token refresh failed'));
          await logoutAndRedirect();
          return Promise.reject(error);
        }
      } catch (refreshError) {
        processQueue(refreshError as Error);
        await logoutAndRedirect();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // Gestion des autres erreurs
    let message = 'Une erreur est survenue';

    if (error.response) {
      switch (error.response.status) {
        case 401:
          // Déjà géré ci-dessus si _retry est false
          message = 'Session expirée. Veuillez vous reconnecter.';
          break;
        case 403:
          message = 'Accès interdit. Vous n\'avez pas les droits nécessaires.';
          console.error('Accès interdit');
          break;
        case 404:
          message = 'Ressource non trouvée.';
          console.error('Ressource non trouvée');
          break;
        case 500:
          message = 'Erreur serveur. Veuillez réessayer plus tard.';
          console.error('Erreur serveur');
          break;
        default:
          const responseData = error.response.data as Record<string, unknown> | undefined;
          message = typeof responseData?.message === 'string'
            ? responseData.message
            : 'Erreur inattendue';
          console.error(`Erreur HTTP : ${error.response.status}`);
      }
    } else if (error.request) {
      message = 'Aucune réponse reçue du serveur. Vérifiez votre connexion.';
      console.error('Aucune réponse reçue du serveur');
    } else {
      message = `Erreur de configuration: ${error.message}`;
      console.error('Erreur de configuration de la requête:', error.message);
    }

    // Afficher le toast d'erreur (sauf pour 401 qui redirige)
    if (error.response?.status !== 401) {
      toast({
        title: "Erreur",
        description: message,
        variant: "destructive",
      });
    }

    return Promise.reject(error);
  }
);

// Service API avec types génériques
export const api = {
  get: async <T>(endpoint: string, config?: AxiosRequestConfig): Promise<T> => {
    const response = await axiosInstance.get<T>(endpoint, config);
    return response.data;
  },

  getBinary: async (endpoint: string, config?: AxiosRequestConfig) => {
    const mergedConfig: AxiosRequestConfig = {
      responseType: 'blob',
      ...config
    };
    return await axiosInstance.get(endpoint, mergedConfig);
  },

  post: async <T>(endpoint: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> => {
    const response = await axiosInstance.post<T>(endpoint, data, config);
    return response.data;
  },

  put: async <T>(endpoint: string, data: unknown, config?: AxiosRequestConfig): Promise<T> => {
    const response = await axiosInstance.put<T>(endpoint, data, config);
    return response.data;
  },

  delete: async <T>(endpoint: string, config?: AxiosRequestConfig): Promise<T> => {
    const response = await axiosInstance.delete<T>(endpoint, config);
    return response.data;
  },

  patch: async <T>(endpoint: string, data: unknown, config?: AxiosRequestConfig): Promise<T> => {
    const response = await axiosInstance.patch<T>(endpoint, data, config);
    return response.data;
  },
};

export default axiosInstance;
