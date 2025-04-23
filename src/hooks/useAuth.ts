"use client"

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { AxiosError } from 'axios';
import { IApiErrorResponse, IApiSuccessResponse } from '@/types/api.types';
import { useToast } from '@/hooks/use-toast';

export const useOnboardingFinish = () => {
  const { toast } = useToast();
  const router = useRouter();
    const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: () => api.post<IApiSuccessResponse<void>>('/users/onboarding-finish'),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["user"] });
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
