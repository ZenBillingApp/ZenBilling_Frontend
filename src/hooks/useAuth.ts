"use client"

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/services/api';
import { useAuthStore } from '@/stores/authStores';
import { useRouter } from 'next/navigation';
import { ILoginRequest, IRegisterRequest } from '@/types/Auth.interface';
import { AxiosError } from 'axios';
import { IApiErrorResponse, IApiSuccessResponse } from '@/types/api.types';
import { useToast } from '@/hooks/use-toast';
// import { setAuthCookies, deleteAuthCookies } from '@/lib/cookie';

// Hook de connexion
export const useLogin = () => {
  const setAuth = useAuthStore((state) => state.setAuth);
  const router = useRouter();
  const { toast } = useToast();
  return useMutation({
    mutationFn: (credentials: ILoginRequest) => api.post('/users/login', credentials),
    onSuccess: async (data) => {
      // await setAuthCookies(data.data.token, data.data.refreshToken, data.data.expiresIn)
      setAuth(data.data)
      
      // Vérifier si l'utilisateur a terminé l'onboarding
      if (data?.data?.user?.onboarding_completed) {
        router.push('/dashboard');
      } else {
        // Rediriger vers l'étape d'onboarding appropriée
        const onboardingStep = data?.data?.user?.onboarding_step;
        if (onboardingStep === 'CHOOSING_COMPANY') {
          router.push('/onboarding/company');
        } else if (onboardingStep === 'FINISH') {
          router.push('/onboarding/finish');
        } else {
          // Par défaut, rediriger vers la première étape
          router.push('/onboarding/company');
        }
      }
    },
    onError: (error: AxiosError<IApiErrorResponse>) => {
      toast({
        variant: "destructive",
        title: "Erreur de connexion",
        description: error.response?.data.message,
      });
    }
  });
} 

// Hook de déconnexion
export const useLogout = () => {
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const queryClient = useQueryClient();
  const router = useRouter()

  return useMutation({
    mutationFn: () => api.post('/users/logout'),
    onSuccess: async () => {
      // await deleteAuthCookies();
      clearAuth();
      queryClient.clear();
      router.replace('/login');
    }
  });
}

export const useRegister = () => {
  const { toast } = useToast();
  const router = useRouter();
  return useMutation({
      mutationFn: (data: IRegisterRequest) => api.post('/users/register', data),
      onSuccess: (data: IApiSuccessResponse<void>) => {
          toast({
              title: "Compte créé avec succès",
              description: data.message,
          });
          router.push('/login');
      },
      onError: (error: AxiosError<IApiErrorResponse>) => {
        if (error.response?.data.message) {
          toast({
              variant: "destructive",
              title: "Erreur lors de la création du compte",
              description: error.response?.data.message,
          });
        }
      }
  });


};

export const useProfile = () => {
  return useQuery({
    queryKey: ['user'],
    queryFn: () => api.get('/users/profile'),
    
  });
};

export const useOnboardingFinish = () => {
  const { toast } = useToast();
  const router = useRouter();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => api.post('/users/onboarding-finish'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user'] });
      router.replace('/dashboard');
    },
    onError: (error: AxiosError<IApiErrorResponse>) => {
      toast({
        title: "Erreur lors de la fin du onboarding",
        description: error.response?.data.message,
      });
    }
  });
};
