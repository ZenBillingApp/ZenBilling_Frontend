import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { api } from "@/lib/api"
import type { ICreateInvoiceRequest, IUpdateInvoiceRequest, IInvoiceQueryParams, ISendInvoiceWithPaymentLinkRequest, ISendInvoiceWithPaymentLinkResponse } from "@/types/Invoice.request.interface"
import type { AddPaymentSchema } from "@/components/invoices/add-payment-dialog"
import { useToast } from "@/hooks/use-toast"
import { IInvoice,IInvoicePagination } from "@/types/Invoice.interface"
import type { IApiErrorResponse, IApiSuccessResponse } from "@/types/api.types"
import { AxiosError } from "axios"
import { useRouter } from "next/navigation"
import { useActiveOrganizationId } from "./useOrganization"
import { queryKeys } from "@/lib/queryKeys"

export const useInvoices = (params: IInvoiceQueryParams = {}) => {
    const { page = 1, limit = 10, search = "", status, customer_id, start_date, end_date, sortBy = 'invoice_date', sortOrder = 'DESC' } = params;
    const organizationId = useActiveOrganizationId();

    return useQuery({
        queryKey: queryKeys.invoices.list(organizationId, { page, limit, search, status, customer_id, start_date, end_date, sortBy, sortOrder }),
        queryFn: () => {
            let url = `/invoice?page=${page}&limit=${limit}&sortBy=${sortBy}&sortOrder=${sortOrder}`;
            if (search) url += `&search=${search}`;
            if (status) url += `&status=${status}`;
            if (customer_id) url += `&customer_id=${customer_id}`;
            if (start_date) url += `&start_date=${start_date}`;
            if (end_date) url += `&end_date=${end_date}`;
            return api.get<IApiSuccessResponse<IInvoicePagination>>(url);
        },
        enabled: !!organizationId,
        staleTime: 1000 * 60 * 5, // 5 minutes
    })
}

export const useInvoice = (invoiceId: string) => {
    const organizationId = useActiveOrganizationId();

    return useQuery<IApiSuccessResponse<IInvoice>>({
        queryKey: queryKeys.invoices.detail(organizationId, invoiceId),
        queryFn: () => api.get<IApiSuccessResponse<IInvoice>>(`/invoice/${invoiceId}`),
        enabled: !!invoiceId && !!organizationId,
    })
}

export const useCreateInvoice = () => {
    const queryClient = useQueryClient()
    const { toast } = useToast()
    const router = useRouter()
    const organizationId = useActiveOrganizationId()

    return useMutation<IApiSuccessResponse<IInvoice>, AxiosError<IApiErrorResponse>, ICreateInvoiceRequest>({
        mutationFn: (data: ICreateInvoiceRequest) =>
            api.post("/invoice", data),
        onSuccess: (invoice) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.invoices.all(organizationId) })
            queryClient.invalidateQueries({ queryKey: queryKeys.products.all(organizationId) })
            queryClient.invalidateQueries({ queryKey: queryKeys.customers.all(organizationId) })
            toast({
                title: "Facture créée avec succès",
                description: "La facture a été créée avec succès",
            })
            router.replace(`/invoices/${invoice.data?.invoice_id}`)
        },
    })
}

export const useUpdateInvoice = (invoiceId: string) => {
    const queryClient = useQueryClient()
    const { toast } = useToast()
    const organizationId = useActiveOrganizationId()

    return useMutation<IApiSuccessResponse<IInvoice>, AxiosError<IApiErrorResponse>, IUpdateInvoiceRequest>({

        mutationFn: (data: IUpdateInvoiceRequest) =>
            api.put(`/invoice/${invoiceId}`, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.invoices.detail(organizationId, invoiceId) })
            queryClient.invalidateQueries({ queryKey: queryKeys.invoices.all(organizationId) })
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
    const router = useRouter()
    const organizationId = useActiveOrganizationId()

    return useMutation<IApiSuccessResponse<IInvoice>, AxiosError<IApiErrorResponse>, string>({
        mutationFn: (invoiceId: string) =>
            api.delete(`/invoice/${invoiceId}`),
        onSuccess: (_, invoiceId) => {

            router.replace('/invoices')

            // Supprime explicitement les données du cache pour cette facture
            queryClient.removeQueries({ queryKey: queryKeys.invoices.detail(organizationId, invoiceId) })

            // Invalide la liste des factures pour la mettre à jour
            queryClient.invalidateQueries({ queryKey: queryKeys.invoices.all(organizationId) })

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
            const response = await api.getBinary(`/invoice/${invoiceId}/pdf`)
            

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
    const organizationId = useActiveOrganizationId()

    return useMutation<IApiSuccessResponse<IInvoice>, AxiosError<IApiErrorResponse>, AddPaymentSchema>({

        mutationFn: (data: AddPaymentSchema) =>
            api.post(`/invoice/${invoiceId}/payments`, {
                ...data,
                amount: Number(data.amount)
            }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.invoices.detail(organizationId, invoiceId) })
            queryClient.invalidateQueries({ queryKey: queryKeys.invoices.all(organizationId) })
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
    const organizationId = useActiveOrganizationId()

    return useMutation<IApiSuccessResponse<IInvoice>, AxiosError<IApiErrorResponse>, string>({

        mutationFn: () => api.post(`/invoice/${invoiceId}/send`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.invoices.detail(organizationId, invoiceId) })
            queryClient.invalidateQueries({ queryKey: queryKeys.invoices.all(organizationId) })
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
        mutationFn: (invoiceId: string) => api.getBinary(`/invoice/${invoiceId}/pdf`),
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

export const useCustomerInvoices = (customerId: string, params: IInvoiceQueryParams = {}) => {
    const { page = 1, limit = 10, search = "", status, customer_id, start_date, end_date, sortBy = 'invoice_date', sortOrder = 'DESC' } = params;
    const organizationId = useActiveOrganizationId();

    return useQuery<IApiSuccessResponse<IInvoicePagination>, AxiosError<IApiErrorResponse>> ({
        queryKey: queryKeys.invoices.customerInvoices(organizationId, customerId, { page, limit, search, status, customer_id, start_date, end_date, sortBy, sortOrder }),
        queryFn: () => {
            let url = `/invoice/customer/${customerId}?page=${page}&limit=${limit}&sortBy=${sortBy}&sortOrder=${sortOrder}`;
            if (search) url += `&search=${search}`;
            if (status) url += `&status=${status}`;
            if (customer_id) url += `&customer_id=${customer_id}`;
            if (start_date) url += `&start_date=${start_date}`;
            if (end_date) url += `&end_date=${end_date}`;
            return api.get<IApiSuccessResponse<IInvoicePagination>>(url);
        },
        enabled: !!customerId && !!organizationId,
        staleTime: 1000 * 60 * 5, // 5 minutes
    })
}

export const useCancelInvoice = (invoiceId: string) => {
    const queryClient = useQueryClient()
    const { toast } = useToast()
    const organizationId = useActiveOrganizationId()

    return useMutation<IApiSuccessResponse<IInvoice>, AxiosError<IApiErrorResponse>, void>({
        mutationFn: () =>
            api.put(`/invoice/${invoiceId}`, { status: 'cancelled' }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.invoices.detail(organizationId, invoiceId) })
            queryClient.invalidateQueries({ queryKey: queryKeys.invoices.all(organizationId) })
            toast({
                title: "Facture annulée avec succès",
                description: "La facture a été annulée avec succès",
            })
        },
        onError: (error: AxiosError<IApiErrorResponse>) => {
            toast({
                title: "Erreur lors de l'annulation de la facture",
                description: error.response?.data?.message,
            })
        },
    })
}

// Nouveau hook pour l'envoi avec lien de paiement
export const useSendInvoiceWithPaymentLink = (invoiceId: string) => {
    const queryClient = useQueryClient()
    const { toast } = useToast()
    const organizationId = useActiveOrganizationId()

    return useMutation<IApiSuccessResponse<ISendInvoiceWithPaymentLinkResponse>, AxiosError<IApiErrorResponse>, ISendInvoiceWithPaymentLinkRequest>({
        mutationFn: (data: ISendInvoiceWithPaymentLinkRequest) =>
                api.post(`/invoice/${invoiceId}/send-with-payment-link`, data),
        onSuccess: (response) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.invoices.detail(organizationId, invoiceId) })
            queryClient.invalidateQueries({ queryKey: queryKeys.invoices.all(organizationId) })

            const message = response.data?.paymentLinkCreated
                ? "Facture envoyée avec lien de paiement avec succès"
                : "Facture envoyée avec succès"

            toast({
                title: "Envoi réussi",
                description: message,
            })
        },
        onError: (error: AxiosError<IApiErrorResponse>) => {
            toast({
                title: "Erreur lors de l'envoi de la facture",
                description: error.response?.data?.message || "Une erreur est survenue lors de l'envoi",
                variant: "destructive"
            })
        },
    })
}
