"use client"
import axios, { AxiosInstance, AxiosError, AxiosRequestConfig } from 'axios';
import { toast } from '@/hooks/use-toast';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

// Création de l'instance Axios
const axiosInstance: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 15000, // Augmentation du timeout à 15 secondes
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: true, // Permet l'envoi des cookies avec les requêtes cross-origin
});


// Intercepteur pour les requêtes
axiosInstance.interceptors.request.use(
  (config) => {
    // Vous pouvez ajouter des headers spécifiques ici si nécessaire
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Intercepteur pour les réponses
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    let message = 'Une erreur est survenue';
    
    if (error.response) {
      // La requête a été faite et le serveur a répondu avec un code d'erreur
      switch (error.response.status) {
        case 401:
          message = 'Session expirée. Veuillez vous reconnecter.';
          console.error('Session expirée');
          // Rediriger vers la page de connexion
          window.location.href = '/login';
          break;
        case 403:
          message = 'Accès interdit. Vous n\'avez pas les droits nécessaires.';
          console.error('Accès interdit');
          // Possibilité de rediriger vers une page d'erreur ou de connexion
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
          message = `Erreur ${error.response.status}: ${
            typeof responseData?.message === 'string' 
              ? responseData.message 
              : 'Erreur inattendue'
          }`;
          console.error(`Erreur HTTP : ${error.response.status}`);
      }
    } else if (error.request) {
      // La requête a été faite mais aucune réponse n'a été reçue
      message = 'Aucune réponse reçue du serveur. Vérifiez votre connexion.';
      console.error('Aucune réponse reçue du serveur');
    } else {
      // Une erreur s'est produite lors de la configuration de la requête
      message = `Erreur de configuration: ${error.message}`;
      console.error('Erreur de configuration de la requête:', error.message);
    }
    
    // Afficher le toast d'erreur
    toast({
      title: "Erreur",
      description: message,
      variant: "destructive",
    });
    
    return Promise.reject(error);
  }
);

// Service API
export const api = {
  get: async <T>(endpoint: string, config?: AxiosRequestConfig): Promise<T> => {
    try {
      const response = await axiosInstance.get<T>(endpoint, config);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getBinary: async (endpoint: string, config?: AxiosRequestConfig) => {
    try {
      const mergedConfig: AxiosRequestConfig = {
        responseType: 'blob',
        ...config
      };
      return await axiosInstance.get(endpoint, mergedConfig);
    } catch (error) {
      throw error;
    }
  },

  post: async <T>(endpoint: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> => {
    try {
      const response = await axiosInstance.post<T>(endpoint, data, config);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  put: async <T>(endpoint: string, data: unknown, config?: AxiosRequestConfig): Promise<T> => {
    try {
      const response = await axiosInstance.put<T>(endpoint, data, config);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  delete: async <T>(endpoint: string, config?: AxiosRequestConfig): Promise<T> => {
    try {
      const response = await axiosInstance.delete<T>(endpoint, config);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  patch: async <T>(endpoint: string, data: unknown, config?: AxiosRequestConfig): Promise<T> => {
    try {
      const response = await axiosInstance.patch<T>(endpoint, data, config);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

// Export de l'instance axios pour une utilisation directe si nécessaire
export default axiosInstance;