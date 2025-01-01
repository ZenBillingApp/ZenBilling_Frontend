import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { api } from "@/services/api"
import type { ICreateCustomerRequest } from "@/types/Customer.request.interface"
import type { IUpdateCustomerRequest } from "@/types/Customer.request.interface"




export const useCustomers = () => {
    return useQuery({
        queryKey: ["customers"],
        queryFn: () => api.get("/customers"),
        
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

export const useUpdateCustomer = (customerId: number) => {
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
