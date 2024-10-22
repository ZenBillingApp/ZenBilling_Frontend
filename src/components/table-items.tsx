import React from "react";
import { useTranslations } from "next-intl";

import { Item } from "@/types/Item";

import useFormattedAmount from "@/hooks/useFormattedAmount";
import useFormattedPercent from "@/hooks/useFormattedPercent";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";

type Props = {
  items: Item[];
};

export default function TableItems({ items }: Props) {
  const t = useTranslations();

  const { formatAmount } = useFormattedAmount();
  const { formatPercent } = useFormattedPercent();

  return (
    <Table className="w-full">
      <TableHeader>
        <TableRow>
          <TableHead className="min-w-96">Description</TableHead>
          <TableHead className="min-w-40">Prix unitaire</TableHead>
          <TableHead className="min-w-32">Quantité</TableHead>
          <TableHead className="min-w-32">Taux TVA (%)</TableHead>
          <TableHead className="min-w-32">Total TVA</TableHead>
          <TableHead className="min-w-32">Total TTC</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody className="divide-y">
        {items?.map((item, index) => (
          <TableRow key={item.item_id}>
            <TableCell className="truncate">{item.description}</TableCell>
            <TableCell>
              {formatAmount(item.unit_price, {
                currency: "EUR",
              })}
            </TableCell>
            <TableCell>{item.quantity}</TableCell>

            <TableCell>
              {formatPercent(item.vat_rate / 100, {
                minimumFractionDigits: 0,
              })}
            </TableCell>
            <TableCell>
              {formatAmount(
                item.vat_amount ||
                  item.unit_price * item.quantity * (item.vat_rate / 100),
                {
                  currency: "EUR",
                }
              )}
            </TableCell>
            <TableCell>
              {formatAmount(
                item.unit_price * item.quantity +
                  (item.vat_rate / 100) * item.unit_price * item.quantity,
                {
                  currency: "EUR",
                }
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
