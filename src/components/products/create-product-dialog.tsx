"use client"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useState } from "react"
import { AxiosError } from "axios"

import { useCreateProduct } from "@/hooks/useProduct"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

import { Plus } from "lucide-react"

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


export function CreateProductDialog() {
  const createProduct = useCreateProduct()
  const [apiErrors, setApiErrors] = useState<ApiError[]>([])

  const { register, handleSubmit,setValue, reset, formState: { errors } } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      description: "",
      price_excluding_tax: 0,
      vat_rate: 5.5,
    },
  })

  const onSubmit = (data: ProductFormData) => {
    setApiErrors([])
    createProduct.mutate(data, {
      onSuccess: () => {
        reset()
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
    <Dialog>
      <DialogTrigger asChild>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Nouveau produit
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Créer un nouveau produit</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 py-4">
        {apiErrors.length > 0 && (
            <Alert variant="destructive">
              <AlertTitle>Erreurs</AlertTitle>
              <AlertDescription>
                {apiErrors.map((error, index) => (
                  <p key={index} >
                    {error.field ? `${error.message}` : error.message}
                </p>
              ))}
              </AlertDescription>
            </Alert>
        )}
          <div className="grid gap-2">
            <Label htmlFor="name">Nom</Label>
            <Input id="name" {...register("name")} />
            {errors.name && (
              <p className="text-red-500 text-xs">{errors.name.message}</p>
            )}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" {...register("description")} />
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
              onValueChange={(value) => setValue('vat_rate', Number(value))} 
              defaultValue="5.5"
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
          <Button type="submit" disabled={createProduct.isPending}>
            {createProduct.isPending ? "Création..." : "Créer"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
} 