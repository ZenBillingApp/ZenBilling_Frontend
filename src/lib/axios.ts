import axios from 'axios';
import { getCookie, deleteCookie } from 'cookies-next';
import { toast } from '@/components/ui/use-toast';

// Créer une instance Axios
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Fonction utilitaire pour formater les messages d'erreur
const formatErrorMessage = (error: any) => {
  // Cas des erreurs express-validator
  if (error.response?.data?.errors) {
    return error.response.data.errors
      .map((err: { msg: string }) => err.msg)
      .join('\n');
  }
  
  // Cas d'une erreur simple avec message
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  
  // Message par défaut
  return 'Une erreur est survenue';
};

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
    toast({
      variant: "destructive",
      title: "Erreur de requête",
      description: formatErrorMessage(error),
    });
    return Promise.reject(error);
  }
);

// Utiliser l'intercepteur de réponse
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Gestion des erreurs d'authentification
    if (error.response?.status === 401 || error.response?.status === 403) {
      deleteCookie('token');
      window.location.href = '/login';
      toast({
        variant: "destructive",
        title: "Session expirée",
        description: "Veuillez vous reconnecter",
      });
      return Promise.reject(error);
    }

    // Afficher le toast pour les autres erreurs
    toast({
      variant: "destructive",
      title: "Une erreur est survenue",
      description: formatErrorMessage(error),
    });

    return Promise.reject(error);
  }
);

export default api;