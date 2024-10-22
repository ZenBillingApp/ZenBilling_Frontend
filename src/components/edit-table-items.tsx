import React, { useEffect } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { Item } from "@/types/Item";
import useFormattedAmount from "@/hooks/useFormattedAmount";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { Plus, Save, Trash2 } from "lucide-react";

type Props = {
  items: Item[];
  handleOnSaveItems: (items: Item[]) => void;
};

type FormValues = {
  items: Item[];
};

export default function EditTableItems({ items, handleOnSaveItems }: Props) {
  const { formatAmount } = useFormattedAmount();

  const {
    control,
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      items: items,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "items",
  });

  useEffect(() => {
    reset({ items });
  }, [items, reset]);

  const watchItems = watch("items");

  const calculateTotal = (item: Item) => {
    const price = item.unit_price || 0;
    const quantity = item.quantity || 0;
    const vatRate = item.vat_rate || 0;

    const subtotal = price * quantity;
    const vat = (vatRate / 100) * subtotal;
    return subtotal + vat;
  };

  const onSubmit = (data: FormValues) => {
    handleOnSaveItems(data.items);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="min-w-96">Description</TableHead>
            <TableHead className="min-w-40">Prix unitaire</TableHead>
            <TableHead className="min-w-32">Quantité</TableHead>
            <TableHead className="min-w-32">Taux TVA (%)</TableHead>
            <TableHead className="min-w-32">Total TTC</TableHead>
            <TableHead className="w-20"></TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {fields.map((field, index) => (
            <TableRow key={field.id}>
              <TableCell>
                <div className="flex flex-col gap-2">
                  <Input
                    {...register(`items.${index}.description` as const, {
                      required: "Veuillez saisir une description",
                    })}
                  />
                  {errors.items?.[index]?.description && (
                    <p className="text-red-500 text-xs">
                      {errors.items[index]?.description?.message}
                    </p>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex flex-col gap-2">
                  <Input
                    type="number"
                    step="0.01"
                    {...register(`items.${index}.unit_price` as const, {
                      required: "Veuillez saisir un prix unitaire",
                      valueAsNumber: true,
                      min: { value: 0, message: "Le prix doit être positif" },
                    })}
                  />
                  {errors.items?.[index]?.unit_price && (
                    <p className="text-red-500 text-xs">
                      {errors.items[index]?.unit_price?.message}
                    </p>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex flex-col gap-2">
                  <Input
                    type="number"
                    {...register(`items.${index}.quantity` as const, {
                      required: "Veuillez saisir une quantité",
                      valueAsNumber: true,
                      min: { value: 1, message: "La quantité minimum est 1" },
                    })}
                  />
                  {errors.items?.[index]?.quantity && (
                    <p className="text-red-500 text-xs">
                      {errors.items[index]?.quantity?.message}
                    </p>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex flex-col gap-2">
                  <Input
                    type="number"
                    step="0.1"
                    {...register(`items.${index}.vat_rate` as const, {
                      required: "Veuillez saisir un taux de TVA",
                      valueAsNumber: true,
                      min: { value: 0, message: "Le taux doit être positif" },
                      max: { value: 100, message: "Le taux maximum est 100%" },
                    })}
                  />
                  {errors.items?.[index]?.vat_rate && (
                    <p className="text-red-500 text-xs">
                      {errors.items[index]?.vat_rate?.message}
                    </p>
                  )}
                </div>
              </TableCell>
              <TableCell>
                {formatAmount(calculateTotal(watchItems[index]), {
                  currency: "EUR",
                })}
              </TableCell>
              <TableCell>
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => remove(index)}
                  size="icon"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <div className="flex justify-end mt-4 gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => append({} as Item)}
          className="flex gap-2"
        >
          <Plus className="h-4 w-4" />
          Ajouter un Article
        </Button>
        <Button type="submit" className="flex gap-2">
          <Save className="h-4 w-4" />
          Enregistrer
        </Button>
      </div>
    </form>
  );
}
