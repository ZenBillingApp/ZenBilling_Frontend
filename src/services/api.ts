import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
// import { getCookie, setAuthCookies, deleteAuthCookies } from '@/lib/cookie';
import { getCookie } from '@/lib/cookie';
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

// Création de l'instance Axios
const axiosInstance: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 10000, // Timeout de 10 secondes
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Variable pour suivre si un rafraîchissement de token est en cours
let isRefreshing = false;
// File d'attente pour les requêtes en attente pendant le rafraîchissement
let failedQueue: Array<{
  resolve: (value: unknown) => void;
  reject: (reason?: unknown) => void;
  config: InternalAxiosRequestConfig;
}> = [];

// Fonction pour traiter la file d'attente
const processQueue = (error: AxiosError | null) => {
  failedQueue.forEach(promise => {
    if (error) {
      promise.reject(error);
    } else {
      promise.resolve(promise.config);
    }
  });
  
  failedQueue = [];
};

// Intercepteur pour les requêtes
axiosInstance.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    // const accessToken = await getCookie('access_token');
    // if (accessToken) {
    //   config.headers['Authorization'] = `Bearer ${accessToken}`;
    // }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Intercepteur pour les réponses
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig;

    const refreshToken = await getCookie('refresh_token');
    
    // Vérifier si c'est une erreur 401 (non autorisé) et que la requête n'est pas déjà en cours de rafraîchissement
    if (error.response?.status === 401 && !originalRequest.headers['X-Retry'] && refreshToken) {
      if (isRefreshing) {
        // Si un rafraîchissement est déjà en cours, mettre la requête en file d'attente
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject, config: originalRequest });
        });
      }

      isRefreshing = true;
      originalRequest.headers['X-Retry'] = 'true';

      try {
        // Tenter de rafraîchir le token
         await axios.post(`${BASE_URL}/users/refresh-token`, {
            // refreshToken: await getCookie('refresh_token')

        }, {
          headers: {
            'Content-Type': 'application/json'
          },
          withCredentials: true
        });


        // await setAuthCookies(response.data.data.token, response.data.data.refreshToken, response.data.data.expiresIn)


        
        // Si le rafraîchissement réussit, traiter la file d'attente et réessayer la requête originale
        processQueue(null);
        isRefreshing = false;
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        // Si le rafraîchissement échoue, traiter la file d'attente avec l'erreur et rediriger vers la page de connexion
        processQueue(refreshError as AxiosError);
        isRefreshing = false;
        // await deleteAuthCookies();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    if (error.response) {
      // La requête a été faite et le serveur a répondu avec un code d'erreur
      switch (error.response.status) {
        case 401:
          // Si nous arrivons ici, c'est que le rafraîchissement a échoué ou que la requête est déjà marquée comme réessayée
          // await deleteAuthCookies();
          window.location.href = '/login';
          break;
        case 403:
          console.error('Accès interdit');
          break;
        case 404:
          console.error('Ressource non trouvée');
          break;
        case 500:
          console.error('Erreur serveur');
          break;
        default:
          console.error(`Erreur HTTP : ${error.response.status}`);
      }
    } else if (error.request) {
      // La requête a été faite mais aucune réponse n'a été reçue
      console.error('Aucune réponse reçue du serveur');
    } else {
      // Une erreur s'est produite lors de la configuration de la requête
      console.error('Erreur de configuration de la requête:', error.message);
    }



    return Promise.reject(error);
  }
);

// Service API
export const api = {
  get: async (endpoint: string) => {
    try {
      const response = await axiosInstance.get(endpoint);
      return response.data
    } catch (error) {
      throw error;
    }
  },

  getBinary: async (endpoint: string) => {
    try {
      const response = await axiosInstance.get(endpoint, {
        responseType: 'blob'
      });
      return response;
    } catch (error) {
      throw error;
    }
  },

  post: async (endpoint: string, data?: unknown) => {
    try {
      const response = await axiosInstance.post(endpoint, data);
      return response.data
    } catch (error) {
      throw error;
    }
  },

  put: async (endpoint: string, data: unknown) => {
    try {
      const response = await axiosInstance.put(endpoint, data);
      return response.data
    } catch (error) {
      throw error;
    }
  },

  delete: async (endpoint: string) => {
    try {
      const response = await axiosInstance.delete(endpoint);
      return response.data
    } catch (error) {
      throw error;
    }
  },

  patch: async (endpoint: string, data: unknown) => {
    try {
      const response = await axiosInstance.patch(endpoint, data);
      return response.data
    } catch (error) {
        throw error;
    }
  },
};

// Export de l'instance axios pour une utilisation directe si nécessaire
export default axiosInstance;