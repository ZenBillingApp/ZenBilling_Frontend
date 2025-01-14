import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { api } from "@/services/api"
import type { ICreateQuoteRequest, IUpdateQuoteRequest, IQuoteQueryParams } from "@/types/Quote.request.interface"

export const useQuotes = (params: IQuoteQueryParams = {}) => {
    const { page = 1, limit = 10, search = "", status, customer_id, start_date, end_date, sortBy = 'quote_date', sortOrder = 'DESC' } = params;

    return useQuery({
        queryKey: ["quotes", { page, limit, search, status, customer_id, start_date, end_date, sortBy, sortOrder }],
        queryFn: () => {
            let url = `/quotes?page=${page}&limit=${limit}&sortBy=${sortBy}&sortOrder=${sortOrder}`;
            if (search) url += `&search=${search}`;
            if (status) url += `&status=${status}`;
            if (customer_id) url += `&customer_id=${customer_id}`;
            if (start_date) url += `&start_date=${start_date}`;
            if (end_date) url += `&end_date=${end_date}`;
            return api.get(url);
        },
        staleTime: 1000 * 60 * 5, // 5 minutes
    })
}

export const useQuote = (quoteId: number) => {
    return useQuery({
        queryKey: ["quotes", quoteId],
        queryFn: () => api.get(`/quotes/${quoteId}`),
        enabled: !!quoteId,
    })
}

export const useCreateQuote = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (data: ICreateQuoteRequest) => 
            api.post("/quotes", data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["quotes"] })
            queryClient.invalidateQueries({ queryKey: ["products"] })
            queryClient.invalidateQueries({ queryKey: ["customers"] })
        },
    })
}

export const useUpdateQuote = (quoteId: number) => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (data: IUpdateQuoteRequest) =>
            api.put(`/quotes/${quoteId}`, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["quotes", quoteId] })
            queryClient.invalidateQueries({ queryKey: ["quotes"] })
        },
    })
}

export const useDeleteQuote = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (quoteId: number) =>
            api.delete(`/quotes/${quoteId}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["quotes"] })
        },
    })
}

export const useDownloadQuotePdf = (quoteNumber: string) => {
    return useMutation({
        mutationFn: async (quoteId: number) => {
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
        }
    })
}

export const useSendQuote = (quoteId: number) => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: () => api.post(`/quotes/${quoteId}/send`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["quotes", quoteId] })
            queryClient.invalidateQueries({ queryKey: ["quotes"] })
        },
    })
} 