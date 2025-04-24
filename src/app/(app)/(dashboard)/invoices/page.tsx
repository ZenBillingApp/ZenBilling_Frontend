"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useInvoices, useViewInvoice } from "@/hooks/useInvoice";
import { useFormat } from "@/hooks/useFormat";
import { useDebounce } from "@/hooks/useDebounce";
import { DateRange } from "react-day-picker";
import { format } from "date-fns";
import { getInvoiceStatusBadgeVariant, getInvoiceStatusLabel } from "@/utils/invoiceStatus";

import { FileStack, ShoppingCart, Search, Plus, Eye, CalendarDays, Clock,Check,AlertCircle,Mail } from "lucide-react";

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
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import { DataTable, StatusBadge, Column } from "@/components/ui/data-table";

import { Loader2 } from "lucide-react";
import { IInvoice } from "@/types/Invoice.interface";
import { User, Building } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export default function InvoicesPage() {
  const router = useRouter();
  const { formatCurrency } = useFormat();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "pending" | "sent" | "paid" | "cancelled" | "late"
  >("all");
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [loadingInvoiceId, setLoadingInvoiceId] = useState<string | null>(null);

  const debouncedSearch = useDebounce(search, 300);

  const { data: invoices, isLoading } = useInvoices({
    search: debouncedSearch || undefined,
    status: statusFilter === "all" ? undefined : statusFilter,
    start_date: dateRange?.from
      ? format(dateRange.from, "yyyy-MM-dd")
      : undefined,
    end_date: dateRange?.to ? format(dateRange.to, "yyyy-MM-dd") : undefined,
    limit: 25,
    page: 1,
  });

  const { mutate: viewInvoice } = useViewInvoice();

  const handleViewInvoice = (invoiceId: string) => {
    setLoadingInvoiceId(invoiceId);
    viewInvoice(invoiceId, {
      onSettled: () => {
        setLoadingInvoiceId(null);
      }
    });
  };

  const handleCreateInvoice = () => {
    router.push("/invoices/create");
  };

  const columns: Column<IInvoice>[] = [
    {
      header: "Type",
      accessorKey: (invoice: IInvoice) => (
        <Badge variant="outline" className="w-fit">
          {invoice.customer?.type === "company" ? (
            <Building className="w-4 h-4" />
          ) : (
            <User className="w-4 h-4" />
          )}
        </Badge>
      ),
      className: "hidden sm:table-cell",
    },
    {
      header: "N° Facture",
      accessorKey: (invoice: IInvoice) => invoice.invoice_number,
      className: "font-medium text-nowrap",
    },
    {
      header: "Client",
      accessorKey: (invoice: IInvoice) => (
        <span className="text-nowrap max-w-[150px] truncate">
          {invoice.customer?.type === "company"
            ? invoice.customer.business?.name
            : `${invoice.customer?.individual?.first_name} ${invoice.customer?.individual?.last_name}`}
        </span>
      ),
    },
    {
      header: "Statut",
      accessorKey: (invoice: IInvoice) => (
        <StatusBadge
          status={getInvoiceStatusLabel(invoice.status)}
          variant={getInvoiceStatusBadgeVariant(invoice.status)}
        />
      ),
    },
    {
      header: "Produits",
      accessorKey: (invoice: IInvoice) => (
        <div className="flex items-center gap-1">
          <ShoppingCart className="w-3 h-3 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">
            {invoice.items?.length || 0} produits
          </span>
        </div>
      ),
      className: "hidden sm:table-cell",
    },
    {
      header: "Dates",
      accessorKey: (invoice: IInvoice) => (
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
      ),
      className: "hidden lg:table-cell",
    },
    {
      header: "Total TTC",
      accessorKey: (invoice: IInvoice) => (
        <span className="font-medium">
          {formatCurrency(invoice.amount_including_tax)}
        </span>
      ),
    },
    {
      header: "Actions",
      accessorKey: (invoice: IInvoice) => (
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-7 px-2"
          onClick={(e) => {
            e.stopPropagation();
            if (invoice.invoice_id) {
              handleViewInvoice(invoice.invoice_id);
            }
          }}
        >
          {loadingInvoiceId === invoice.invoice_id ? (
            <Loader2 className="w-3 h-3 mr-1 animate-spin" />
          ) : (
            <Eye className="w-3 h-3 mr-1" />
          )}
          <span className="text-xs">Voir</span>
        </Button>
      ),
      className: "hidden sm:table-cell",
    },
  ];

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
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

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4 mb-8">
        <Card className="border-l-4 border-l-gray-500 ">
          <CardContent className="pt-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total factures</p>
                <h3 className="text-2xl font-bold">{invoices?.data?.stats.statusCounts.total}</h3>
              </div>
              <div className="p-2 bg-gray-100 dark:bg-gray-900/30 rounded-full">
                <FileStack className="h-5 w-5 text-gray-500" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-green-500">
          <CardContent className="pt-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Factures payées</p>
                <h3 className="text-2xl font-bold">{invoices?.data?.stats.statusCounts.paid}</h3>
              </div>
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-full">
                <Check className="h-5 w-5 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-yellow-500">
          <CardContent className="pt-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-muted-foreground">En attente</p>
                <h3 className="text-2xl font-bold">{invoices?.data?.stats.statusCounts.pending}</h3>
              </div>
              <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-full">
                <Clock className="h-5 w-5 text-yellow-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="pt-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Envoyées</p>
                <h3 className="text-2xl font-bold">{invoices?.data?.stats.statusCounts.sent}</h3>
              </div>
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                <Mail className="h-5 w-5 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>


        
        <Card className="border-l-4 border-l-red-500">
          <CardContent className="pt-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-muted-foreground">En retard</p>
                <h3 className="text-2xl font-bold">{invoices?.data?.stats.statusCounts.late}</h3>
              </div>
              <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-full">
                <AlertCircle className="h-5 w-5 text-red-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="overflow-hidden border shadow-sm hover:shadow-md transition-shadow">
        <CardHeader className="bg-muted/50">
          <CardTitle className="flex items-center gap-2">
            <FileStack className="h-5 w-5 text-primary" />
            Liste des factures
          </CardTitle>
          <CardDescription>Gérez et consultez toutes vos factures</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 pt-6">
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

          <DataTable
            data={invoices?.data?.invoices || []}
            columns={columns}
            isLoading={isLoading}
            emptyMessage="Aucune facture trouvée"
            onRowClick={(invoice: IInvoice) => router.push(`/invoices/${invoice.invoice_id}`)}
          />
        </CardContent>
        <CardFooter>
          <div className="flex justify-between items-center">
            <p className="text-sm text-muted-foreground">
              {invoices?.data?.pagination.total} factures trouvées
            </p>
            
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
