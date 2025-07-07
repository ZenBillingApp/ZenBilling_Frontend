"use client";

import { vatRateToNumber } from "@/types/Product.interface";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import {
  useUpdateProduct,
  useProductUnits,
  useProductVatRates,
  useGenerateProductDescription,
  useGenerateProductDescriptionSuggestions,
} from "@/hooks/useProduct";
import { useFormat } from "@/hooks/useFormat";
import { IProduct, ProductUnit, VatRate } from "@/types/Product.interface";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Textarea } from "@/components/ui/textarea";
import { useState, useEffect } from "react";
import { AxiosError } from "axios";
import { Sparkles, Loader2, RotateCcw } from "lucide-react";

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
  price_excluding_tax: z
    .number()
    .min(0, "Le prix doit être positif")
    .max(1000000, "Le prix ne peut pas dépasser 1 000 000 €"),
  vat_rate: z.custom<VatRate>(),
  unit: z.custom<ProductUnit>(),
});

type ProductFormData = z.infer<typeof productSchema>;

interface EditProductDialogProps {
  product: IProduct;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (updatedProduct: IProduct) => void;
}

export function EditProductDialog({
  product,
  isOpen,
  onClose,
  onSuccess,
}: EditProductDialogProps) {
  const { formatPercent } = useFormat();
  const { mutate: updateProduct, isPending } = useUpdateProduct(
    product.product_id!
  );
  const generateDescription = useGenerateProductDescription();
  const generateSuggestions = useGenerateProductDescriptionSuggestions();
  const { data: units } = useProductUnits();
  const { data: vatRates } = useProductVatRates();
  const [apiErrors, setApiErrors] = useState<ApiError[]>([]);
  const [vatValue, setVatValue] = useState<string>("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [additionalInfo, setAdditionalInfo] = useState("");

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    watch,
    formState: { errors },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: product.name,
      description: product.description || "",
      price_excluding_tax: product.price_excluding_tax,
      vat_rate: product.vat_rate,
      unit: product.unit,
    },
  });

  const productName = watch("name");

  // Initialiser la valeur de la TVA au montage et quand le produit change
  useEffect(() => {
    const formattedVat = product.vat_rate.toString();
    setVatValue(formattedVat);
    setValue("vat_rate", product.vat_rate);
  }, [product, setValue]);

  const handleGenerateDescription = () => {
    if (!productName.trim()) {
      setApiErrors([{ message: "Veuillez saisir un nom de produit avant de générer une description" }]);
      return;
    }

    generateDescription.mutate({
      productName: productName.trim(),
      additionalInfo: additionalInfo.trim() || undefined,
    }, {
      onSuccess: (response) => {
        if (response.data?.description) {
          setValue("description", response.data.description);
        }
        setApiErrors([]);
      }
    });
  };

  const handleGenerateSuggestions = () => {
    if (!productName.trim()) {
      setApiErrors([{ message: "Veuillez saisir un nom de produit avant de générer des suggestions" }]);
      return;
    }

    generateSuggestions.mutate({
      productName: productName.trim(),
      additionalInfo: additionalInfo.trim() || undefined,
    }, {
      onSuccess: (response) => {
        if (response.data?.suggestions) {
          setSuggestions(response.data.suggestions);
          setShowSuggestions(true);
        }
        setApiErrors([]);
      }
    });
  };

  const handleSelectSuggestion = (suggestion: string) => {
    setValue("description", suggestion);
    setShowSuggestions(false);
    setSuggestions([]);
  };

  const resetAI = () => {
    setSuggestions([]);
    setShowSuggestions(false);
    setAdditionalInfo("");
  };

  // Réinitialiser le formulaire à la fermeture
  const handleClose = () => {
    reset();
    setApiErrors([]);
    resetAI();
    onClose();
  };

  const onSubmit = (data: ProductFormData) => {
    setApiErrors([]);

    const formattedData = {
      ...data,
      price_excluding_tax: Number(data.price_excluding_tax.toFixed(2)),
      vat_rate: data.vat_rate,
    };

    updateProduct(formattedData, {
      onSuccess: (response) => {
        if (onSuccess) {
          onSuccess(response.data as IProduct);
        }
        handleClose();
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
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="w-[90%] max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl">
            Modifier le produit
          </DialogTitle>
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

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="grid gap-3 sm:gap-4 py-2 sm:py-4"
        >
          <div className="grid gap-2">
            <Label htmlFor="name" className="text-sm sm:text-base">
              Nom
            </Label>
            <Input
              id="name"
              {...register("name")}
              placeholder="Nom du produit"
              className="text-sm sm:text-base"
            />
            {errors.name && (
              <p className="text-red-500 text-xs sm:text-sm">
                {errors.name.message}
              </p>
            )}
          </div>

          {/* Section IA pour la description */}
          <div className="grid gap-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="description" className="text-sm sm:text-base">
                Description
              </Label>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={resetAI}
                  disabled={generateDescription.isPending || generateSuggestions.isPending}
                >
                  <RotateCcw className="h-3 w-3 mr-1" />
                  Reset
                </Button>
              </div>
            </div>
            
            {/* Champ d'informations additionnelles pour l'IA */}
            <div className="space-y-2">
              <Input
                placeholder="Informations additionnelles pour l'IA (catégorie, caractéristiques...)"
                value={additionalInfo}
                onChange={(e) => setAdditionalInfo(e.target.value)}
                className="text-sm"
              />
              <div className="flex flex-col sm:flex-row gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleGenerateDescription}
                  disabled={generateDescription.isPending || generateSuggestions.isPending || !productName.trim()}
                  className="flex-1"
                >
                  {generateDescription.isPending ? (
                    <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                  ) : (
                    <Sparkles className="h-3 w-3 mr-1" />
                  )}
                  Générer description
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleGenerateSuggestions}
                  disabled={generateDescription.isPending || generateSuggestions.isPending || !productName.trim()}
                  className="flex-1"
                >
                  {generateSuggestions.isPending ? (
                    <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                  ) : (
                    <Sparkles className="h-3 w-3 mr-1" />
                  )}
                  Suggestions IA
                </Button>
              </div>
            </div>

            <Textarea
              id="description"
              {...register("description")}
              placeholder="Description du produit"
              className="text-sm sm:text-base min-h-[100px]"
            />
            {errors.description && (
              <p className="text-red-500 text-xs sm:text-sm">
                {errors.description.message}
              </p>
            )}

            {/* Affichage des suggestions */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="space-y-2 p-3 border rounded-lg bg-muted/50">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium">Suggestions IA :</h4>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowSuggestions(false)}
                  >
                    ×
                  </Button>
                </div>
                {suggestions.map((suggestion, index) => (
                  <div
                    key={index}
                    className="p-2 border rounded cursor-pointer hover:bg-background transition-colors"
                    onClick={() => handleSelectSuggestion(suggestion)}
                  >
                    <p className="text-sm">{suggestion}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Reste du formulaire inchangé */}
          <div className="grid gap-2">
            <Label htmlFor="price" className="text-sm sm:text-base">
              Prix HT
            </Label>
            <Input
              id="price"
              type="number"
              step="0.01"
              placeholder="0.00"
              className="text-sm sm:text-base"
              {...register("price_excluding_tax", { valueAsNumber: true })}
            />
            {errors.price_excluding_tax && (
              <p className="text-red-500 text-xs sm:text-sm">
                {errors.price_excluding_tax.message}
              </p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="vat" className="text-sm sm:text-base">
              TVA
            </Label>
            <Select
              value={vatValue}
              onValueChange={(value) => {
                setVatValue(value);
                setValue("vat_rate", value as VatRate);
              }}
            >
              <SelectTrigger id="vat" className="text-sm sm:text-base">
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
              <p className="text-red-500 text-xs sm:text-sm">
                {errors.vat_rate.message}
              </p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="unit" className="text-sm sm:text-base">
              Unité
            </Label>
            <Select
              defaultValue={product.unit}
              onValueChange={(value) => setValue("unit", value as ProductUnit)}
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
              <p className="text-red-500 text-xs sm:text-sm">
                {errors.unit.message}
              </p>
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
  );
}
