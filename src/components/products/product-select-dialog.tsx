"use client";

import { useState } from "react";
import {
  useProducts,
  useProductUnits,
  useProductVatRates,
  useGenerateProductDescription,
  useGenerateProductDescriptionSuggestions,
} from "@/hooks/useProduct";
import { useDebounce } from "@/hooks/useDebounce";
import { useFormat } from "@/hooks/useFormat";
import { useForm, ControllerRenderProps } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import {
  VatRate,
  ProductUnit,
  vatRateToNumber,
} from "@/types/Product.interface";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Search, Sparkles, Loader2, RotateCcw } from "lucide-react";

import type { IProduct } from "@/types/Product.interface";

const newProductSchema = z.object({
  name: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  description: z.string().optional(),
  price_excluding_tax: z
    .string()
    .min(1, "Le prix est requis")
    .regex(/^\d*\.?\d*$/, "Le prix doit être un nombre valide"),
  vat_rate: z.custom<VatRate>(),
  unit: z.custom<ProductUnit>(),
  save_as_product: z.boolean().default(false),
});

export type NewProductSchema = z.infer<typeof newProductSchema>;

interface ProductSelectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (product: IProduct) => void;
  onCreateCustom: (product: NewProductSchema) => void;
}

export function ProductSelectDialog({
  open,
  onOpenChange,
  onSelect,
  onCreateCustom,
}: ProductSelectDialogProps) {
  const [search, setSearch] = useState("");
  const { formatCurrency, formatPercent } = useFormat();
  const { data: units } = useProductUnits();
  const { data: vatRates } = useProductVatRates();
  const generateDescription = useGenerateProductDescription();
  const generateSuggestions = useGenerateProductDescriptionSuggestions();
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [additionalInfo, setAdditionalInfo] = useState("");

  const debouncedSearch = useDebounce(search, 300);

  const form = useForm<NewProductSchema>({
    resolver: zodResolver(newProductSchema),
    defaultValues: {
      name: "",
      description: "",
      price_excluding_tax: undefined,
      vat_rate: "ZERO",
      unit: "unite",
      save_as_product: false,
    },
  });

  const { data: productsData, isLoading } = useProducts({
    search: debouncedSearch,
    limit: 50,
  });

  const productName = form.watch("name");

  const handleGenerateDescription = () => {
    if (!productName?.trim()) {
      return;
    }

    generateDescription.mutate({
      productName: productName.trim(),
      additionalInfo: additionalInfo.trim() || undefined,
    }, {
      onSuccess: (response) => {
        if (response.data?.description) {
          form.setValue("description", response.data.description);
        }
      }
    });
  };

  const handleGenerateSuggestions = () => {
    if (!productName?.trim()) {
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
      }
    });
  };

  const handleSelectSuggestion = (suggestion: string) => {
    form.setValue("description", suggestion);
    setShowSuggestions(false);
    setSuggestions([]);
  };

  const resetAI = () => {
    setSuggestions([]);
    setShowSuggestions(false);
    setAdditionalInfo("");
  };

  const handleCreateCustom = (data: NewProductSchema) => {
    onCreateCustom(data);
    form.reset();
    resetAI();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Ajouter un produit</DialogTitle>
          <DialogDescription>
            Sélectionnez un produit existant ou créez-en un nouveau
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="existing">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="existing">Produits existants</TabsTrigger>
            <TabsTrigger value="new">Nouveau produit</TabsTrigger>
          </TabsList>
          <TabsContent value="existing">
            <div className="mt-4">
              <div className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Rechercher un produit..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-8"
                  />
                </div>
                <ScrollArea className="h-[calc(100vh-20rem)] pr-4">
                  <div className="space-y-4">
                    {isLoading ? (
                      <p className="text-sm text-center text-muted-foreground">
                        Chargement des produits...
                      </p>
                    ) : productsData?.data?.products.length === 0 ? (
                      <p className="text-sm text-center text-muted-foreground">
                        Aucun produit trouvé
                      </p>
                    ) : (
                      productsData?.data?.products.map((product: IProduct) => (
                        <div
                          key={product.product_id}
                          className="flex items-center justify-between p-4 rounded-lg border cursor-pointer hover:bg-muted"
                          onClick={() => {
                            onSelect(product);
                            onOpenChange(false);
                          }}
                        >
                          <div>
                            <p className="font-medium">{product.name}</p>
                            {product.description && (
                              <p className="text-sm text-muted-foreground line-clamp-2">
                                {product.description}
                              </p>
                            )}
                          </div>
                          <div className="text-right min-w-fit">
                            <p className="font-medium">
                              {formatCurrency(product.price_excluding_tax)}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              TVA{" "}
                              {formatPercent(vatRateToNumber(product.vat_rate))}
                            </p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </ScrollArea>
              </div>
            </div>
          </TabsContent>
          <TabsContent value="new">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(handleCreateCustom)}
                className="space-y-4"
              >
                <FormField
                  control={form.control}
                  name="name"
                  render={({
                    field,
                  }: {
                    field: ControllerRenderProps<NewProductSchema, "name">;
                  }) => (
                    <FormItem>
                      <FormLabel>Nom du produit</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="description"
                  render={({
                    field,
                  }: {
                    field: ControllerRenderProps<
                      NewProductSchema,
                      "description"
                    >;
                  }) => (
                    <FormItem>
                      <div className="flex items-center justify-between">
                        <FormLabel>Description</FormLabel>
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
                            disabled={generateDescription.isPending || generateSuggestions.isPending || !productName?.trim()}
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
                            disabled={generateDescription.isPending || generateSuggestions.isPending || !productName?.trim()}
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
                      <FormControl>
                        <Textarea {...field} />
                      </FormControl>
                      <FormMessage />
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
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="price_excluding_tax"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Prix HT</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.01" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="vat_rate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>TVA</FormLabel>
                        <Select
                          onValueChange={(value) => field.onChange(value)}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Sélectionner un taux de TVA" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {vatRates?.data?.vatRates?.map((rate: VatRate) => (
                              <SelectItem key={rate} value={rate}>
                                {formatPercent(vatRateToNumber(rate))}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="unit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Unité</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionner une unité" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {units?.data?.units?.map((unit: string) => (
                            <SelectItem key={unit} value={unit}>
                              {unit}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="save_as_product"
                  render={({ field }) => (
                    <FormItem className="flex items-center space-x-2">
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormLabel className="!mt-0">
                        Sauvegarder comme produit
                      </FormLabel>
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      form.reset();
                      resetAI();
                      onOpenChange(false);
                    }}
                  >
                    Annuler
                  </Button>
                  <Button type="submit">Ajouter</Button>
                </DialogFooter>
              </form>
            </Form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
