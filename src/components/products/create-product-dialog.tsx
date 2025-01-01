"use client"

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
import { useCreateProduct } from "@/hooks/useProduct"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Textarea } from "@/components/ui/textarea"
import { Plus } from "lucide-react"

const productSchema = z.object({
  name: z.string().min(1, "Le nom est requis").max(100, "Le nom ne peut pas dépasser 100 caractères"),
  description: z.string().max(1000, "La description ne peut pas dépasser 1000 caractères").optional(),
  price_excluding_tax: z.number().min(0, "Le prix doit être positif"),
  vat_rate: z.number().min(0, "La TVA doit être positive").max(100, "La TVA ne peut pas dépasser 100%")
})

type ProductFormData = z.infer<typeof productSchema>


export function CreateProductDialog() {
  const createProduct = useCreateProduct()

  const { register, handleSubmit, reset, formState: { errors } } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      description: "",
      price_excluding_tax: 0,
      vat_rate: 5.5,
    },
  })

  const onSubmit = (data: ProductFormData) => {
    createProduct.mutate(data, {
      onSuccess: () => {
        reset()
      },
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
            <Input
              id="vat"
              type="number"
              step="0.1"
              {...register("vat_rate", { valueAsNumber: true })}
            />
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