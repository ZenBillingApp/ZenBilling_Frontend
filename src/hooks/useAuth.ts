"use client"

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/services/api';
import { useAuthStore } from '@/stores/authStores';
import { useRouter } from 'next/navigation';
import { ILoginRequest } from '@/types/Auth.interface';

interface UseAuthReturn {
  login: {
    mutate: (credentials: ILoginRequest) => void;
    isLoading: boolean;
    error: Error | null;
  };
  logout: () => void;
}

export function useAuth(): UseAuthReturn {
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const setAuth = useAuthStore((state) => state.setAuth);
  const queryClient = useQueryClient();
  const router = useRouter();
  const loginMutation = useMutation({
    mutationFn: (credentials: ILoginRequest) => api.post('/users/login', credentials),
  

    onSuccess: (data) => {
      setAuth(data.data)
      router.push('/invoices');
      queryClient.invalidateQueries({ queryKey: ['user'] });
    },
    onError: (error) => {
      console.error('Erreur de connexion:', error);
      clearAuth();
    }
  });

  const logout = () => {
    clearAuth();
    queryClient.clear();
    router.push('/login');
  };

  return {
    login: {
      mutate: loginMutation.mutate,
      isLoading: loginMutation.isPending,
      error: loginMutation.error
    },
    logout
  };
}
