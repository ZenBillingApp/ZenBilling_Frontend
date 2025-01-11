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
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
import { useUpdateProduct, useProductUnits } from "@/hooks/useProduct"
import { IProduct, ProductUnit } from "@/types/Product.interface"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Textarea } from "@/components/ui/textarea"
import { useState, useEffect } from "react"
import { AxiosError } from "axios"

// Constantes
const VAT_RATES = [
  { value: "0.00", label: "0%" },
  { value: "5.50", label: "5.5%" },
  { value: "10.00", label: "10%" },
  { value: "20.00", label: "20%" },
] as const;

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
  price_excluding_tax: z.number().min(0, "Le prix doit être positif").max(1000000, "Le prix ne peut pas dépasser 1 000 000 €"),
  vat_rate: z.number().min(0, "La TVA doit être positive").max(100, "La TVA ne peut pas dépasser 100%"),
  unit: z.custom<ProductUnit | undefined>()
})

type ProductFormData = z.infer<typeof productSchema>

interface EditProductDialogProps {
  product: IProduct
  isOpen: boolean
  onClose: () => void
  onSuccess?: (updatedProduct: IProduct) => void
}

export function EditProductDialog({ product, isOpen, onClose, onSuccess }: EditProductDialogProps) {
  const { mutate: updateProduct, isPending } = useUpdateProduct(product.product_id!)
  const { data: units } = useProductUnits()
  const [apiErrors, setApiErrors] = useState<ApiError[]>([])
  const [vatValue, setVatValue] = useState<string>("")

  const { 
    register, 
    handleSubmit, 
    setValue, 
    reset,
    formState: { errors } 
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: product.name,
      description: product.description || "",
      price_excluding_tax: product.price_excluding_tax,
      vat_rate: product.vat_rate,
      unit: product.unit
    },
  })

  // Initialiser la valeur de la TVA au montage et quand le produit change
  useEffect(() => {
    const formattedVat = product.vat_rate.toString()
    setVatValue(formattedVat)
    setValue('vat_rate', Number(formattedVat))
  }, [product, setValue])

  // Réinitialiser le formulaire à la fermeture
  const handleClose = () => {
    reset()
    setApiErrors([])
    onClose()
  }
  
  const onSubmit = (data: ProductFormData) => {
    setApiErrors([])
    
    // Formater les données avant l'envoi
    const formattedData = {
      ...data,
      price_excluding_tax: Number(data.price_excluding_tax.toFixed(2)),
      vat_rate: Number(Number(data.vat_rate).toFixed(2))
    }

    updateProduct(formattedData, {
      onSuccess: (response) => {
        if (onSuccess) {
          onSuccess(response.data.product)
        }
        handleClose()
      },
      onError: (error: Error) => {
        const axiosError = error as AxiosError<ApiErrorResponse>
        if (axiosError.response?.data?.errors) {
          setApiErrors(axiosError.response.data.errors)
        }
      }
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="w-[90%] max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl">Modifier le produit</DialogTitle>
        </DialogHeader>
        
        {apiErrors.length > 0 && (
          <Alert variant="destructive">
            <AlertTitle>Erreurs</AlertTitle>
            <AlertDescription>
              {apiErrors.map((error, index) => (
                <p key={index} className="mt-1">
                  {error.field ? `${error.message}` : error.message}
                </p>
              ))}
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-3 sm:gap-4 py-2 sm:py-4">
          <div className="grid gap-2">
            <Label htmlFor="name" className="text-sm sm:text-base">Nom</Label>
            <Input 
              id="name" 
              {...register("name")}
              placeholder="Nom du produit"
              className="text-sm sm:text-base" 
            />
            {errors.name && (
              <p className="text-red-500 text-xs sm:text-sm">{errors.name.message}</p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="description" className="text-sm sm:text-base">Description</Label>
            <Textarea 
              id="description" 
              {...register("description")}
              placeholder="Description du produit"
              className="text-sm sm:text-base min-h-[100px]" 
            />
            {errors.description && (
              <p className="text-red-500 text-xs sm:text-sm">{errors.description.message}</p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="price" className="text-sm sm:text-base">Prix HT</Label>
            <Input
              id="price"
              type="number"
              step="0.01"
              placeholder="0.00"
              className="text-sm sm:text-base"
              {...register("price_excluding_tax", { valueAsNumber: true })}
            />
            {errors.price_excluding_tax && (
              <p className="text-red-500 text-xs sm:text-sm">{errors.price_excluding_tax.message}</p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="vat" className="text-sm sm:text-base">TVA</Label>
            <Select
              value={vatValue}
              onValueChange={(value) => {
                setVatValue(value)
                setValue('vat_rate', Number(value))
              }}
            >
              <SelectTrigger id="vat" className="text-sm sm:text-base">
                <SelectValue placeholder="Sélectionner un taux de TVA" />
              </SelectTrigger>
              <SelectContent>
                {VAT_RATES.map(({ value, label }) => (
                  <SelectItem key={value} value={value} className="text-sm sm:text-base">
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.vat_rate && (
              <p className="text-red-500 text-xs sm:text-sm">{errors.vat_rate.message}</p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="unit" className="text-sm sm:text-base">Unité</Label>
            <Select
              defaultValue={product.unit}
              onValueChange={(value) => setValue('unit', value as ProductUnit)}
            >
              <SelectTrigger id="unit" className="text-sm sm:text-base">
                <SelectValue placeholder="Sélectionner une unité" />
              </SelectTrigger>
              <SelectContent>
               
                {units?.data?.units?.map((unit: ProductUnit) => (
                  <SelectItem key={unit} value={unit}>
                    {unit}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.unit && (
              <p className="text-red-500 text-xs sm:text-sm">{errors.unit.message}</p>
            )}
          </div>

          <Button 
            type="submit" 
            disabled={isPending}
            className="w-full mt-2 text-sm sm:text-base"
          >
            {isPending ? "Modification en cours..." : "Modifier"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}