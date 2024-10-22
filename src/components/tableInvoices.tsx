"use client";
import React from "react";
import { useRouter } from "next/navigation";

import { Invoice } from "@/types/Invoice";

import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import useFormattedAmount from "@/hooks/useFormattedAmount";
import useFormattedDate from "@/hooks/useFormattedDate";

import { cn } from "@/lib/utils";

type Props = {
  invoices: Invoice[] | undefined;
  search: string | null | undefined;
};

export default function TableInvoices({ invoices, search }: Props) {
  const router = useRouter();
  const { formatAmount } = useFormattedAmount();
  const { formatDate } = useFormattedDate();

  const handleSelectInvoice = (invoiceId: number) => {
    router.push(`/invoices/${invoiceId}`);
  };

  const statusText = (status: string) => {
    if (status === "paid") {
      return "Payée";
    } else if (status === "pending") {
      return "En attente";
    } else if (status === "cancelled") {
      return "Annulée";
    } else {
      return "N/A";
    }
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="min-w-[120px]">ID</TableHead>
          <TableHead className="min-w-[120px]">Prénom</TableHead>
          <TableHead className="min-w-[120px]">Nom</TableHead>
          <TableHead className="min-w-[120px]">Statut</TableHead>
          <TableHead className="min-w-[120px]">Articles</TableHead>
          <TableHead className="min-w-[120px]">Montant total</TableHead>
          <TableHead className="min-w-[150px]">Date de facturation</TableHead>
          <TableHead className="min-w-[150px]">Date d'échéance</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {invoices?.length === 0 ? (
          <TableRow>
            <TableCell colSpan={8} className="text-center">
              {search ? "Aucune facture trouvée" : "Aucune facture disponible"}
            </TableCell>
          </TableRow>
        ) : (
          invoices?.map((invoice) => (
            <TableRow
              key={invoice.invoice_id}
              onClick={() => handleSelectInvoice(invoice.invoice_id)}
              className="cursor-pointer"
            >
              <TableCell className="min-w-[120px]">
                {invoice.invoice_id || "N/A"}
              </TableCell>
              <TableCell className="min-w-[120px]">
                {invoice.Client.first_name || "N/A"}
              </TableCell>
              <TableCell className="min-w-[120px]">
                {invoice.Client.last_name || "N/A"}
              </TableCell>
              <TableCell className="min-w-[120px]">
                <Badge
                  className={cn(
                    invoice.status === "paid"
                      ? "bg-green-500 text-white hover:bg-green-600"
                      : invoice.status === "pending"
                      ? "bg-yellow-500 text-white hover:bg-yellow-600"
                      : "bg-red-500 text-white hover:bg-red-600"
                  )}
                >
                  {statusText(invoice.status)}
                </Badge>
              </TableCell>
              <TableCell className="min-w-[120px]">
                {invoice?.InvoiceItems?.length || 0}
              </TableCell>
              <TableCell className="min-w-[120px]">
                {formatAmount(invoice.total_amount, {
                  currency: "EUR",
                })}
              </TableCell>
              <TableCell className="min-w-[150px]">
                {formatDate(new Date(invoice.invoice_date)) || "N/A"}
              </TableCell>
              <TableCell className="min-w-[150px]">
                {formatDate(new Date(invoice.due_date)) || "N/A"}
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
}
