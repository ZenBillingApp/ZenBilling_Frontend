"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useCustomer, useDeleteCustomer } from "@/hooks/useCustomer";
import { useCustomerInvoices,useViewInvoice } from "@/hooks/useInvoice";
import { useCustomerQuotes,useViewQuote } from "@/hooks/useQuote";
import { useFormat } from "@/hooks/useFormat";
import { useDebounce } from "@/hooks/useDebounce";
import { DateRange } from "react-day-picker";
import { format } from "date-fns";
import NiceModal from "@ebay/nice-modal-react";
import { getInvoiceStatusBadgeVariant, getInvoiceStatusLabel } from "@/utils/invoiceStatus";
import { getQuoteStatusBadgeVariant, getQuoteStatusLabel } from "@/utils/quoteStatus";

import { ShoppingCart, Search, Eye, CalendarDays, Clock, User, Building, Loader2, ArrowLeft, Calendar, Edit, Trash2, Mail, Phone, MapPin, FileText } from "lucide-react";

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
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import EditCustomerDialog from "@/components/customers/edit-customer-dialog";

import type { IInvoice, InvoiceStatus } from "@/types/Invoice.interface";
import type { IQuote, QuoteStatus } from "@/types/Quote.interface";




export default function CustomerDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { formatCurrency } = useFormat();
  const deleteCustomerMutation = useDeleteCustomer();
  const { mutate: viewInvoice } = useViewInvoice();
  const { mutate: viewQuote } = useViewQuote();

  const [isDeleting, setIsDeleting] = useState(false);
  const [activeTab, setActiveTab] = useState("info");
  const [invoiceSearch, setInvoiceSearch] = useState("");
  const [quoteSearch, setQuoteSearch] = useState("");
  const [invoiceStatusFilter, setInvoiceStatusFilter] = useState<"all" | InvoiceStatus>("all");
  const [quoteStatusFilter, setQuoteStatusFilter] = useState<"all" | QuoteStatus>("all");
  const [invoiceDateRange, setInvoiceDateRange] = useState<DateRange | undefined>(undefined);
  const [quoteDateRange, setQuoteDateRange] = useState<DateRange | undefined>(undefined);
  const [loadingInvoiceId, setLoadingInvoiceId] = useState<string | null>(null);
  const [loadingQuoteId, setLoadingQuoteId] = useState<string | null>(null);

  const debouncedInvoiceSearch = useDebounce(invoiceSearch, 300);
  const debouncedQuoteSearch = useDebounce(quoteSearch, 300);

  const { data: customerData, isLoading: isLoadingCustomer } = useCustomer(params.id as string);
  const { data: invoicesData, isLoading: isLoadingInvoices } = useCustomerInvoices(params.id as string, {
    search: debouncedInvoiceSearch || undefined,
    status: invoiceStatusFilter === "all" ? undefined : invoiceStatusFilter,
    start_date: invoiceDateRange?.from ? format(invoiceDateRange.from, "yyyy-MM-dd") : undefined,
    end_date: invoiceDateRange?.to ? format(invoiceDateRange.to, "yyyy-MM-dd") : undefined,
    limit: 25,
    page: 1,
  });
  const { data: quotesData, isLoading: isLoadingQuotes } = useCustomerQuotes(params.id as string, {
    search: debouncedQuoteSearch || undefined,
    status: quoteStatusFilter === "all" ? undefined : quoteStatusFilter,
    start_date: quoteDateRange?.from ? format(quoteDateRange.from, "yyyy-MM-dd") : undefined,
    end_date: quoteDateRange?.to ? format(quoteDateRange.to, "yyyy-MM-dd") : undefined,
    limit: 25,
    page: 1,
  });

  const customer = customerData?.data;
  const customerName = customer?.type === "company" 
    ? customer.business?.name 
    : `${customer?.individual?.first_name} ${customer?.individual?.last_name}`;

  const handleViewInvoice = (invoiceId: string) => {
    setLoadingInvoiceId(invoiceId);
    viewInvoice(invoiceId, {
      onSettled: () => {
        setLoadingInvoiceId(null);
      }
    });
  };

  const handleViewQuote = (quoteId: string) => {
    setLoadingQuoteId(quoteId);
    viewQuote(quoteId, {
      onSettled: () => {
        setLoadingQuoteId(null);
      }
    });
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteCustomerMutation.mutateAsync(params.id as string);
      router.push("/customers");
    } catch (error) {
      console.error("Erreur lors de la suppression du client:", error);
    } finally {
      setIsDeleting(false);
    }
  };
  
  const handleEdit = () => {
    if (customer) {
      NiceModal.show(EditCustomerDialog, { customer });
    }
  };
  
  if (isLoadingCustomer) {
    return (
      <div className="container mx-auto px-4 py-6 space-y-6">
        <div className="flex items-center space-x-4 mb-6">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Skeleton className="h-64 rounded-lg" />
          <Skeleton className="h-64 rounded-lg" />
        </div>
        
        <Skeleton className="h-48 rounded-lg" />
      </div>
    );
  }
  
  if (!customer) {
    return (
      <div className="flex flex-col items-center justify-center h-[80vh] space-y-6">
        <div className="bg-destructive/10 p-4 rounded-full">
          <User className="h-12 w-12 text-destructive" />
        </div>
        <h2 className="text-2xl font-semibold">Client non trouvé</h2>
        <p className="text-muted-foreground text-center max-w-md">
          Le client que vous recherchez n&apos;existe pas ou a été supprimé.
        </p>
        <Button onClick={() => router.push("/customers")} className="mt-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour aux clients
        </Button>
      </div>
    );
  }
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const invoiceColumns: Column<IInvoice>[] = [
    {
      header: "N° Facture",
      accessorKey: (invoice: IInvoice) => invoice.invoice_number,
      className: "font-medium text-nowrap",
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

  const quoteColumns: Column<IQuote>[] = [
    {
      header: "N° Devis",
      accessorKey: (quote: IQuote) => quote.quote_number,
      className: "font-medium text-nowrap",
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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-card rounded-lg p-4 shadow-sm border">
        <div className="flex items-center space-x-4">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="outline" 
                  size="icon" 
                  onClick={() => router.push("/customers")}
                  className="rounded-full"
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Retour aux clients</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              {customerName}
              <Badge 
                variant={customer.type === "company" ? "default" : "secondary"} 
                className="ml-2 flex items-center gap-1"
              >
                {customer.type === "company" ? (
                  <Building className="w-3 h-3" />
                ) : (
                  <User className="w-3 h-3" />
                )}
                <span>{customer.type === "company" ? "Professionnel" : "Particulier"}</span>
              </Badge>
            </h1>
            <div className="flex items-center space-x-2 mt-1">
              <span className="text-sm text-muted-foreground flex items-center">
                <Calendar className="w-3 h-3 mr-1" />
                Créé le {formatDate(customer.created_at)}
              </span>
            </div>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" onClick={handleEdit} className="gap-2">
                  <Edit className="h-4 w-4" />
                  Modifier
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Modifier les informations du client</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" className="gap-2">
                <Trash2 className="h-4 w-4" />
                Supprimer
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
                <AlertDialogDescription>
                  Cette action est irréversible. Cela supprimera définitivement ce client et toutes ses données associées.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Annuler</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} disabled={isDeleting}>
                  {isDeleting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Suppression...
                    </>
                  ) : (
                    "Supprimer"
                  )}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
      
      <Tabs 
        defaultValue="info" 
        className="w-full" 
        value={activeTab}
        onValueChange={setActiveTab}
      >
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="info" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            Informations
          </TabsTrigger>
          <TabsTrigger value="invoices" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            Factures
          </TabsTrigger>
          <TabsTrigger value="quotes" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            Devis
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="info" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="overflow-hidden border shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="bg-muted/50">
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5 text-primary" />
                  Informations de contact
                </CardTitle>
                <CardDescription>Coordonnées du client</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 pt-6">
                {customer.email ? (
                  <div className="flex items-center space-x-2 p-2 rounded-md hover:bg-muted/50 transition-colors">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>{customer.email}</span>
                  </div>
                ) : (
                  <div className="text-muted-foreground italic">Aucun email renseigné</div>
                )}
                
                {customer.phone ? (
                  <div className="flex items-center space-x-2 p-2 rounded-md hover:bg-muted/50 transition-colors">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{customer.phone}</span>
                  </div>
                ) : (
                  <div className="text-muted-foreground italic">Aucun téléphone renseigné</div>
                )}
                
                {customer.address ? (
                  <div className="flex items-start space-x-2 p-2 rounded-md hover:bg-muted/50 transition-colors">
                    <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div>
                      <p>{customer.address}</p>
                      {customer.postal_code && customer.city && (
                        <p>{customer.postal_code} {customer.city}</p>
                      )}
                      {customer.country && <p>{customer.country}</p>}
                    </div>
                  </div>
                ) : (
                  <div className="text-muted-foreground italic">Aucune adresse renseignée</div>
                )}
              </CardContent>
            </Card>
            
            <Card className="overflow-hidden border shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="bg-muted/50">
                <CardTitle className="flex items-center gap-2">
                  {customer.type === "company" ? (
                    <Building className="h-5 w-5 text-primary" />
                  ) : (
                    <User className="h-5 w-5 text-primary" />
                  )}
                  {customer.type === "company" ? "Informations professionnelles" : "Informations personnelles"}
                </CardTitle>
                <CardDescription>
                  {customer.type === "company" 
                    ? "Détails de l'entreprise" 
                    : "Détails du particulier"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 pt-6">
                {customer.type === "company" && customer.business ? (
                  <>
                    <div className="flex items-center space-x-2 p-2 rounded-md hover:bg-muted/50 transition-colors">
                      <Building className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{customer.business.name}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 p-2 rounded-md hover:bg-muted/50 transition-colors">
                      <div>
                        <p className="text-sm text-muted-foreground">SIRET</p>
                        <p className="font-medium">{customer.business.siret}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">SIREN</p>
                        <p className="font-medium">{customer.business.siren}</p>
                      </div>
                    </div>
                    {customer.business.tva_intra && (
                      <div className="p-2 rounded-md hover:bg-muted/50 transition-colors">
                        <p className="text-sm text-muted-foreground">N° TVA Intracommunautaire</p>
                        <p className="font-medium">{customer.business.tva_intra}</p>
                      </div>
                    )}
                    <div className="p-2 rounded-md hover:bg-muted/50 transition-colors">
                      <p className="text-sm text-muted-foreground">TVA Applicable</p>
                      <Badge variant={customer.business.tva_applicable ? "default" : "outline"} className="mt-1">
                        {customer.business.tva_applicable ? "Oui" : "Non"}
                      </Badge>
                    </div>
                  </>
                ) : customer.type === "individual" && customer.individual ? (
                  <>
                    <div className="grid grid-cols-2 gap-4 p-2 rounded-md hover:bg-muted/50 transition-colors">
                      <div>
                        <p className="text-sm text-muted-foreground">Prénom</p>
                        <p className="font-medium">{customer.individual.first_name}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Nom</p>
                        <p className="font-medium">{customer.individual.last_name}</p>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="text-muted-foreground italic">Aucune information disponible</div>
                )}
              </CardContent>
            </Card>
          </div>
          
          <div>
            <Card className="overflow-hidden border shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="bg-muted/50">
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  Historique
                </CardTitle>
                <CardDescription>Dates de création et de modification</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 pt-6">
                <div className="flex items-center space-x-2 p-2 rounded-md hover:bg-muted/50 transition-colors">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Créé le</p>
                    <p className="font-medium">{formatDate(customer.created_at)}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2 p-2 rounded-md hover:bg-muted/50 transition-colors">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Dernière modification</p>
                    <p className="font-medium">{formatDate(customer.updated_at)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="invoices" className="space-y-4">
          <Card className="overflow-hidden border shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="bg-muted/50">
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5 text-primary" />
                Factures
              </CardTitle>
              <CardDescription>Liste des factures du client</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              <div className="flex flex-col gap-4">
                <div className="relative w-full">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Rechercher une facture..."
                    value={invoiceSearch}
                    onChange={(e) => setInvoiceSearch(e.target.value)}
                    className="pl-8 w-full"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <Select
                    value={invoiceStatusFilter}
                    onValueChange={(
                      value: "all" | "sent" | "paid" | "late" | "cancelled"
                    ) => setInvoiceStatusFilter(value as InvoiceStatus)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Statut" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous</SelectItem>
                      <SelectItem value="sent">Envoyée</SelectItem>
                      <SelectItem value="paid">Payée</SelectItem>
                      <SelectItem value="late">En retard</SelectItem>
                      <SelectItem value="cancelled">Annulée</SelectItem>
                    </SelectContent>
                  </Select>
                  <DatePickerWithRange date={invoiceDateRange} setDate={setInvoiceDateRange} className="w-full" />
                </div>
              </div>

              <DataTable
                data={invoicesData?.data?.invoices || []}
                columns={invoiceColumns}
                isLoading={isLoadingInvoices}
                emptyMessage="Aucune facture trouvée"
                onRowClick={(invoice: IInvoice) => router.push(`/invoices/${invoice.invoice_id}`)}
              />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="quotes" className="space-y-4">
          <Card className="overflow-hidden border shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="bg-muted/50">
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Devis
              </CardTitle>
              <CardDescription>Liste des devis du client</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              <div className="flex flex-col gap-4">
                <div className="relative w-full">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Rechercher un devis..."
                    value={quoteSearch}
                    onChange={(e) => setQuoteSearch(e.target.value)}
                    className="pl-8 w-full"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <Select
                    value={quoteStatusFilter}
                    onValueChange={(
                      value: "all" | "draft" | "sent" | "accepted" | "rejected" | "expired"
                    ) => setQuoteStatusFilter(value as QuoteStatus)}
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
                  <DatePickerWithRange date={quoteDateRange} setDate={setQuoteDateRange} className="w-full" />
                </div>
              </div>

              <DataTable
                data={quotesData?.data?.quotes || []}
                columns={quoteColumns}
                isLoading={isLoadingQuotes}
                emptyMessage="Aucun devis trouvé"
                onRowClick={(quote: IQuote) => router.push(`/quotes/${quote.quote_id}`)}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 