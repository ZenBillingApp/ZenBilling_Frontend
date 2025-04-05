import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { api } from "@/services/api"
import type { ICreateQuoteRequest, IUpdateQuoteRequest, IQuoteQueryParams } from "@/types/Quote.request.interface"
import { useToast } from "@/hooks/use-toast"
import { IQuote,IQuotePagination } from "@/types/Quote.interface"
import type { IApiErrorResponse,IApiSuccessResponse } from "@/types/api.types"
import { AxiosError } from "axios"

export const useQuotes = (params: IQuoteQueryParams = {}) => {
    const { page = 1, limit = 10, search = "", status, customer_id, start_date, end_date, sortBy = 'quote_date', sortOrder = 'DESC' } = params;

    return useQuery<IApiSuccessResponse<IQuotePagination>>({
        queryKey: ["quotes", { page, limit, search, status, customer_id, start_date, end_date, sortBy, sortOrder }],
        queryFn: () => {
            let url = `/quotes?page=${page}&limit=${limit}&sortBy=${sortBy}&sortOrder=${sortOrder}`;
            if (search) url += `&search=${search}`;
            if (status) url += `&status=${status}`;
            if (customer_id) url += `&customer_id=${customer_id}`;
            if (start_date) url += `&start_date=${start_date}`;
            if (end_date) url += `&end_date=${end_date}`;
            return api.get<IApiSuccessResponse<IQuotePagination>>(url);
        },
        staleTime: 1000 * 60 * 5, // 5 minutes
    })
}

export const useQuote = (quoteId: string) => {
    return useQuery<IApiSuccessResponse<IQuote>>({
        queryKey: ["quotes", quoteId],
        queryFn: () => api.get<IApiSuccessResponse<IQuote>>(`/quotes/${quoteId}`),
        
        enabled: !!quoteId,
    })
}


export const useCreateQuote = () => {
    const queryClient = useQueryClient()
    const { toast } = useToast()

    return useMutation<IApiSuccessResponse<IQuote>, AxiosError<IApiErrorResponse>, ICreateQuoteRequest>({
        mutationFn: (data: ICreateQuoteRequest) => 
            api.post("/quotes", data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["quotes"] })
            queryClient.invalidateQueries({ queryKey: ["products"] })
            queryClient.invalidateQueries({ queryKey: ["customers"] })
            toast({
                title: "Devis créé avec succès",
                description: "Le devis a été créé avec succès",
            })
        },
    })
}

export const useUpdateQuote = (quoteId: string) => {
    const queryClient = useQueryClient()
    const { toast } = useToast()
    return useMutation<IApiSuccessResponse<IQuote>, AxiosError<IApiErrorResponse>, IUpdateQuoteRequest>({

        mutationFn: (data: IUpdateQuoteRequest) =>
            api.put(`/quotes/${quoteId}`, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["quotes", quoteId] })
            queryClient.invalidateQueries({ queryKey: ["quotes"] })
            toast({
                title: "Devis modifié avec succès",
                description: "Le devis a été modifié avec succès",
            })
        },
        onError: (error: AxiosError<IApiErrorResponse>) => {
            toast({
                title: "Erreur lors de la modification du devis",
                description: error.response?.data?.message,
            })
        },
    })
}

export const useDeleteQuote = () => {
    const queryClient = useQueryClient()
    const { toast } = useToast()
    return useMutation<IApiSuccessResponse<IQuote>, AxiosError<IApiErrorResponse>, string>({
        mutationFn: (quoteId: string) =>
            api.delete(`/quotes/${quoteId}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["quotes"] })

            toast({
                title: "Devis supprimé avec succès",
                description: "Le devis a été supprimé avec succès",
            })
        },
        onError: (error: AxiosError<IApiErrorResponse>) => {
            toast({
                title: "Erreur lors de la suppression du devis",
                description: error.response?.data?.message,
            })
        },
    })
}

export const useDownloadQuotePdf = (quoteNumber: string) => {
    const { toast } = useToast()
    return useMutation({
        mutationFn: async (quoteId: string) => {
            const response = await api.getBinary(`/quotes/${quoteId}/pdf`)
            

            // Créer un URL pour le blob
            const blob = new Blob([response.data], { type: 'application/pdf' })
            const url = window.URL.createObjectURL(blob)
            
            // Créer un lien temporaire et cliquer dessus
            const link = document.createElement('a')
            link.href = url
            link.setAttribute('download', `${quoteNumber}.pdf`)
            document.body.appendChild(link)
            link.click()
            
            // Nettoyer
            document.body.removeChild(link)
            window.URL.revokeObjectURL(url)
            
            return response
        },
        onSuccess: () => {
            toast({
                title: "Fichier PDF téléchargé avec succès",
                description: "Le fichier PDF a été téléchargé avec succès",
            })
        },
        onError: (error: AxiosError<IApiErrorResponse>) => {
            toast({
                title: "Erreur lors du téléchargement du fichier PDF",
                description: error.response?.data?.message,
            })
        },
    })
}

export const useSendQuote = (quoteId: string) => {
    const queryClient = useQueryClient()
    const { toast } = useToast()
    return useMutation({
        mutationFn: () => api.post(`/quotes/${quoteId}/send`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["quotes", quoteId] })
            queryClient.invalidateQueries({ queryKey: ["quotes"] })
            toast({
                title: "Fichier PDF envoyé avec succès",
                description: "Le fichier PDF a été envoyé avec succès",
            })
        },
        onError: (error: AxiosError<IApiErrorResponse>) => {
            toast({
                title: "Erreur lors de l'envoi du fichier PDF",
                description: error.response?.data?.message,
            })
        },
    })
} 


export const useViewQuote = () => {
    const { toast } = useToast()
    return useMutation({
        mutationFn: (quoteId: string) => api.getBinary(`/quotes/${quoteId}/pdf`),
        onSuccess: (data) => {
            const blob = new Blob([data.data], { type: 'application/pdf' })
            const url = window.URL.createObjectURL(blob)
            window.open(url, "_blank")
        },
        onError: (error: AxiosError<IApiErrorResponse>) => {
            toast({
                title: "Erreur lors de la visualisation du devis",
                description: error.response?.data?.message,
            })
        },
    })
}