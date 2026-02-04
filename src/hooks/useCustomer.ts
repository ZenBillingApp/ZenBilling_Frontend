import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { api } from "@/lib/api"
import type { ICreateCustomerRequest, IUpdateCustomerRequest, ICustomerQueryParams } from "@/types/Customer.request.interface"
import {  useToast } from "@/hooks/use-toast"
import { ICustomer, ICustomerPagination } from "@/types/Customer.interface"
import type { IApiErrorResponse,IApiSuccessResponse } from "@/types/api.types"
import { AxiosError } from "axios"
import { useActiveOrganizationId } from "./useOrganization"
import { queryKeys } from "@/lib/queryKeys"


export const useCustomers = (params: ICustomerQueryParams = {}) => {
    const { page = 1, limit = 10, search = "", type } = params;
    const organizationId = useActiveOrganizationId();

    return useQuery<IApiSuccessResponse<ICustomerPagination>>({
        queryKey: queryKeys.customers.list(organizationId, { page, limit, search, type }),
        queryFn: () => {
            let url = `/customers?page=${page}&limit=${limit}`;
            if (search) url += `&search=${search}`;
            if (type) url += `&type=${type}`;
            return api.get<IApiSuccessResponse<ICustomerPagination>>(url);
        },
        enabled: !!organizationId,
        staleTime: 1000 * 60 * 5, // 5 minutes
    })
}

export const useCustomer = (customerId: string) => {
    const organizationId = useActiveOrganizationId();

    return useQuery<IApiSuccessResponse<ICustomer>>({
        queryKey: queryKeys.customers.detail(organizationId, customerId),
        queryFn: () => api.get<IApiSuccessResponse<ICustomer>>(`/customers/${customerId}`),
        enabled: !!customerId && !!organizationId,
    })
}

export const useCreateCustomer = () => {
    const queryClient = useQueryClient()
    const { toast } = useToast()
    const organizationId = useActiveOrganizationId()

    return useMutation<IApiSuccessResponse<ICustomer>, AxiosError<IApiErrorResponse>, ICreateCustomerRequest>({
        mutationFn: (data: ICreateCustomerRequest) =>
            api.post("/customers", data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.customers.all(organizationId) })
            toast({
                title: "Client créé avec succès",
                description: "Le client a été créé avec succès",
            })
        },
    })
}

export const useUpdateCustomer = (customerId: string | undefined) => {
    const queryClient = useQueryClient()
    const { toast } = useToast()
    const organizationId = useActiveOrganizationId()

    return useMutation<IApiSuccessResponse<ICustomer>, AxiosError<IApiErrorResponse>, IUpdateCustomerRequest>({

        mutationFn: (data: IUpdateCustomerRequest) =>
            api.put(`/customers/${customerId}`, data),
        onSuccess: () => {
            if (customerId) {
                queryClient.invalidateQueries({ queryKey: queryKeys.customers.detail(organizationId, customerId) })
            }
            queryClient.invalidateQueries({ queryKey: queryKeys.customers.all(organizationId) })
            toast({
                title: "Client modifié avec succès",
                description: "Le client a été modifié avec succès",
            })
        },
    })
}

export const useDeleteCustomer = () => {
    const queryClient = useQueryClient()
    const { toast } = useToast()
    const organizationId = useActiveOrganizationId()

    return useMutation<IApiSuccessResponse<ICustomer>, AxiosError<IApiErrorResponse>, string>({
        mutationFn: (customerId: string) =>
            api.delete(`/customers/${customerId}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.customers.all(organizationId) })

            toast({
                title: "Client supprimé avec succès",
                description: "Le client a été supprimé avec succès",
            })
        },
        onError: (error: AxiosError<IApiErrorResponse>) => {
            toast({
                title: "Erreur lors de la suppression du client",
                description: error.response?.data?.message,
            })
        },
    })
}
