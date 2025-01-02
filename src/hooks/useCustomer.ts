import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { api } from "@/services/api"
import type { ICreateCustomerRequest, IUpdateCustomerRequest } from "@/types/Customer.request.interface"

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

export const useCustomer = (customerId: number) => {
    return useQuery({
        queryKey: ["customers", customerId],
        queryFn: () => api.get(`/customers/${customerId}`),
        enabled: !!customerId,
    })
}

export const useCreateCustomer = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (data: ICreateCustomerRequest) => 
            api.post("/customers", data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["customers"] })
        },
    })
}

export const useUpdateCustomer = (customerId: number | undefined) => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (data: IUpdateCustomerRequest) =>
            api.put(`/customers/${customerId}`, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["customers", customerId] })
            queryClient.invalidateQueries({ queryKey: ["customers"] })
        },
    })
}

export const useDeleteCustomer = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (customerId: number) =>
            api.delete(`/customers/${customerId}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["customers"] })
        },
    })
}
