"use client"

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { ILoginRequest, IRegisterRequest, IAuthResponse } from '@/types/Auth.interface';
import { AxiosError } from 'axios';
import { IApiErrorResponse, IApiSuccessResponse } from '@/types/api.types';
import { useToast } from '@/hooks/use-toast';
import { useAuthStore } from '@/stores/authStores';
import { IUser } from '@/types/User.interface';

// Hook de connexion
export const useLogin = () => {
  const router = useRouter();
  const { toast } = useToast();
  const setAuth = useAuthStore((state) => state.setAuth);
  return useMutation({
    mutationFn: (credentials: ILoginRequest) => api.post<IApiSuccessResponse<IAuthResponse>>('/users/login', credentials),
    onSuccess: async (data: IApiSuccessResponse<IAuthResponse>) => {
      setAuth(data.data?.user as IUser);
      router.push('/dashboard');
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
      mutationFn: (data: IRegisterRequest) => api.post<IApiSuccessResponse<IRegisterRequest>>('/users/register', data),
      onSuccess: (data: IApiSuccessResponse<IRegisterRequest>) => {
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

export const useOnboardingFinish = () => {
  const { toast } = useToast();
  const router = useRouter();
  const updateUser = useAuthStore((state) => state.updateUser);
  return useMutation({
    mutationFn: () => api.post<IApiSuccessResponse<void>>('/users/onboarding-finish'),
    onSuccess: () => {
      updateUser({ onboarding_completed: true, onboarding_step: "FINISH" });
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
