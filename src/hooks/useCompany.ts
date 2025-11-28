import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import { ICreateCompanyRequest, IUpdateCompanyRequest } from "@/types/Company.request.interface";
import { ICompany, ICompanyLegalForm } from "@/types/Company.interface";
import { AxiosError } from "axios";
import type { IApiErrorResponse, IApiSuccessResponse } from "@/types/api.types";

import { useToast } from "@/hooks/use-toast";
import { useAuthStore } from "@/stores/authStores";

import { api } from "@/lib/api";
import { useActiveOrganizationId } from "./useOrganization";
import { queryKeys } from "@/lib/queryKeys";

export const useCreateCompany = () => {
    const { toast } = useToast();
    const router = useRouter();
    const queryClient = useQueryClient();
    return useMutation<IApiSuccessResponse<ICompany>, AxiosError<IApiErrorResponse>, ICreateCompanyRequest>({
        mutationFn: (data: ICreateCompanyRequest) => api.post("/company", data),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ["user"] });
            router.replace("/onboarding/finish");
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
    const organizationId = useActiveOrganizationId();

    return useQuery<IApiSuccessResponse<ICompany>>({
        queryKey: queryKeys.company.all(organizationId),
        queryFn: () => api.get<IApiSuccessResponse<ICompany>>(`/company`),
        enabled: !!companyId && !!organizationId,
    });
}

export const useUpdateCompany = () => {
    const queryClient = useQueryClient();
    const { toast } = useToast();
    const organizationId = useActiveOrganizationId();

    return useMutation<IApiSuccessResponse<ICompany>, AxiosError<IApiErrorResponse>, IUpdateCompanyRequest>({
        mutationFn: (data: IUpdateCompanyRequest) => api.put(`/company`, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.company.all(organizationId) });
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
    return useQuery<IApiSuccessResponse<ICompanyLegalForm>>({
        queryKey: queryKeys.company.legalForms(),
        queryFn: () => api.get<IApiSuccessResponse<ICompanyLegalForm>>("/company/legal-forms"),
    });
}