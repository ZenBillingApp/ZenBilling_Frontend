import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { api } from "@/lib/api"
import type { ICreateProductRequest, IUpdateProductRequest, IProductQueryParams, IGenerateDescriptionRequest, IGenerateDescriptionResponse, IGenerateDescriptionSuggestionsResponse } from "@/types/Product.request.interface"
import { useToast } from "@/hooks/use-toast"
import type { IApiErrorResponse,IApiSuccessResponse } from "@/types/api.types"
import { AxiosError } from "axios"
import { IProduct, IProductPagination, IProductUnit, IProductVatRate } from "@/types/Product.interface"
import { useActiveOrganizationId } from "./useOrganization"
import { queryKeys } from "@/lib/queryKeys"

export const useProducts = (params: IProductQueryParams = {}) => {
    const { page = 1, limit = 10, search = "" } = params;
    const organizationId = useActiveOrganizationId();

    return useQuery({
        queryKey: queryKeys.products.list(organizationId, { page, limit, search }),
        queryFn: () => {
            let url = `/product?page=${page}&limit=${limit}`;
            if (search) url += `&search=${search}`;
            return api.get<IApiSuccessResponse<IProductPagination>>(url);
        },
        enabled: !!organizationId,
        staleTime: 1000 * 60 * 5, // 5 minutes
    })
}

export const useProduct = (productId: string) => {
    const organizationId = useActiveOrganizationId();

    return useQuery<IApiSuccessResponse<IProduct>>({
        queryKey: queryKeys.products.detail(organizationId, productId),
        queryFn: () => api.get<IApiSuccessResponse<IProduct>>(`/product/${productId}`),
        enabled: !!productId && !!organizationId,
    })
}


export const useCreateProduct = () => {
    const queryClient = useQueryClient()
    const { toast } = useToast()
    const organizationId = useActiveOrganizationId()

    return useMutation<IApiSuccessResponse<IProduct>, AxiosError<IApiErrorResponse>, ICreateProductRequest>({
        mutationFn: (data: ICreateProductRequest) =>
            api.post("/product", data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.products.all(organizationId) })
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
    const organizationId = useActiveOrganizationId()

    return useMutation<IApiSuccessResponse<IProduct>, AxiosError<IApiErrorResponse>, IUpdateProductRequest>({

        mutationFn: (data: IUpdateProductRequest) =>
            api.put(`/product/${productId}`, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.products.all(organizationId) })
            queryClient.invalidateQueries({ queryKey: queryKeys.products.detail(organizationId, productId) })
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
    const organizationId = useActiveOrganizationId()

    return useMutation<IApiSuccessResponse<IProduct>, AxiosError<IApiErrorResponse>, string>({
        mutationFn: (productId: string) =>
            api.delete(`/product/${productId}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.products.all(organizationId) })

            toast({
                title: "Produit supprimé avec succès",
                description: "Le produit a été supprimé avec succès",
            })
        },
        onError: (error: AxiosError<IApiErrorResponse>) => {
            toast({
                title: "Erreur lors de la suppression du produit",
                description: error.response?.data?.message,
            })
        },
    })
}

export const useProductDetails = (productId: string) => {
    const organizationId = useActiveOrganizationId();

    return useQuery<IApiSuccessResponse<IProduct>>({
        queryKey: queryKeys.products.detail(organizationId, productId),
        queryFn: () => api.get<IApiSuccessResponse<IProduct>>(`/product/${productId}`),
        enabled: !!productId && !!organizationId,
    })
}

export const useProductUnits = () => {
    return useQuery<IApiSuccessResponse<IProductUnit>>({
        queryKey: queryKeys.products.units(),
        queryFn: () => api.get<IApiSuccessResponse<IProductUnit>>("/product/units"),
    })
}

export const useProductVatRates = () => {
        return useQuery<IApiSuccessResponse<IProductVatRate>>({
        queryKey: queryKeys.products.vatRates(),
        queryFn: () => api.get<IApiSuccessResponse<IProductVatRate>>("/product/vat-rates"),
    })
}

// Nouveaux hooks pour l'IA
export const useGenerateProductDescription = () => {
    const { toast } = useToast()
    return useMutation<IApiSuccessResponse<IGenerateDescriptionResponse>, AxiosError<IApiErrorResponse>, IGenerateDescriptionRequest>({
        mutationFn: (data: IGenerateDescriptionRequest) => 
            api.post("/product/ai/generate-description", data),
        onError: (error: AxiosError<IApiErrorResponse>) => {
            toast({
                title: "Erreur lors de la génération",
                description: error.response?.data?.message || "Une erreur est survenue lors de la génération de la description",
                variant: "destructive"
            })
        },
    })
}

export const useGenerateProductDescriptionSuggestions = () => {
    const { toast } = useToast()
    return useMutation<IApiSuccessResponse<IGenerateDescriptionSuggestionsResponse>, AxiosError<IApiErrorResponse>, IGenerateDescriptionRequest>({
        mutationFn: (data: IGenerateDescriptionRequest) => 
            api.post("/product/ai/generate-suggestions", data),
        onError: (error: AxiosError<IApiErrorResponse>) => {
            toast({
                title: "Erreur lors de la génération",
                description: error.response?.data?.message || "Une erreur est survenue lors de la génération des suggestions",
                variant: "destructive"
            })
        },
    })
}
