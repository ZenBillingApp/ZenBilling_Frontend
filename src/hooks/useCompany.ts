import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import { ICreateCompanyRequest, IUpdateCompanyRequest } from "@/types/Company.request.interface";
import { ICompany, ILegalForm } from "@/types/Company.interface";
import { AxiosError } from "axios";
import type { IApiErrorResponse, IApiSuccessResponse } from "@/types/api.types";

import { useToast } from "@/hooks/use-toast";
import { useAuthStore } from "@/stores/authStores";

import { api } from "@/lib/api";

export const useCreateCompany = () => {
    const { toast } = useToast();
    const router = useRouter();
    return useMutation<IApiSuccessResponse<ICompany>, AxiosError<IApiErrorResponse>, ICreateCompanyRequest>({
        mutationFn: (data: ICreateCompanyRequest) => api.post("/companies", data),
        onSuccess: () => {
            router.push("/onboarding/finish");
        },
        onError: (error: AxiosError<IApiErrorResponse>) => {
            if (error.response?.data.message) {
            toast({
                variant: "destructive",
                title: "Erreur lors de la création de l'entreprise",
                    description: error.response?.data.message,
                })
            }
        }
    })
}

export const useCompany = () => {
    const companyId = useAuthStore((state) => state.user?.company_id);
    
    return useQuery<IApiSuccessResponse<ICompany>>({
        queryKey: ["company", companyId],
        queryFn: () => api.get<IApiSuccessResponse<ICompany>>(`/companies`),
        enabled: !!companyId,
    });
}

export const useUpdateCompany = () => {
    const queryClient = useQueryClient();
    const { toast } = useToast();
    const companyId = useAuthStore((state) => state.user?.company_id);
    
    return useMutation<IApiSuccessResponse<ICompany>, AxiosError<IApiErrorResponse>, IUpdateCompanyRequest>({
        mutationFn: (data: IUpdateCompanyRequest) => api.put(`/companies`, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["company", companyId] });
            toast({
                title: "Entreprise mise à jour",
                description: "Les informations de l'entreprise ont été mises à jour avec succès",
            });
        },
        onError: (error: AxiosError<IApiErrorResponse>) => {
            if (error.response?.data.message) {
                toast({
                    variant: "destructive",
                    title: "Erreur lors de la mise à jour de l'entreprise",
                    description: error.response?.data.message,
                });
            }
        }
    });
}

export const useLegalForm = () => {
    return useQuery<IApiSuccessResponse<ILegalForm>>({
        queryKey: ["legalForm"],
        queryFn: () => api.get<IApiSuccessResponse<ILegalForm>>("/companies/legal-forms"),
    });
}