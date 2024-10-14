import axios from 'axios';
import { getCookie, deleteCookie } from 'cookies-next';

// Créer une instance Axios
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepter la requête pour ajouter l'en-tête Authorization
api.interceptors.request.use(
  (config) => {
    const token = getCookie('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Utiliser l'intercepteur de réponse
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      deleteCookie('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
