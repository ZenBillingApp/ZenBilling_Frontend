"use client"

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/services/api';
import { useAuthStore } from '@/stores/authStores';
import { useRouter } from 'next/navigation';
import { ILoginRequest, IRegisterRequest } from '@/types/Auth.interface';
import { AxiosError } from 'axios';
import { IApiErrorResponse, IApiSuccessResponse } from '@/types/api.types';
import { useToast } from '@/hooks/use-toast';



export const useLogin = () => {
  const setAuth = useAuthStore((state) => state.setAuth);
  const router = useRouter();
  const { toast } = useToast();
  return useMutation({
    mutationFn: (credentials: ILoginRequest) => api.post('/users/login', credentials),

    onSuccess: (data) => {
      setAuth(data.data)
      router.push('/invoices');
    },
    onError: (error: AxiosError<IApiErrorResponse>) => {
      toast({
        title: "Erreur de connexion",
        description: error.response?.data.message,
      });
    }
  });

} 

export const useLogout = () => {
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const queryClient = useQueryClient();
  const router = useRouter()

  return useMutation({
    mutationFn: () => api.post('/users/logout'),
    onSuccess: () => {
      clearAuth();
      queryClient.clear();
      router.push('/login');
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
          toast({
              variant: "destructive",
              title: "Erreur lors de la création du compte",
              description: error.response?.data.message,
          });
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
  return useMutation({
    mutationFn: () => api.post('/users/onboarding-finish'),
    onSuccess: () => {
      router.push('/invoices');
    },
    onError: (error: AxiosError<IApiErrorResponse>) => {
      toast({
        title: "Erreur lors de la fin du onboarding",
        description: error.response?.data.message,
      });
    }
  });
};
