import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import { ICreateCompanyRequest } from "@/types/Company.request.interface";
import { IApiErrorResponse } from "@/types/api.types";

import { useToast } from "@/hooks/use-toast";

import { api } from "@/services/api";

export const useCreateCompany = () => {
    const { toast } = useToast();
    const router = useRouter();
    return useMutation({
        mutationFn: (data: ICreateCompanyRequest) => api.post("/companies", data),
        onSuccess: () => {
            router.push("/onboarding/finish");
        },
        onError: (error: IApiErrorResponse) => {
            toast({
                title: "Erreur lors de la création de l'entreprise",
                description: error.message,
            });
        }
    })
}