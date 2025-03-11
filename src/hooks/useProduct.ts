import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { api } from "@/services/api"
import type { ICreateProductRequest } from "@/types/Product.request.interface"
import type { IUpdateProductRequest } from "@/types/Product.request.interface"
import { useToast } from "@/hooks/use-toast"
import type { IApiErrorResponse } from "@/types/api.types"
interface ProductsQueryParams {
  page?: number;
  limit?: number;
  search?: string;
}

export const useProducts = (params: ProductsQueryParams = {}) => {
    const { page = 1, limit = 10, search = "" } = params;
    
    return useQuery({
        queryKey: ["products", { page, limit, search }],
        queryFn: () => api.get(`/products?page=${page}&limit=${limit}${search ? `&search=${search}` : ""}`),
        staleTime: 1000 * 60 * 5, // 5 minutes
    })
}

export const useProduct = (productId: string) => {
    return useQuery({
        queryKey: ["products", productId],
        queryFn: () => api.get(`/products/${productId}`),
        enabled: !!productId,
    })
}


export const useCreateProduct = () => {
    const queryClient = useQueryClient()
    const { toast } = useToast()
    return useMutation({
        mutationFn: (data: ICreateProductRequest) => 
            api.post("/products", data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["products"] })
            toast({
                title: "Produit créé avec succès",
                description: "Le produit a été créé avec succès",
            })
        },
    })
}

export const useUpdateProduct = (productId: string) => {
    const queryClient = useQueryClient()
    const { toast } = useToast()
    return useMutation({

        mutationFn: (data: IUpdateProductRequest) =>
            api.put(`/products/${productId}`, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["products"] })
            queryClient.invalidateQueries({ queryKey: ["product-details", productId] })
            toast({
                title: "Produit modifié avec succès",
                description: "Le produit a été modifié avec succès",
            })
        },
        
    })
}

export const useDeleteProduct = () => {
    const queryClient = useQueryClient()
    const { toast } = useToast()
    return useMutation({
        mutationFn: (productId: string) =>
            api.delete(`/products/${productId}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["products"] })

            toast({
                title: "Produit supprimé avec succès",
                description: "Le produit a été supprimé avec succès",
            })
        },
        onError: (error: IApiErrorResponse  ) => {
            toast({
                title: "Erreur lors de la suppression du produit",
                description: error.message,
            })
        },
    })
}

export const useProductDetails = (productId: string) => {
    return useQuery({
        queryKey: ["product-details", productId],
        queryFn: () => api.get(`/products/${productId}`),
        enabled: !!productId,
    })
}

export const useProductUnits = () => {
    return useQuery({
        queryKey: ["product-units"],
        queryFn: () => api.get("/products/units"),
    })
}

export const useProductVatRates = () => {
    return useQuery({
        queryKey: ["product-vat-rates"],
        queryFn: () => api.get("/products/vat-rates"),
    })
}
