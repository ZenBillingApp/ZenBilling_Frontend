"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useInvoices, useViewInvoice } from "@/hooks/useInvoice";
import { useFormat } from "@/hooks/useFormat";
import { useDebounce } from "@/hooks/useDebounce";
import { DateRange } from "react-day-picker";
import { format } from "date-fns";

import { FileStack, ShoppingCart, Search, Plus, Eye } from "lucide-react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";

import { Loader2 } from "lucide-react";
import { IInvoice } from "@/types/Invoice.interface";
import { User, Building, CalendarDays, Clock } from "lucide-react";

export default function InvoicesPage() {
  const router = useRouter();
  const { formatCurrency } = useFormat();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<
    "all" | "pending" | "sent" | "paid" | "cancelled" | "late"
  >("all");
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);

  const debouncedSearch = useDebounce(search, 300);

  const { data, isLoading } = useInvoices({
    search: debouncedSearch || undefined,
    status: statusFilter === "all" ? undefined : statusFilter,
    start_date: dateRange?.from
      ? format(dateRange.from, "yyyy-MM-dd")
      : undefined,
    end_date: dateRange?.to ? format(dateRange.to, "yyyy-MM-dd") : undefined,
    limit: 25,
    page: page,
  });

  const { mutate: viewInvoice, isPending: isViewInvoicePending } = useViewInvoice();

  const totalPages = data?.data.pagination.totalPages;

  const handleCreateInvoice = () => {
    router.push("/invoices/create");
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "paid":
        return "default";
      case "pending":
        return "secondary";
      case "sent":
        return "secondary";
      case "late":
        return "destructive";
      case "cancelled":
        return "destructive";
      default:
        return "secondary";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "pending":
        return "En attente";
      case "sent":
        return "Envoyée";
      case "paid":
        return "Payée";
      case "late":
        return "En retard";
      case "cancelled":
        return "Annulée";
      default:
        return status;
    }
  };

  return (
    <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-6 space-y-4 sm:space-y-6 max-w-7xl">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-xl sm:text-2xl font-bold font-dmSans flex items-center">
          <FileStack className="w-5 sm:w-6 h-5 sm:h-6 mr-2" />
          Factures
        </h1>
        <Button
          onClick={handleCreateInvoice}
          className="w-full sm:w-auto flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Nouvelle facture
        </Button>
      </div>

      <div className="flex flex-col gap-4">
        <div className="relative w-full">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher une facture..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 w-full"
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          <Select
            value={statusFilter}
            onValueChange={(
              value: "all" | "pending" | "sent" | "paid" | "cancelled" | "late"
            ) => setStatusFilter(value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Statut" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous</SelectItem>
              <SelectItem value="pending">En attente</SelectItem>
              <SelectItem value="sent">Envoyée</SelectItem>
              <SelectItem value="paid">Payée</SelectItem>
              <SelectItem value="late">En retard</SelectItem>
              <SelectItem value="cancelled">Annulée</SelectItem>
            </SelectContent>
          </Select>
          <DatePickerWithRange date={dateRange} setDate={setDateRange} className="w-full" />
          <div className="hidden sm:block lg:hidden"></div>
        </div>
      </div>
      {isLoading ? (
        <div className="flex justify-center items-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : data?.data.invoices.length === 0 ? (
        <div className="text-center py-8 sm:py-12">
          <FileStack className="mx-auto h-10 sm:h-12 w-10 sm:w-12 text-muted-foreground" />
          <h3 className="mt-3 sm:mt-4 text-base sm:text-lg font-medium">Aucune facture</h3>
          <p className="mt-1 sm:mt-2 text-xs sm:text-sm text-muted-foreground">
            Commencez par créer une nouvelle facture.
          </p>
          <div className="mt-4 sm:mt-6">
            <Button onClick={() => router.push("/invoices/create")}>
              <Plus className="w-4 h-4 mr-2" />
              Nouvelle facture
            </Button>
          </div>
        </div>
      ) : (
        <>
          {/* Vue mobile (uniquement sur xs) */}
          <div className="block sm:hidden space-y-4">
            {data?.data?.invoices?.map((invoice: IInvoice) => (
              <div 
                key={invoice.invoice_id}
                className="border rounded-lg p-3 cursor-pointer hover:bg-muted/50"
                onClick={() => router.push(`/invoices/${invoice.invoice_id}`)}
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-medium text-sm">{invoice.invoice_number}</p>
                    <p className="text-xs text-muted-foreground truncate max-w-[180px]">
                      {invoice.customer?.type === "company"
                        ? invoice.customer.business?.name
                        : `${invoice.customer?.individual?.first_name} ${invoice.customer?.individual?.last_name}`}
                    </p>
                  </div>
                  <Badge
                    variant={getStatusBadgeVariant(invoice.status)}
                    className="text-nowrap text-xs"
                  >
                    {getStatusLabel(invoice.status)}
                  </Badge>
                </div>
                
                <div className="flex justify-between items-center text-sm">
                  <div className="flex items-center gap-1">
                    <CalendarDays className="w-3 h-3 text-muted-foreground" />
                    <span className="text-xs">
                      {new Date(invoice.due_date).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="font-medium">
                    {formatCurrency(invoice.amount_including_tax)}
                  </p>
                </div>
                
                <div className="flex justify-between items-center mt-2 pt-2 border-t">
                  <div className="flex items-center gap-1">
                    <ShoppingCart className="w-3 h-3 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">
                      {invoice.items?.length || 0} produits
                    </span>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-7 px-2"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (invoice.invoice_id) {
                        viewInvoice(invoice.invoice_id);
                      }
                    }}
                  >
                    {isViewInvoicePending ? (
                      <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                    ) : (
                      <Eye className="w-3 h-3 mr-1" />
                    )}
                    <span className="text-xs">Voir</span>
                  </Button>
                </div>
              </div>
            ))}
          </div>
          
          {/* Vue desktop (à partir de sm) */}
          <div className="hidden sm:block overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="hidden sm:table-cell">Type</TableHead>
                  <TableHead>N° Facture</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="hidden sm:table-cell">Produits</TableHead>
                  <TableHead className="hidden lg:table-cell">Dates</TableHead>
                  <TableHead>Total TTC</TableHead>
                  <TableHead className="hidden sm:table-cell">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data?.data?.invoices?.map((invoice: IInvoice) => (
                  <TableRow
                    key={invoice.invoice_id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => router.push(`/invoices/${invoice.invoice_id}`)}
                  >
                    <TableCell className="hidden sm:table-cell">
                      <Badge variant="outline" className="w-fit">
                        {invoice.customer?.type === "company" ? (
                          <Building className="w-4 h-4" />
                        ) : (
                          <User className="w-4 h-4" />
                        )}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium text-nowrap">
                      {invoice.invoice_number}
                    </TableCell>
                    <TableCell className="text-nowrap max-w-[150px] truncate">
                      {invoice.customer?.type === "company"
                        ? invoice.customer.business?.name
                        : `${invoice.customer?.individual?.first_name} ${invoice.customer?.individual?.last_name}`}
                    </TableCell>
                    <TableCell className="text-nowrap">
                      <Badge
                        variant={getStatusBadgeVariant(invoice.status)}
                        className="text-nowrap"
                      >
                        {getStatusLabel(invoice.status)}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell text-center text-nowrap">
                      <Badge
                        variant="outline"
                        className="flex items-center gap-2 w-fit"
                      >
                        <ShoppingCart className="w-4 h-4" />
                        {invoice.items?.length || 0}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-nowrap">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm">
                          <CalendarDays className="w-4 h-4 text-muted-foreground" />
                          <span>
                            {new Date(invoice.invoice_date).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Clock className="w-4 h-4 text-muted-foreground" />
                          <span>
                            {new Date(invoice.due_date).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium text-nowrap">
                      {formatCurrency(invoice.amount_including_tax)}
                    </TableCell>
                    <TableCell className="hidden sm:table-cell text-center text-nowrap">
                      <Button variant="ghost" size="icon" onClick={(e) => {
                        e.stopPropagation()
                        if (invoice.invoice_id) {
                          viewInvoice(invoice.invoice_id)
                        }
                      }}>
                        {isViewInvoicePending ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </>
      )}

      {totalPages > 1 && (
        <div className="flex justify-center mt-4 sm:mt-6">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  className="cursor-pointer"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  isActive={page !== 1}
                />
              </PaginationItem>
              {[...Array(totalPages)].map((_, i) => {
                // Sur mobile, n'afficher que la page actuelle et les pages adjacentes
                if (
                  (window.innerWidth < 640 && Math.abs(page - (i + 1)) > 1) ||
                  (totalPages > 7 && i > 0 && i < totalPages - 1 && Math.abs(page - (i + 1)) > 2)
                ) {
                  // Afficher des points de suspension au milieu
                  if (i === 1 && page > 3) {
                    return (
                      <PaginationItem key="ellipsis-start" className="flex items-center justify-center h-10 w-10">
                        <span>...</span>
                      </PaginationItem>
                    );
                  }
                  if (i === totalPages - 2 && page < totalPages - 2) {
                    return (
                      <PaginationItem key="ellipsis-end" className="flex items-center justify-center h-10 w-10">
                        <span>...</span>
                      </PaginationItem>
                    );
                  }
                  return null;
                }
                return (
                  <PaginationItem key={i + 1}>
                    <PaginationLink
                      onClick={() => setPage(i + 1)}
                      isActive={page === i + 1}
                    >
                      {i + 1}
                    </PaginationLink>
                  </PaginationItem>
                );
              })}
              <PaginationItem>
                <PaginationNext
                  className="cursor-pointer"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  isActive={page !== totalPages}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
}
