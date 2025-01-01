import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { api } from "@/services/api"
import type { ICreateProductRequest } from "@/types/Product.request.interface"
import type { IUpdateProductRequest } from "@/types/Product.request.interface"



export const useProducts = () => {
    return useQuery({
        queryKey: ["products"],
        queryFn: () => api.get("/products"),
        
        staleTime: 1000 * 60 * 5, // 5 minutes
    })
}

export const useProduct = (productId: number) => {
    return useQuery({
        queryKey: ["products", productId],
        queryFn: () => api.get(`/products/${productId}`),
        enabled: !!productId,
    })
}

export const useCreateProduct = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (data: ICreateProductRequest) => 
            api.post("/products", data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["products"] })
        },
    })
}

export const useUpdateProduct = (productId: number) => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (data: IUpdateProductRequest) =>
            api.put(`/products/${productId}`, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["products", productId] })
            queryClient.invalidateQueries({ queryKey: ["products"] })
        },
        
    })
}

export const useDeleteProduct = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (productId: number) =>
            api.delete(`/products/${productId}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["products"] })
        },
    })
}
