import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import { ICreateCompanyRequest } from "@/types/Company.request.interface";
import { ICompany } from "@/types/Company.interface";
import { AxiosError } from "axios";
import type { IApiErrorResponse, IApiSuccessResponse } from "@/types/api.types";

import { useToast } from "@/hooks/use-toast";

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