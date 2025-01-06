"use client"
import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import Cookies from 'js-cookie';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

// Création de l'instance Axios
const axiosInstance: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 10000, // Timeout de 10 secondes
  headers: {
    'Content-Type': 'application/json',
  },

});

// Intercepteur pour les requêtes
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = Cookies.get('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Intercepteur pour les réponses
axiosInstance.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response) {
      // La requête a été faite et le serveur a répondu avec un code d'erreur
      switch (error.response.status) {
        case 401:
          // Gérer l'expiration du token ou l'authentification invalide
            Cookies.remove('token');
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



interface ApiErrorResponse {
  message?: string;
  errors?: Array<{
    field?: string;
    message: string;
  }>;
}

export interface ApiError extends Error {
  response?: {
    data?: ApiErrorResponse;
    status: number;
  };
}

// Service API
export const api = {
  get: async (endpoint: string) => {
    try {
      const response = await axiosInstance.get(endpoint);
      return response.data
    } catch (error) {
      throw handleApiError(error as AxiosError<ApiErrorResponse>);
    }
  },

  getBinary: async (endpoint: string) => {
    try {
      const response = await axiosInstance.get(endpoint, {
        responseType: 'blob'
      });
      return response;
    } catch (error) {
      throw handleApiError(error as AxiosError<ApiErrorResponse>);
    }
  },

  post: async (endpoint: string, data?: unknown) => {
    try {
      const response = await axiosInstance.post(endpoint, data);
      return response.data
    } catch (error) {
      throw handleApiError(error as AxiosError<ApiErrorResponse>);
    }
  },

  put: async (endpoint: string, data: unknown) => {
    try {
      const response = await axiosInstance.put(endpoint, data);
      return response.data
    } catch (error) {
      throw handleApiError(error as AxiosError<ApiErrorResponse>);
    }
  },

  delete: async (endpoint: string) => {
    try {
      const response = await axiosInstance.delete(endpoint);
      return response.data
    } catch (error) {
      throw handleApiError(error as AxiosError<ApiErrorResponse>);
    }
  },

  patch: async (endpoint: string, data: unknown) => {
    try {
      const response = await axiosInstance.patch(endpoint, data);
      return response.data
    } catch (error) {
      throw handleApiError(error as AxiosError<ApiErrorResponse>);
    }
  },
};

// Fonction utilitaire pour gérer les erreurs
const handleApiError = (error: AxiosError<ApiErrorResponse>): never => {
  if (error.response?.data) {
    const { data } = error.response;
    
    // Si nous avons un tableau d'erreurs, on le retourne directement
    if (Array.isArray(data.errors) && data.errors.length > 0) {
      const errorObject = new Error() as ApiError;
      errorObject.response = {
        data: {
          errors: data.errors
        },
        status: error.response.status
      };
      throw errorObject;
    }
    
    // Si nous avons un message unique, on le transforme en tableau d'erreurs
    if (data.message) {
      const errorObject = new Error() as ApiError;
      errorObject.response = {
        data: {
          errors: [{
            message: data.message
          }]
        },
        status: error.response.status
      };
      throw errorObject;
    }
  }

  // Erreur par défaut
  const errorObject = new Error('Une erreur inattendue est survenue') as ApiError;
  errorObject.response = {
    data: {
      errors: [{
        message: 'Une erreur inattendue est survenue'
      }]
    },
    status: error.response?.status || 500
  };
  throw errorObject;
};

// Export de l'instance axios pour une utilisation directe si nécessaire
export default axiosInstance;