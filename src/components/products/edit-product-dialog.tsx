"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useUpdateProduct } from "@/hooks/useProduct"
import { IProduct } from "@/types/Product.interface"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Textarea } from "@/components/ui/textarea"
import { useEffect, useState } from "react"
import { AxiosError } from "axios"

interface ApiError {
  field?: string;
  message: string;
}

interface ApiErrorResponse {
  errors?: ApiError[];
}

const productSchema = z.object({
  name: z.string().min(1, "Le nom est requis").max(100, "Le nom ne peut pas dépasser 100 caractères"),
  description: z.string().max(1000, "La description ne peut pas dépasser 1000 caractères").optional(),
  price_excluding_tax: z.number().min(0, "Le prix doit être positif"),
  vat_rate: z.number().min(0, "La TVA doit être positive").max(100, "La TVA ne peut pas dépasser 100%")
})

type ProductFormData = z.infer<typeof productSchema>

interface EditProductDialogProps {
  product: IProduct
  isOpen: boolean
  onClose: () => void
}

export function EditProductDialog({ product, isOpen, onClose }: EditProductDialogProps) {
  const updateProduct = useUpdateProduct(product.product_id!)
  const [apiErrors, setApiErrors] = useState<ApiError[]>([])
  const [vatValue, setVatValue] = useState<string>(product.vat_rate.toString())

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: product.name,
      description: product.description || "",
      price_excluding_tax: product.price_excluding_tax,
      vat_rate: product.vat_rate,
    },
  })

  
  useEffect(() => {
    const currentVat = product.vat_rate.toString()
    setVatValue(currentVat)
  }, [product.vat_rate])
  
  const onSubmit = (data: ProductFormData) => {
    setApiErrors([])
    updateProduct.mutate(data, {
      onSuccess: () => {
        onClose()
      },
      onError: (error: Error) => {
        const axiosError = error as AxiosError<ApiErrorResponse>;
        if (axiosError.response?.data?.errors) {
          setApiErrors(axiosError.response.data.errors)
        }
      }
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Modifier le produit</DialogTitle>
        </DialogHeader>
        {apiErrors.length > 0 && (
          <div className="bg-red-50 p-2 rounded space-y-1">
            {apiErrors.map((error, index) => (
              <p key={index} className="text-red-500 text-sm">
                {error.field ? `${error.message}` : error.message}
              </p>
            ))}
          </div>
        )}
        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Nom</Label>
            <Input id="name" {...register("name")} />
            {errors.name && (
              <p className="text-red-500 text-xs">{errors.name.message}</p>
            )}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" aria-describedby="description" {...register("description")} />
            {errors.description && (
              <p className="text-red-500 italic text-xs">{errors.description.message}</p>
            )}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="price">Prix HT</Label>
            <Input
              id="price"
              type="number"
              step="0.01"
              {...register("price_excluding_tax", { valueAsNumber: true })}
            />
            {errors.price_excluding_tax && (
              <p className="text-red-500 italic text-xs">{errors.price_excluding_tax.message}</p>
            )}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="vat">TVA</Label>
            <Select
              value={vatValue}
              onValueChange={(value) => {
                setVatValue(value)
                setValue('vat_rate', Number(value))
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner un taux de TVA" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">0%</SelectItem>
                <SelectItem value="5.5">5.5%</SelectItem>
                <SelectItem value="10">10%</SelectItem>
                <SelectItem value="20">20%</SelectItem>
              </SelectContent>
            </Select>
            {errors.vat_rate && (
              <p className="text-red-500 italic text-xs">{errors.vat_rate.message}</p>
            )}
          </div>
          <Button type="submit" disabled={updateProduct.isPending}>
            {updateProduct.isPending ? "Modification..." : "Modifier"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}