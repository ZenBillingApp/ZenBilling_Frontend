import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { api } from "@/services/api"
import type { ICreateInvoiceRequest, IUpdateInvoiceRequest } from "@/types/Invoice.request.interface"

export const useInvoices = () => {
    return useQuery({
        queryKey: ["invoices"],
        queryFn: () => api.get("/invoices"),
        
        staleTime: 1000 * 60 * 5, // 5 minutes
    })
}

export const useInvoice = (invoiceId: number) => {
    return useQuery({
        queryKey: ["invoices", invoiceId],
        queryFn: () => api.get(`/invoices/${invoiceId}`),
        enabled: !!invoiceId,
    })
}

export const useCreateInvoice = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (data: ICreateInvoiceRequest) => 
            api.post("/invoices", data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["invoices"] })
        },
    })
}

export const useUpdateInvoice = (invoiceId: number) => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (data: IUpdateInvoiceRequest) =>
            api.put(`/invoices/${invoiceId}`, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["invoices", invoiceId] })
            queryClient.invalidateQueries({ queryKey: ["invoices"] })
        },
    })
}

export const useDeleteInvoice = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (invoiceId: number) =>
            api.delete(`/invoices/${invoiceId}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["invoices"] })
        },
    })
}
