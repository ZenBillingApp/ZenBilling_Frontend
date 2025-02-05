"use client";

import { useParams, useRouter } from "next/navigation";
import {
  useInvoice,
  useDownloadInvoicePdf,
  useUpdateInvoice,
  useAddPayment,
  useSendInvoice,
} from "@/hooks/useInvoice";
import { useFormat } from "@/hooks/useFormat";
import { useState } from "react";
import type { EditInvoiceSchema } from "@/components/invoices/edit-invoice-dialog";
import type { AddPaymentSchema } from "@/components/invoices/add-payment-dialog";
import type { ApiError } from "@/services/api";
import type { IPayment } from "@/types/Payment.interface";

import type { IUpdateInvoiceRequest } from "@/types/Invoice.request.interface";
import type { IInvoiceItem } from "@/types/InvoiceItem.interface";
import { vatRateToNumber } from "@/types/Product.interface";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Building,
  User,
  FileText,
  CalendarDays,
  Clock,
  ArrowLeft,
  Download,
  Ban,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Pencil,
  Plus,
  Send,
} from "lucide-react";
import { EditInvoiceDialog } from "@/components/invoices/edit-invoice-dialog";
import { AddPaymentDialog } from "@/components/invoices/add-payment-dialog";

export default function InvoiceDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { formatCurrency, formatPercent } = useFormat();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAddPaymentDialogOpen, setIsAddPaymentDialogOpen] = useState(false);

  const { data: invoiceData, isLoading } = useInvoice(params.id as string);
  const downloadPdf = useDownloadInvoicePdf(
    invoiceData?.invoice_number as string
  );
  const updateInvoice = useUpdateInvoice(params.id as string);
  const addPayment = useAddPayment(params.id as string);
  const sendInvoice = useSendInvoice(params.id as string);

  const handleUpdateInvoice = async (data: Partial<EditInvoiceSchema>) => {
    await updateInvoice.mutateAsync(data as IUpdateInvoiceRequest);
    setIsEditDialogOpen(false);
  };

  const handleAddPayment = async (data: AddPaymentSchema) => {
    await addPayment.mutateAsync(data);
    setIsAddPaymentDialogOpen(false);
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "paid":
        return <CheckCircle2 className="w-4 h-4" />;
      case "pending":
        return <AlertCircle className="w-4 h-4" />;
      case "sent":
        return <Send className="w-4 h-4" />;
      case "late":
        return <Ban className="w-4 h-4" />;
      case "cancelled":
        return <Ban className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const getPaymentMethodLabel = (method: string) => {
    switch (method) {
      case "credit_card":
        return "Carte bancaire";
      case "bank_transfer":
        return "Virement";
      case "cash":
        return "Espèces";
      default:
        return method;
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-6 max-w-5xl">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/4"></div>
          <div className="h-[200px] bg-muted rounded"></div>
          <div className="h-[400px] bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  if (!invoiceData) {
    return (
      <div className="container mx-auto px-4 py-6 max-w-5xl">
        <Card>
          <CardHeader>
            <CardTitle>Facture introuvable</CardTitle>
            <CardDescription>
              Cette facture n&apos;existe pas ou a été supprimée.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.back()}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col justify-between items-start gap-4">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Button variant="outline" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h1 className="text-xl sm:text-2xl font-bold font-dmSans flex items-center">
            <FileText className="w-5 sm:w-6 h-5 sm:h-6 mr-2 flex-shrink-0" />
            Facture {invoiceData?.invoice_number}
          </h1>
        </div>
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          <EditInvoiceDialog
            open={isEditDialogOpen}
            onOpenChange={setIsEditDialogOpen}
            onSubmit={handleUpdateInvoice}
            defaultValues={{
              invoice_date: invoiceData.invoice_date,
              due_date: invoiceData.due_date,
              conditions: invoiceData.conditions,
              late_payment_penalty: invoiceData.late_payment_penalty,
            }}
            isLoading={updateInvoice.isPending}
            isError={updateInvoice.isError}
            error={(updateInvoice.error as ApiError)?.response?.data}
          />
          <AddPaymentDialog
            open={isAddPaymentDialogOpen}
            onOpenChange={setIsAddPaymentDialogOpen}
            onSubmit={handleAddPayment}
            invoiceAmount={invoiceData.amount_including_tax}
            isLoading={addPayment.isPending}
            isError={addPayment.isError}
            error={(addPayment.error as ApiError)?.response?.data}
          />
          <div className="flex flex-wrap gap-2 w-full">
            {invoiceData.status !== "cancelled" &&
              invoiceData.status !== "paid" && (
                <>
                  <Button
                    variant="outline"
                    onClick={() => setIsEditDialogOpen(true)}
                    className="flex-1 sm:flex-none"
                  >
                    <Pencil className="w-4 h-4 mr-2" />
                    <span className="hidden sm:inline">Modifier</span>
                  </Button>

                  <Button
                    variant="outline"
                    onClick={() => setIsAddPaymentDialogOpen(true)}
                    className="flex-1 sm:flex-none"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    <span className="hidden sm:inline">
                      Ajouter un paiement
                    </span>
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => sendInvoice.mutate()}
                    disabled={sendInvoice.isPending}
                    className="flex-1 sm:flex-none"
                  >
                    {sendInvoice.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        <span className="hidden sm:inline">
                          Envoi en cours...
                        </span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        <span className="hidden sm:inline">
                          Envoyer au client
                        </span>
                      </>
                    )}
                  </Button>
                </>
              )}
            <Button
              variant="outline"
              onClick={() => downloadPdf.mutate(params.id as string)}
              disabled={downloadPdf.isPending}
              className="flex-1 sm:flex-none"
            >
              {downloadPdf.isPending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Download className="w-4 h-4 mr-2" />
              )}
              <span className="hidden sm:inline">Télécharger</span>
            </Button>
          </div>
        </div>
      </div>

      <div className="grid gap-6">
        {/* Status Card */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full">
                <Badge
                  variant={getStatusBadgeVariant(invoiceData.status)}
                  className="px-4 py-1"
                >
                  <span className="flex items-center gap-2">
                    {getStatusIcon(invoiceData.status)}
                    {getStatusLabel(invoiceData.status)}
                  </span>
                </Badge>
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 text-sm text-muted-foreground w-full">
                  <div className="flex items-center gap-2">
                    <CalendarDays className="w-4 h-4 flex-shrink-0" />
                    <span>
                      Émise le{" "}
                      {new Date(invoiceData.invoice_date).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 flex-shrink-0" />
                    <span>
                      Échéance le{" "}
                      {new Date(invoiceData.due_date).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
              <div className="text-right w-full sm:w-auto">
                <p className="text-sm text-muted-foreground">Total TTC</p>
                <p className="text-xl sm:text-2xl font-bold">
                  {formatCurrency(invoiceData.amount_including_tax)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Client & Company Info */}
        <div className="grid sm:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Client</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <Badge variant="outline" className="mt-1">
                    {invoiceData.customer?.type === "company" ? (
                      <Building className="w-4 h-4" />
                    ) : (
                      <User className="w-4 h-4" />
                    )}
                  </Badge>
                  <div>
                    <p className="font-medium">
                      {invoiceData.customer?.type === "company"
                        ? invoiceData.customer.business?.name
                        : `${invoiceData.customer?.individual?.first_name} ${invoiceData.customer?.individual?.last_name}`}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {invoiceData.customer?.email || "-"}
                    </p>
                  </div>
                </div>

                <div className="grid gap-4">
                  {invoiceData.customer?.type === "company" && (
                    <>
                      {/* Informations entreprise */}
                      <div className="space-y-2">
                        <h3 className="text-sm font-medium">
                          Informations entreprise
                        </h3>
                        <div className="space-y-1 text-sm text-muted-foreground">
                          {invoiceData.customer?.business?.tva_applicable && (
                            <p>
                              N° TVA : {invoiceData.customer.business.tva_intra}
                            </p>
                          )}
                          {invoiceData.customer?.business?.siret && (
                            <p>SIRET : {invoiceData.customer.business.siret}</p>
                          )}
                        </div>
                      </div>
                    </>
                  )}

                  {/* Adresse de facturation */}
                  {(invoiceData.customer?.address ||
                    invoiceData.customer?.postal_code ||
                    invoiceData.customer?.city ||
                    invoiceData.customer?.country) && (
                    <div className="space-y-2">
                      <h3 className="text-sm font-medium">
                        Adresse de facturation
                      </h3>
                      <div className="space-y-1 text-sm text-muted-foreground">
                        {invoiceData.customer?.address && (
                          <p>{invoiceData.customer.address}</p>
                        )}

                        <p>
                          {invoiceData.customer?.postal_code}{" "}
                          {invoiceData.customer?.city}
                        </p>
                        {invoiceData.customer?.country && (
                          <p>{invoiceData.customer.country}</p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Informations de contact */}
                  {invoiceData.customer?.phone && (
                    <div className="space-y-2">
                      <h3 className="text-sm font-medium">Contact</h3>
                      <p className="text-sm text-muted-foreground">
                        {invoiceData.customer.phone}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Votre entreprise</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <Badge variant="outline" className="mt-1">
                    <Building className="w-4 h-4" />
                  </Badge>
                  <div>
                    <p className="font-medium">{invoiceData.company?.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {invoiceData.company?.email}
                    </p>
                  </div>
                </div>

                <div className="grid gap-4">
                  {/* Informations légales */}
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium">
                      Informations légales
                    </h3>
                    <div className="space-y-1 text-sm text-muted-foreground">
                      {invoiceData.company?.tva_applicable && (
                        <p>N° TVA : {invoiceData.company.tva_intra}</p>
                      )}
                      {invoiceData.company?.siret && (
                        <p>SIRET : {invoiceData.company.siret}</p>
                      )}
                    </div>
                  </div>

                  {/* Adresse */}
                  {(invoiceData.company?.address ||
                    invoiceData.company?.postal_code ||
                    invoiceData.company?.city ||
                    invoiceData.company?.country) && (
                    <div className="space-y-2">
                      <h3 className="text-sm font-medium">Adresse</h3>
                      <div className="space-y-1 text-sm text-muted-foreground">
                        {invoiceData.company?.address && (
                          <p>{invoiceData.company.address}</p>
                        )}
                        <p>
                          {invoiceData.company?.postal_code}{" "}
                          {invoiceData.company?.city}
                        </p>
                        {invoiceData.company?.country && (
                          <p>{invoiceData.company.country}</p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Contact */}
                  {(invoiceData.company?.phone ||
                    invoiceData.company?.website) && (
                    <div className="space-y-2">
                      <h3 className="text-sm font-medium">Contact</h3>
                      <div className="space-y-1 text-sm text-muted-foreground">
                        {invoiceData.company?.phone && (
                          <p>{invoiceData.company.phone}</p>
                        )}
                        {invoiceData.company?.website && (
                          <p>{invoiceData.company.website}</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Products Table */}
        <Card>
          <CardHeader>
            <CardTitle>Produits</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[40%]">Produit</TableHead>
                    <TableHead className="hidden sm:table-cell">
                      Prix unitaire HT
                    </TableHead>
                    <TableHead className="hidden sm:table-cell">TVA</TableHead>
                    <TableHead>Quantité</TableHead>
                    <TableHead className="hidden sm:table-cell">
                      Unité
                    </TableHead>
                    <TableHead className="hidden lg:table-cell">
                      Total HT
                    </TableHead>
                    <TableHead>Total TTC</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoiceData.items?.map((item: IInvoiceItem) => {
                    const totalHT =
                      item.quantity * item.unit_price_excluding_tax;
                    const totalTTC =
                      totalHT * (1 + vatRateToNumber(item.vat_rate) / 100);

                    return (
                      <TableRow key={item.item_id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{item.name}</p>
                            {item.description && (
                              <p className="text-sm text-muted-foreground line-clamp-2">
                                {item.description}
                              </p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">
                          {formatCurrency(item.unit_price_excluding_tax)}
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">
                          {formatPercent(vatRateToNumber(item.vat_rate))}
                        </TableCell>
                        <TableCell>{item.quantity}</TableCell>
                        <TableCell className="hidden sm:table-cell">
                          <Badge variant="outline" className="w-fit">
                            {item.unit}
                          </Badge>
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          {formatCurrency(totalHT)}
                        </TableCell>
                        <TableCell>{formatCurrency(totalTTC)}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>

            <div className="mt-6 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total HT</span>
                <span>{formatCurrency(invoiceData.amount_excluding_tax)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">TVA</span>
                <span>{formatCurrency(invoiceData.tax)}</span>
              </div>
              <Separator />
              <div className="flex justify-between font-medium">
                <span>Total TTC</span>
                <span>{formatCurrency(invoiceData.amount_including_tax)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payments Table */}
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <CardTitle>Paiements</CardTitle>
              {invoiceData.status !== "cancelled" &&
                invoiceData.status !== "paid" && (
                  <Button
                    variant="outline"
                    onClick={() => setIsAddPaymentDialogOpen(true)}
                    className="w-full sm:w-auto"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Ajouter un paiement
                  </Button>
                )}
            </div>
            <CardDescription>
              {invoiceData.payments?.length
                ? `${invoiceData.payments.length} paiement${
                    invoiceData.payments.length > 1 ? "s" : ""
                  } enregistré${invoiceData.payments.length > 1 ? "s" : ""}`
                : "Aucun paiement enregistré"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {invoiceData.payments && invoiceData.payments.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Montant</TableHead>
                      <TableHead className="hidden sm:table-cell">
                        Méthode
                      </TableHead>
                      <TableHead className="hidden lg:table-cell">
                        Description
                      </TableHead>
                      <TableHead className="hidden lg:table-cell">
                        Référence
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {invoiceData.payments.map((payment: IPayment) => (
                      <TableRow key={payment.payment_id}>
                        <TableCell>
                          {new Date(payment.payment_date).toLocaleDateString()}
                        </TableCell>
                        <TableCell>{formatCurrency(payment.amount)}</TableCell>
                        <TableCell className="hidden sm:table-cell">
                          {getPaymentMethodLabel(payment.payment_method)}
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          {payment.description || "-"}
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          {payment.reference || "-"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-6 text-center text-muted-foreground">
                <FileText className="w-12 h-12 mb-4" />
                <p>
                  Aucun paiement n&apos;a été enregistré pour cette facture.
                </p>
                {invoiceData.status !== "cancelled" &&
                  invoiceData.status !== "paid" && (
                    <Button
                      variant="link"
                      onClick={() => setIsAddPaymentDialogOpen(true)}
                      className="mt-2"
                    >
                      Ajouter un paiement
                    </Button>
                  )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Additional Information */}
        {(invoiceData.conditions || invoiceData.late_payment_penalty) && (
          <Card>
            <CardHeader>
              <CardTitle>Informations complémentaires</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {invoiceData.conditions && (
                <div className="space-y-2">
                  <h3 className="font-medium">Conditions de paiement</h3>
                  <p className="text-sm text-muted-foreground">
                    {invoiceData.conditions}
                  </p>
                </div>
              )}
              {invoiceData.late_payment_penalty && (
                <div className="space-y-2">
                  <h3 className="font-medium">Pénalités de retard</h3>
                  <p className="text-sm text-muted-foreground">
                    {invoiceData.late_payment_penalty}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
