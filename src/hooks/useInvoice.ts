import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { api } from "@/services/api"
import type { ICreateInvoiceRequest, IUpdateInvoiceRequest, IInvoiceQueryParams } from "@/types/Invoice.request.interface"
import type { AddPaymentSchema } from "@/components/invoices/add-payment-dialog"

export const useInvoices = (params: IInvoiceQueryParams = {}) => {
    const { page = 1, limit = 10, search = "", status, customer_id, start_date, end_date, sortBy = 'invoice_date', sortOrder = 'DESC' } = params;

    return useQuery({
        queryKey: ["invoices", { page, limit, search, status, customer_id, start_date, end_date, sortBy, sortOrder }],
        queryFn: () => {
            let url = `/invoices?page=${page}&limit=${limit}&sortBy=${sortBy}&sortOrder=${sortOrder}`;
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
            queryClient.invalidateQueries({ queryKey: ["products"] })
            queryClient.invalidateQueries({ queryKey: ["customers"] })
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

export const useDownloadInvoicePdf = (invoiceNumber: string) => {
    return useMutation({
        mutationFn: async (invoiceId: number) => {
            const response = await api.getBinary(`/invoices/${invoiceId}/pdf`)
            
            // Créer un URL pour le blob
            const blob = new Blob([response.data], { type: 'application/pdf' })
            const url = window.URL.createObjectURL(blob)
            
            // Créer un lien temporaire et cliquer dessus
            const link = document.createElement('a')
            link.href = url
            link.setAttribute('download', `${invoiceNumber}.pdf`)
            document.body.appendChild(link)
            link.click()
            
            // Nettoyer
            document.body.removeChild(link)
            window.URL.revokeObjectURL(url)
            
            return response
        }
    })
}

export const useAddPayment = (invoiceId: number) => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (data: AddPaymentSchema) =>
            api.post(`/invoices/${invoiceId}/payments`, {
                ...data,
                amount: Number(data.amount)
            }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["invoices", invoiceId] })
            queryClient.invalidateQueries({ queryKey: ["invoices"] })
        },
    })
}

export const useSendInvoice = (invoiceId: number) => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: () => api.post(`/invoices/${invoiceId}/send`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["invoices", invoiceId] })
            queryClient.invalidateQueries({ queryKey: ["invoices"] })
        },
    })
}

