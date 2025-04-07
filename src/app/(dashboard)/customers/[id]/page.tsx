"use client";

import React, { useState } from "react";
import { IInvoice } from "@/types/Invoice.interface";
import { IQuote } from "@/types/Quote.interface";
import { getInvoiceStatusBadgeVariant, getInvoiceStatusLabel } from "@/utils/invoiceStatus";  
import { getQuoteStatusBadgeVariant, getQuoteStatusLabel } from "@/utils/quoteStatus";
import { useFormat } from "@/hooks/useFormat";
import { useCustomer, useDeleteCustomer } from "@/hooks/useCustomer";
import { useCustomerInvoices } from "@/hooks/useInvoice";
import { useCustomerQuotes } from "@/hooks/useQuote";
import { useParams, useRouter } from "next/navigation";
import { 
  Building, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Edit, 
  Trash2, 
  ArrowLeft, 
  Loader2,
  FileText,
  CreditCard,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { useToast } from "@/hooks/use-toast";
import NiceModal from "@ebay/nice-modal-react";
import EditCustomerDialog from "@/components/customers/edit-customer-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { DataTable, StatusBadge } from "@/components/ui/data-table";

export default function CustomerDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const customerId = params.id as string;
  const { formatCurrency } = useFormat();
  const { data, isLoading, isError } = useCustomer(customerId);
  const { data: invoicesData, isLoading: isLoadingInvoices } = useCustomerInvoices(customerId);
  const { data: quotesData, isLoading: isLoadingQuotes } = useCustomerQuotes(customerId);
  const deleteCustomerMutation = useDeleteCustomer();
  
  const [isDeleting, setIsDeleting] = useState(false);
  const [activeTab, setActiveTab] = useState("info");
  
  const customer = data?.data;
  
  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteCustomerMutation.mutateAsync(customerId);
      toast({
        title: "Client supprimé",
        description: "Le client a été supprimé avec succès",
      });
      router.push("/customers");
    } catch (error) {
      console.error("Erreur lors de la suppression du client:", error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la suppression du client",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };
  
  
  const handleEdit = () => {
    if (customer) {
      NiceModal.show(EditCustomerDialog, { customer });
    }
  };
  
  if (isLoading) {
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
  
  if (isError || !customer) {
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

  
  const customerName = customer.type === "company" 
    ? customer.business?.name 
    : `${customer.individual?.first_name} ${customer.individual?.last_name}`;
  
  return (
    <div className="container mx-auto px-4 py-6 space-y-8">
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
        
        <TabsContent value="invoices" className="mt-6">
          <div>
            <Card className="overflow-hidden border shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="bg-muted/50">
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-primary" />
                  Factures
                </CardTitle>
                <CardDescription>Liste des factures associées à ce client</CardDescription>
              </CardHeader>
              <CardContent className="py-8">
                {isLoadingInvoices ? (
                  <div className="flex flex-col items-center justify-center text-center">
                    <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
                    <p className="text-sm text-muted-foreground">Chargement des factures...</p>
                  </div>
                ) : invoicesData?.data?.invoices?.length === 0 ? (
                  <div className="flex flex-col items-center justify-center text-center">
                    <div className="bg-primary/10 p-4 rounded-full mb-4">
                      <CreditCard className="h-12 w-12 text-primary" />
                    </div>
                    <h3 className="text-lg font-medium">Aucune facture</h3>
                    <p className="text-sm text-muted-foreground mt-1 max-w-md">
                      Ce client n&apos;a pas encore de factures.
                    </p>
                  </div>
                ) : (
                  <DataTable
                    data={invoicesData?.data?.invoices || []}
                    columns={[
                      {
                        header: "Numéro",
                        accessorKey: (invoice: IInvoice) => (
                          <div className="flex items-center gap-2">
                            <CreditCard className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">#{invoice.invoice_number}</span>
                          </div>
                        ),
                      },
                      {
                        header: "Date",
                        accessorKey: (invoice: IInvoice) => formatDate(new Date(invoice.invoice_date).toISOString()),
                        className: "hidden sm:table-cell",
                      },
                      {
                        header: "Échéance",
                        accessorKey: (invoice: IInvoice) => formatDate(new Date(invoice.due_date).toISOString()),
                        className: "hidden sm:table-cell",
                      },
                      {
                        header: "Montant",
                            accessorKey: (invoice: IInvoice) => formatCurrency(invoice.amount_including_tax),
                        className: "tabular-nums",
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
                    ]}
                    onRowClick={(invoice: IInvoice) => router.push(`/invoices/${invoice.invoice_id}`)}
                  />
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="quotes" className="mt-6">
          <div>
            <Card className="overflow-hidden border shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="bg-muted/50">
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  Devis
                </CardTitle>
                <CardDescription>Liste des devis associés à ce client</CardDescription>
              </CardHeader>
              <CardContent className="py-8">
                {isLoadingQuotes ? (
                  <div className="flex flex-col items-center justify-center text-center">
                    <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
                    <p className="text-sm text-muted-foreground">Chargement des devis...</p>
                  </div>
                ) : quotesData?.data?.quotes?.length === 0 ? (
                  <div className="flex flex-col items-center justify-center text-center">
                    <div className="bg-primary/10 p-4 rounded-full mb-4">
                      <FileText className="h-12 w-12 text-primary" />
                    </div>
                    <h3 className="text-lg font-medium">Aucun devis</h3>
                    <p className="text-sm text-muted-foreground mt-1 max-w-md">
                      Ce client n&apos;a pas encore de devis.
                    </p>
                  </div>
                ) : (
                  <DataTable
                    data={quotesData?.data?.quotes || []}
                    columns={[
                      {
                        header: "Numéro",
                        accessorKey: (quote: IQuote) => (
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">#{quote.quote_number}</span>
                          </div>
                        ),
                      },
                      {
                        header: "Date",
                        accessorKey: (quote: IQuote) => formatDate(new Date(quote.quote_date).toISOString()),
                        className: "hidden sm:table-cell",
                      },
                      {
                        header: "Validité",
                        accessorKey: (quote: IQuote) => formatDate(new Date(quote.validity_date).toISOString()),
                        className: "hidden sm:table-cell",
                      },
                      {
                        header: "Montant",
                        accessorKey: (quote: IQuote) => formatCurrency(quote.amount_including_tax),
                        className: "tabular-nums",
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
                    ]}
                    onRowClick={(quote: IQuote) => router.push(`/quotes/${quote.quote_id}`)}
                  />
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
} 