"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { Invoice } from "@/types/Invoice";
import { Badge } from "@/components/ui/badge";
import {
  Building2,
  User2,
  Receipt,
  CalendarDays,
  ClockIcon,
  Mail,
  Building,
  ArrowRight,
  Box,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
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

  const getStatusConfig = (status: string) => {
    const configs = {
      paid: {
        label: "Payée",
        className: "bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20",
      },
      pending: {
        label: "En attente",
        className: "bg-amber-500/10 text-amber-500 hover:bg-amber-500/20",
      },
      cancelled: {
        label: "Annulée",
        className: "bg-rose-500/10 text-rose-500 hover:bg-rose-500/20",
      },
      default: {
        label: "N/A",
        className: "bg-muted",
      },
    };
    return configs[status as keyof typeof configs] || configs.default;
  };

  if (!invoices?.length) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center border rounded-lg border-dashed gap-3">
        <Receipt className="w-10 h-10 text-muted-foreground" />
        <div className="text-lg font-medium">Aucune facture</div>
        <p className="text-sm text-muted-foreground">
          {search
            ? "Aucune facture ne correspond à votre recherche"
            : "Commencez par créer votre première facture"}
        </p>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow className="hover:bg-transparent">
          <TableHead className="w-[30px]"></TableHead>
          <TableHead>Facture</TableHead>
          <TableHead>Client</TableHead>
          <TableHead>Détails</TableHead>
          <TableHead>Statut</TableHead>
          <TableHead>Articles</TableHead>
          <TableHead>Montant</TableHead>
          <TableHead>Dates</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {invoices.map((invoice) => {
          const isCompany = invoice.Client.type === "company";
          const status = getStatusConfig(invoice.status);

          return (
            <TableRow
              key={invoice.invoice_id}
              onClick={() => router.push(`/invoices/${invoice.invoice_id}`)}
              className="group cursor-pointer"
            >
              <TableCell>
                <div className="p-2 rounded-full bg-primary/5 group-hover:bg-primary/10">
                  {isCompany ? (
                    <Building2 className="w-4 h-4 text-primary" />
                  ) : (
                    <User2 className="w-4 h-4 text-primary" />
                  )}
                </div>
              </TableCell>

              <TableCell>
                <div className="flex items-center gap-2">
                  <Receipt className="w-4 h-4 text-muted-foreground" />
                  <span className="font-medium">#{invoice.invoice_number}</span>
                </div>
              </TableCell>

              <TableCell>
                <div className="flex flex-col gap-1">
                  <div className="font-medium flex items-center gap-2">
                    {isCompany ? (
                      <Building className="w-3 h-3 text-muted-foreground" />
                    ) : (
                      <User2 className="w-3 h-3 text-muted-foreground" />
                    )}
                    {isCompany
                      ? invoice.Client.name
                      : `${invoice.Client.first_name} ${invoice.Client.last_name}`}
                  </div>
                  {invoice.Client.email && (
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Mail className="w-3 h-3" />
                      {invoice.Client.email}
                    </div>
                  )}
                </div>
              </TableCell>

              <TableCell>
                {isCompany &&
                  (invoice.Client.siret_number ||
                    invoice.Client.vat_number) && (
                    <div className="flex flex-col gap-1">
                      {invoice.Client.siret_number && (
                        <div className="text-sm text-muted-foreground font-mono">
                          SIRET: {invoice.Client.siret_number}
                        </div>
                      )}
                      {invoice.Client.vat_number && (
                        <div className="text-sm text-muted-foreground font-mono">
                          TVA: {invoice.Client.vat_number}
                        </div>
                      )}
                    </div>
                  )}
              </TableCell>

              <TableCell>
                <Badge className={status.className} variant="outline">
                  {status.label}
                </Badge>
              </TableCell>

              <TableCell>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Badge variant="secondary" className="gap-1">
                        <Box className="w-3 h-3" />
                        {invoice.InvoiceItems?.length || 0}
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent>
                      {invoice.InvoiceItems?.length} article
                      {invoice.InvoiceItems?.length !== 1 ? "s" : ""}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </TableCell>

              <TableCell>
                <div className="font-medium">
                  {formatAmount(invoice.total_amount)}
                </div>
              </TableCell>

              <TableCell>
                <div className="flex flex-col gap-1 text-sm">
                  <div className="flex items-center gap-1">
                    <CalendarDays className="w-3 h-3 text-muted-foreground" />
                    <span>{formatDate(new Date(invoice.invoice_date))}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <ClockIcon className="w-3 h-3 text-muted-foreground" />
                    <ArrowRight className="w-3 h-3 text-muted-foreground" />
                    <span>{formatDate(new Date(invoice.due_date))}</span>
                  </div>
                </div>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
