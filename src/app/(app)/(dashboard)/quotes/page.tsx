"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuotes, useViewQuote } from "@/hooks/useQuote";
import { useFormat } from "@/hooks/useFormat";
import { useDebounce } from "@/hooks/useDebounce";
import { DateRange } from "react-day-picker";
import { format } from "date-fns";
import { getQuoteStatusBadgeVariant, getQuoteStatusLabel } from "@/utils/quoteStatus";

import { FileText, ShoppingCart, Search, Plus, Eye, CalendarDays, Clock, User, Building, Loader2, FileStack ,Check,AlertCircle,Mail} from "lucide-react";

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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

import type { IQuote } from "@/types/Quote.interface";

export default function QuotesPage() {
  const router = useRouter();
  const { formatCurrency } = useFormat();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "draft" | "sent" | "accepted" | "rejected" | "expired"
  >("all");
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [loadingQuoteId, setLoadingQuoteId] = useState<string | null>(null);

  const debouncedSearch = useDebounce(search, 300);

  const { data: quotes, isLoading } = useQuotes({
    search: debouncedSearch || undefined,
    status: statusFilter === "all" ? undefined : statusFilter,
    start_date: dateRange?.from
      ? format(dateRange.from, "yyyy-MM-dd")
      : undefined,
    end_date: dateRange?.to ? format(dateRange.to, "yyyy-MM-dd") : undefined,
    limit: 25,
    page: 1,
  });

  const { mutate: viewQuote } = useViewQuote();

  const handleViewQuote = (quoteId: string) => {
    setLoadingQuoteId(quoteId);
    viewQuote(quoteId, {
      onSettled: () => {
        setLoadingQuoteId(null);
      }
    });
  };

  const handleCreateQuote = () => {
    router.push("/quotes/create");
  };

  const columns: Column<IQuote>[] = [
    {
      header: "Type",
      accessorKey: (quote: IQuote) => (
        <Badge variant="outline" className="w-fit">
          {quote.customer?.type === "company" ? (
            <Building className="w-4 h-4" />
          ) : (
            <User className="w-4 h-4" />
          )}
        </Badge>
      ),
      className: "hidden sm:table-cell",
    },
    {
      header: "N° Devis",
      accessorKey: (quote: IQuote) => quote.quote_number,
      className: "font-medium text-nowrap",
    },
    {
      header: "Client",
      accessorKey: (quote: IQuote) => (
        <span className="text-nowrap max-w-[150px] truncate">
          {quote.customer?.type === "company"
            ? quote.customer.business?.name
            : `${quote.customer?.individual?.first_name} ${quote.customer?.individual?.last_name}`}
        </span>
      ),
    },
    {
      header: "Statut",
      accessorKey: (quote: IQuote) => (
        <StatusBadge
          status={getQuoteStatusLabel(quote.status)}
          variant={getQuoteStatusBadgeVariant(quote.status)}
        />
      ),
    },
    {
      header: "Produits",
      accessorKey: (quote: IQuote) => (
        <div className="flex items-center gap-1">
          <ShoppingCart className="w-3 h-3 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">
            {quote.items?.length || 0} produits
          </span>
        </div>
      ),
      className: "hidden sm:table-cell",
    },
    {
      header: "Dates",
      accessorKey: (quote: IQuote) => (
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-sm">
            <CalendarDays className="w-4 h-4 text-muted-foreground" />
            <span>
              {new Date(quote.quote_date).toLocaleDateString()}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <span>
              {new Date(quote.validity_date).toLocaleDateString()}
            </span>
          </div>
        </div>
      ),
      className: "hidden lg:table-cell",
    },
    {
      header: "Total TTC",
      accessorKey: (quote: IQuote) => (
        <span className="font-medium">
          {formatCurrency(quote.amount_including_tax)}
        </span>
      ),
    },
    {
      header: "Actions",
      accessorKey: (quote: IQuote) => (
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-7 px-2"
          onClick={(e) => {
            e.stopPropagation();
            if (quote.quote_id) {
              handleViewQuote(quote.quote_id);
            }
          }}
        >
          {loadingQuoteId === quote.quote_id ? (
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
          <FileText className="w-5 sm:w-6 h-5 sm:h-6 mr-2" />
          Devis
        </h1>
        <Button
          onClick={handleCreateQuote}
          className="w-full sm:w-auto flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Nouveau devis
        </Button>
      </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4 mb-8">
        <Card className="border-l-4 border-l-gray-500">
          <CardContent className="pt-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total devis</p>
                <h3 className="text-2xl font-bold">{quotes?.data?.stats.statusCounts.total   || 0}</h3>
              </div>
              <div className="p-2 bg-gray-100 dark:bg-gray-900/30 rounded-full">
                <FileStack className="h-5 w-5 text-gray-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="pt-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Devis envoyés</p>
                <h3 className="text-2xl font-bold">{quotes?.data?.stats.statusCounts.sent || 0}</h3>
              </div>
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                <Mail className="h-5 w-5 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card> 

        <Card className="border-l-4 border-l-green-500">
          <CardContent className="pt-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Devis acceptés</p>
                <h3 className="text-2xl font-bold">{quotes?.data?.stats.statusCounts.accepted || 0}</h3>
              </div>
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-full">
                <Check className="h-5 w-5 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-red-500">
          <CardContent className="pt-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Devis refusés</p>
                <h3 className="text-2xl font-bold">{quotes?.data?.stats.statusCounts.rejected || 0}</h3>
              </div>
              <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-full">
                <AlertCircle className="h-5 w-5 text-red-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-yellow-500">
          <CardContent className="pt-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Devis expirés</p>
                <h3 className="text-2xl font-bold">{quotes?.data?.stats.statusCounts.expired || 0}</h3>
              </div>
              <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-full">
                <FileText className="h-5 w-5 text-yellow-500" />
              </div>
            </div>
          </CardContent>
        </Card>
        </div>

      <Card className="overflow-hidden border shadow-sm hover:shadow-md transition-shadow">
        <CardHeader className="bg-muted/50">
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Liste des devis
          </CardTitle>
          <CardDescription>Gérez et consultez tous vos devis</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 pt-6">
          <div className="flex flex-col gap-4">
            <div className="relative w-full">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher un devis..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 w-full"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              <Select
                value={statusFilter}
                onValueChange={(
                  value: "all" | "draft" | "sent" | "accepted" | "rejected" | "expired"
                ) => setStatusFilter(value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous</SelectItem>
                  <SelectItem value="draft">Brouillon</SelectItem>
                  <SelectItem value="sent">Envoyé</SelectItem>
                  <SelectItem value="accepted">Accepté</SelectItem>
                  <SelectItem value="rejected">Refusé</SelectItem>
                  <SelectItem value="expired">Expiré</SelectItem>
                </SelectContent>
              </Select>
              <DatePickerWithRange date={dateRange} setDate={setDateRange} className="w-full" />
              <div className="hidden sm:block lg:hidden"></div>
            </div>
          </div>

          <DataTable
            data={quotes?.data?.quotes || []}
            columns={columns}
            isLoading={isLoading}
            emptyMessage="Aucun devis trouvé"
            onRowClick={(quote: IQuote) => router.push(`/quotes/${quote.quote_id}`)}
          />
        </CardContent>
      </Card>
    </div>
  );
}
