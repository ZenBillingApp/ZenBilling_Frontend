import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { api } from "@/services/api"
import type { ICreateCustomerRequest, IUpdateCustomerRequest } from "@/types/Customer.request.interface"
import {  useToast } from "@/hooks/use-toast"
import { ICustomer } from "@/types/Customer.interface"
import { IApiErrorResponse } from "@/types/api.types"

interface CustomersQueryParams {
    page?: number;
    limit?: number;
    search?: string;
    type?: 'individual' | 'company';
}

export const useCustomers = (params: CustomersQueryParams = {}) => {
    const { page = 1, limit = 10, search = "", type } = params;
    
    return useQuery({
        queryKey: ["customers", { page, limit, search, type }],
        queryFn: () => {
            let url = `/customers?page=${page}&limit=${limit}`;
            if (search) url += `&search=${search}`;
            if (type) url += `&type=${type}`;
            return api.get(url);
        },
        staleTime: 1000 * 60 * 5, // 5 minutes
    })
}

export const useCustomer = (customerId: string) => {
        return useQuery<{ data: ICustomer }>({
            queryKey: ["customers", customerId],
        queryFn: () => api.get(`/customers/${customerId}`),
        enabled: !!customerId,
    })
}

export const useCreateCustomer = () => {
    const queryClient = useQueryClient()
    const { toast } = useToast()
    return useMutation({
        mutationFn: (data: ICreateCustomerRequest) => 
            api.post("/customers", data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["customers"] })
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
    return useMutation({

        mutationFn: (data: IUpdateCustomerRequest) =>
            api.put(`/customers/${customerId}`, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["customers", customerId] })
            queryClient.invalidateQueries({ queryKey: ["customers"] })
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
    return useMutation({
        mutationFn: (customerId: string) =>
            api.delete(`/customers/${customerId}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["customers"] })

            toast({
                title: "Client supprimé avec succès",
                description: "Le client a été supprimé avec succès",
            })
        },
        onError: (error: IApiErrorResponse) => {
            toast({
                title: "Erreur lors de la suppression du client",
                description: error.message,
            })
        },
    })
}
