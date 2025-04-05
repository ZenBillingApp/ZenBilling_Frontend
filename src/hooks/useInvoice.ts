import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { api } from "@/lib/api"
import type { ICreateInvoiceRequest, IUpdateInvoiceRequest, IInvoiceQueryParams } from "@/types/Invoice.request.interface"
import type { AddPaymentSchema } from "@/components/invoices/add-payment-dialog"
import { useToast } from "@/hooks/use-toast"
import { IInvoice,IInvoicePagination } from "@/types/Invoice.interface"
import type { IApiErrorResponse, IApiSuccessResponse } from "@/types/api.types"
import { AxiosError } from "axios"

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
            return api.get<IApiSuccessResponse<IInvoicePagination>>(url);
        },
        staleTime: 1000 * 60 * 5, // 5 minutes
    })
}

export const useInvoice = (invoiceId: string) => {
    return useQuery<IApiSuccessResponse<IInvoice>>({
        queryKey: ["invoices", invoiceId],
        queryFn: () => api.get<IApiSuccessResponse<IInvoice>>(`/invoices/${invoiceId}`),
        enabled: !!invoiceId,
    })
}

export const useCreateInvoice = () => {
    const queryClient = useQueryClient()
    const { toast } = useToast()
    return useMutation<IApiSuccessResponse<IInvoice>, AxiosError<IApiErrorResponse>, ICreateInvoiceRequest>({
        mutationFn: (data: ICreateInvoiceRequest) => 
            api.post("/invoices", data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["invoices"] })
            queryClient.invalidateQueries({ queryKey: ["products"] })
            queryClient.invalidateQueries({ queryKey: ["customers"] })
            toast({
                title: "Facture créée avec succès",
                description: "La facture a été créée avec succès",
            })
        },
    })
}

export const useUpdateInvoice = (invoiceId: string) => {
    const queryClient = useQueryClient()
    const { toast } = useToast()
    return useMutation<IApiSuccessResponse<IInvoice>, AxiosError<IApiErrorResponse>, IUpdateInvoiceRequest>({

        mutationFn: (data: IUpdateInvoiceRequest) =>
            api.put(`/invoices/${invoiceId}`, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["invoices", invoiceId] })
            queryClient.invalidateQueries({ queryKey: ["invoices"] })
            toast({
                title: "Facture modifiée avec succès",
                description: "La facture a été modifiée avec succès",
            })
        },
    })
}

export const useDeleteInvoice = () => {
    const queryClient = useQueryClient()
    const { toast } = useToast()
    return useMutation<IApiSuccessResponse<IInvoice>, AxiosError<IApiErrorResponse>, string>({
        mutationFn: (invoiceId: string) =>
            api.delete(`/invoices/${invoiceId}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["invoices"] })

            toast({
                title: "Facture supprimée avec succès",
                description: "La facture a été supprimée avec succès",
            })
        },
        onError: (error: AxiosError<IApiErrorResponse>) => {
            toast({
                title: "Erreur lors de la suppression de la facture",
                description: error.response?.data?.message,
            })
        },
    })
}

export const useDownloadInvoicePdf = (invoiceNumber: string) => {
    const { toast } = useToast()
    return useMutation({
        mutationFn: async (invoiceId: string) => {
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

export const useAddPayment = (invoiceId: string) => {
    const queryClient = useQueryClient()
    const { toast } = useToast()
    return useMutation<IApiSuccessResponse<IInvoice>, IApiErrorResponse, AddPaymentSchema>({

        mutationFn: (data: AddPaymentSchema) =>
            api.post(`/invoices/${invoiceId}/payments`, {
                ...data,
                amount: Number(data.amount)
            }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["invoices", invoiceId] })
            queryClient.invalidateQueries({ queryKey: ["invoices"] })
            toast({
                title: "Paiement ajouté avec succès",
                description: "Le paiement a été ajouté avec succès",
            })
        },
    })
}

export const useSendInvoice = (invoiceId: string) => {
    const queryClient = useQueryClient()
    const { toast } = useToast()
    return useMutation<IApiSuccessResponse<IInvoice>, AxiosError<IApiErrorResponse>, string>({

        mutationFn: () => api.post(`/invoices/${invoiceId}/send`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["invoices", invoiceId] })
            queryClient.invalidateQueries({ queryKey: ["invoices"] })
            toast({
                title: "Fichier PDF envoyé avec succès",
                description: "Le fichier PDF a été envoyé avec succès",
            })
        },
        onError: (error: AxiosError<IApiErrorResponse>) => {
            console.log(error)
            toast({
                title: "Erreur lors de l'envoi du fichier PDF",
                description: error.response?.data?.message,
            })
        },
    })
}

export const useViewInvoice = () => {
    const { toast } = useToast()
    return useMutation({
        mutationFn: (invoiceId: string) => api.getBinary(`/invoices/${invoiceId}/pdf`),
        onSuccess: (data) => {
            const blob = new Blob([data.data], { type: 'application/pdf' })
            const url = window.URL.createObjectURL(blob)
            window.open(url, "_blank")
        },
        onError: (error: AxiosError<IApiErrorResponse>) => {
            toast({
                title: "Erreur lors de la visualisation de la facture",
                description: error.response?.data?.message,
            })
        },
    })
}

