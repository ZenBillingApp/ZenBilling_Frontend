"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useState } from "react";
import { AxiosError } from "axios";

import {
  useCreateProduct,
  useProductUnits,
  useProductVatRates,
} from "@/hooks/useProduct";
import { useFormat } from "@/hooks/useFormat";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  ProductUnit,
  VatRate,
  vatRateToNumber,
} from "@/types/Product.interface";

interface ApiError {
  field?: string;
  message: string;
}

interface ApiErrorResponse {
  errors?: ApiError[];
}

const productSchema = z.object({
  name: z
    .string()
    .min(1, "Le nom est requis")
    .max(100, "Le nom ne peut pas dépasser 100 caractères"),
  description: z
    .string()
    .max(1000, "La description ne peut pas dépasser 1000 caractères")
    .optional(),
  price_excluding_tax: z.number().min(1, "Le prix est requis"),
  vat_rate: z.custom<VatRate>((val) => {
    const validRates: VatRate[] = [
      "ZERO",
      "REDUCED_1",
      "REDUCED_2",
      "REDUCED_3",
      "STANDARD",
    ];
    return validRates.includes(val as VatRate);
  }, "Taux de TVA invalide"),
  unit: z.custom<ProductUnit | undefined>(),
});

type ProductFormData = z.infer<typeof productSchema>;

interface CreateProductDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trigger: React.ReactNode;
}

export function CreateProductDialog({
  open,
  onOpenChange,
  trigger,
}: CreateProductDialogProps) {
  const createProduct = useCreateProduct();
  const { data: units } = useProductUnits();
  const { data: vatRates } = useProductVatRates();
  const { formatPercent } = useFormat();
  const [apiErrors, setApiErrors] = useState<ApiError[]>([]);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      description: "",
      price_excluding_tax: 0,
      vat_rate: "STANDARD",
      unit: "unite",
    },
  });

  const onSubmit = (data: ProductFormData) => {
    setApiErrors([]);
    createProduct.mutate(data, {
      onSuccess: () => {
        reset();
        onOpenChange(false);
      },
      onError: (error: Error) => {
        const axiosError = error as AxiosError<ApiErrorResponse>;
        if (axiosError.response?.data?.errors) {
          setApiErrors(axiosError.response.data.errors);
        }
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="w-[90%] max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Créer un nouveau produit</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 py-4">
          {apiErrors.length > 0 && (
            <Alert variant="destructive">
              <AlertTitle>Erreurs</AlertTitle>
              <AlertDescription>
                {apiErrors.map((error, index) => (
                  <p key={index}>
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
              <p className="text-red-500 italic text-xs">
                {errors.description.message}
              </p>
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
              <p className="text-red-500 italic text-xs">
                {errors.price_excluding_tax.message}
              </p>
            )}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="vat">TVA</Label>
            <Select
              onValueChange={(value) => setValue("vat_rate", value as VatRate)}
              defaultValue="STANDARD"
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner un taux de TVA" />
              </SelectTrigger>
              <SelectContent>
                {vatRates?.data?.vatRates?.map((rate: VatRate) => (
                  <SelectItem key={rate} value={rate}>
                    {formatPercent(vatRateToNumber(rate))}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.vat_rate && (
              <p className="text-red-500 italic text-xs">
                {errors.vat_rate.message}
              </p>
            )}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="unit">Unité</Label>
            <Select
              onValueChange={(value) => setValue("unit", value as ProductUnit)}
              defaultValue="unite"
            >
              <SelectTrigger>
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
              <p className="text-red-500 italic text-xs">
                {errors.unit.message}
              </p>
            )}
          </div>
          <Button type="submit" disabled={createProduct.isPending}>
            {createProduct.isPending ? "Création..." : "Créer"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
