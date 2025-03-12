"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuotes, useViewQuote } from "@/hooks/useQuote";
import { useFormat } from "@/hooks/useFormat";
import { useDebounce } from "@/hooks/useDebounce";
import { DateRange } from "react-day-picker";
import { format } from "date-fns";

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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { 
  Loader2, 
  Plus, 
  Search, 
  FileText, 
  Eye, 
  Calendar, 
  Clock
} from "lucide-react";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";

import type { IQuote, QuoteStatus } from "@/types/Quote.interface";

export default function QuotesPage() {
  const router = useRouter();
  const { formatCurrency } = useFormat();
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500);
  const [status, setStatus] = useState<QuoteStatus | "">("");
  const [page, setPage] = useState(1);
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);

  const { data: quotesData, isLoading } = useQuotes({
    search: debouncedSearch,
    status: status || undefined,
    start_date: dateRange?.from
      ? format(dateRange.from, "yyyy-MM-dd")
      : undefined,
    end_date: dateRange?.to ? format(dateRange.to, "yyyy-MM-dd") : undefined,
    limit: 25,
    page: page,
  });

  const { mutate: viewQuote } = useViewQuote();
  
  const totalPages = quotesData?.data.pagination?.totalPages || 1;

  const getStatusBadgeVariant = (status: QuoteStatus) => {
    switch (status) {
      case "accepted":
        return "default";
      case "sent":
        return "secondary";
      case "draft":
        return "outline";
      case "rejected":
        return "destructive";
      case "expired":
        return "destructive";
      default:
        return "secondary";
    }
  };

  const getStatusLabel = (status: QuoteStatus) => {
    switch (status) {
      case "draft":
        return "Brouillon";
      case "sent":
        return "Envoyé";
      case "accepted":
        return "Accepté";
      case "rejected":
        return "Refusé";
      case "expired":
        return "Expiré";
      default:
        return status;
    }
  };

  return (
    <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-6 space-y-4 sm:space-y-6 max-w-7xl">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-xl sm:text-2xl font-bold font-dmSans flex items-center">
          <FileText className="w-5 sm:w-6 h-5 sm:h-6 mr-2" />
          Devis
        </h1>
        <Button
          onClick={() => router.push("/quotes/create")}
          className="w-full sm:w-auto flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Nouveau devis
        </Button>
      </div>

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
            value={status}
            onValueChange={(value) => setStatus(value as QuoteStatus)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Tous les statuts" />
            </SelectTrigger>
            <SelectContent>
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

      {isLoading ? (
        <div className="flex justify-center items-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : quotesData?.data.quotes.length === 0 ? (
        <div className="text-center py-8 sm:py-12">
          <FileText className="mx-auto h-10 sm:h-12 w-10 sm:w-12 text-muted-foreground" />
          <h3 className="mt-3 sm:mt-4 text-base sm:text-lg font-medium">Aucun devis</h3>
          <p className="mt-1 sm:mt-2 text-xs sm:text-sm text-muted-foreground">
            Commencez par créer un nouveau devis.
          </p>
          <div className="mt-4 sm:mt-6">
            <Button onClick={() => router.push("/quotes/create")}>
              <Plus className="w-4 h-4 mr-2" />
              Nouveau devis
            </Button>
          </div>
        </div>
      ) : (
        <>
          {/* Vue mobile (uniquement sur xs) */}
          <div className="block sm:hidden space-y-4">
            {quotesData?.data.quotes.map((quote: IQuote) => (
              <div 
                key={quote.quote_id}
                className="border rounded-lg p-3 cursor-pointer hover:bg-muted/50"
                onClick={() => router.push(`/quotes/${quote.quote_id}`)}
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-medium text-sm">{quote.quote_number}</p>
                    <p className="text-xs text-muted-foreground truncate max-w-[180px]">
                      {quote.customer?.type === "company"
                        ? quote.customer.business?.name
                        : `${quote.customer?.individual?.first_name} ${quote.customer?.individual?.last_name}`}
                    </p>
                  </div>
                  <Badge
                    variant={getStatusBadgeVariant(quote.status)}
                    className="text-nowrap text-xs"
                  >
                    {getStatusLabel(quote.status)}
                  </Badge>
                </div>
                
                <div className="flex justify-between items-center text-sm">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-muted-foreground" />
                    <span className="text-xs">
                      {new Date(quote.quote_date).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="font-medium">
                    {formatCurrency(quote.amount_including_tax)}
                  </p>
                </div>
                
                <div className="flex justify-between items-center mt-2 pt-2 border-t">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">
                      Validité: {new Date(quote.validity_date).toLocaleDateString()}
                    </span>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-7 px-2"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (quote.quote_id) {
                        viewQuote(quote.quote_id);
                      }
                    }}
                  >
                    <Eye className="w-3 h-3 mr-1" />
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
                  <TableHead className="font-medium">Numéro</TableHead>
                  <TableHead className="font-medium">Client</TableHead>
                  <TableHead className="font-medium hidden md:table-cell">
                    Date
                  </TableHead>
                  <TableHead className="font-medium hidden lg:table-cell">
                    Validité
                  </TableHead>
                  <TableHead className="font-medium text-right">
                    Montant TTC
                  </TableHead>
                  <TableHead className="font-medium">Statut</TableHead>
                  <TableHead className="font-medium hidden sm:table-cell">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {quotesData?.data.quotes.map((quote: IQuote) => (
                  <TableRow
                    key={quote.quote_id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => router.push(`/quotes/${quote.quote_id}`)}
                  >
                    <TableCell className="font-medium text-nowrap">
                      {quote.quote_number}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium text-nowrap">
                          {quote.customer?.type === "company"
                            ? quote.customer.business?.name
                            : `${quote.customer?.individual?.first_name} ${quote.customer?.individual?.last_name}`}
                        </span>
                        <span className="text-sm text-muted-foreground hidden sm:block text-nowrap">
                          {quote.customer?.email}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-nowrap">
                      {new Date(quote.quote_date).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-nowrap">
                      {new Date(quote.validity_date).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right font-medium tabular-nums text-nowrap">
                      {formatCurrency(quote.amount_including_tax)}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={getStatusBadgeVariant(quote.status)}
                        className="w-fit whitespace-nowrap"
                      >
                        {getStatusLabel(quote.status)}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <Button variant="ghost" size="icon" onClick={(e) => {
                        e.stopPropagation()
                        if (quote.quote_id) {
                          viewQuote(quote.quote_id)
                        }
                      }}>
                        <Eye className="w-4 h-4" />
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
