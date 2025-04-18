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
import { getInvoiceStatusBadgeVariant, getInvoiceStatusLabel } from "@/utils/invoiceStatus";
import type { EditInvoiceSchema } from "@/components/invoices/edit-invoice-dialog";
import type { AddPaymentSchema } from "@/components/invoices/add-payment-dialog";
import type { IApiErrorResponse } from "@/types/api.types";
import type { IPayment } from "@/types/Payment.interface";

import type { IUpdateInvoiceRequest } from "@/types/Invoice.request.interface";
import type { IInvoiceItem } from "@/types/InvoiceItem.interface";
import { vatRateToNumber } from "@/types/Product.interface";
import type { InvoiceStatus } from "@/types/Invoice.interface";

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
import { AxiosError } from "axios";


export default function InvoiceDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { formatCurrency, formatPercent } = useFormat();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAddPaymentDialogOpen, setIsAddPaymentDialogOpen] = useState(false);

  const { data: invoiceData, isLoading } = useInvoice(params.id as string);
  const downloadPdf = useDownloadInvoicePdf(
    invoiceData?.data?.invoice_number as string
  );
  const updateInvoice = useUpdateInvoice(params.id as string);
  const addPayment = useAddPayment(params.id as string);
  const sendInvoice = useSendInvoice(params.id as string);

  const totalPaid = invoiceData?.data?.payments?.reduce((acc, payment) => acc + Number(payment.amount), 0);

  const handleUpdateInvoice = async (data: Partial<EditInvoiceSchema>) => {
    await updateInvoice.mutateAsync(data as IUpdateInvoiceRequest);
    setIsEditDialogOpen(false);
  };

  const handleAddPayment = async (data: AddPaymentSchema) => {
    await addPayment.mutateAsync(data);
    setIsAddPaymentDialogOpen(false);
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
      <div className="container mx-auto px-4 py-6">
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
      <div className="container mx-auto px-4 py-6">
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
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between items-start gap-4">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Button variant="outline" className="rounded-full" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h1 className="text-xl sm:text-2xl font-bold font-dmSans flex items-center">
            <FileText className="w-5 sm:w-6 h-5 sm:h-6 mr-2 flex-shrink-0" />
            Facture {invoiceData?.data?.invoice_number}
          </h1>
        </div>
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          <EditInvoiceDialog
            open={isEditDialogOpen}
            onOpenChange={setIsEditDialogOpen}
            onSubmit={handleUpdateInvoice}
            defaultValues={{
              invoice_date: invoiceData.data?.invoice_date || new Date(),
              due_date: invoiceData.data?.due_date || new Date(),
              conditions: invoiceData.data?.conditions,
              late_payment_penalty: invoiceData.data?.late_payment_penalty,
            }}
            isLoading={updateInvoice.isPending}
            isError={updateInvoice.isError}
            error={{message:(updateInvoice.error as AxiosError<IApiErrorResponse>)?.response?.data?.message, errors:(updateInvoice.error as AxiosError<IApiErrorResponse>)?.response?.data?.errors}}
          />
          <AddPaymentDialog
            open={isAddPaymentDialogOpen}
            onOpenChange={setIsAddPaymentDialogOpen}
            onSubmit={handleAddPayment}
            invoiceAmount={invoiceData.data?.amount_including_tax || 0}
            totalPaid={totalPaid || 0}
            isLoading={addPayment.isPending}
            isError={addPayment.isError}
            error={{message:(addPayment.error as AxiosError<IApiErrorResponse>)?.response?.data?.message, errors:(addPayment.error as AxiosError<IApiErrorResponse>)?.response?.data?.errors}}
          />
          <div className="flex flex-wrap gap-2 w-full">
            {invoiceData.data?.status !== "cancelled" &&
              invoiceData.data?.status !== "paid" && (
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
                    onClick={() => sendInvoice.mutate(invoiceData.data?.invoice_id || "")}
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
                  variant={getInvoiceStatusBadgeVariant(invoiceData.data?.status as InvoiceStatus)}
                  className="px-4 py-1"
                >
                  <span className="flex items-center gap-2">
                    {getStatusIcon(invoiceData.data?.status as InvoiceStatus)}
                    {getInvoiceStatusLabel(invoiceData.data?.status as InvoiceStatus)}
                  </span>
                </Badge>
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 text-sm text-muted-foreground w-full">
                  <div className="flex items-center gap-2">
                    <CalendarDays className="w-4 h-4 flex-shrink-0" />
                    <span>
                      Émise le{" "}
                      {new Date(invoiceData.data?.invoice_date || "").toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 flex-shrink-0" />
                    <span>
                      Échéance le{" "}
                      {new Date(invoiceData.data?.due_date || "").toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
             
                <div className="text-right w-full sm:w-auto">
                  <p className="text-sm text-muted-foreground">Total TTC</p>
                  <p className="text-xl sm:text-2xl font-bold">
                  {formatCurrency(invoiceData.data?.amount_including_tax || 0)}
                </p>
                <p className="text-xs text-muted-foreground">Total payé : {formatCurrency(totalPaid || 0)}</p>
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
                    {invoiceData.data?.customer?.type === "company" ? (
                      <Building className="w-4 h-4" />
                    ) : (
                      <User className="w-4 h-4" />
                    )}
                  </Badge>
                  <div>
                    <p className="font-medium">
                      {invoiceData.data?.customer?.type === "company"
                        ? invoiceData.data?.customer?.business?.name
                        : `${invoiceData.data?.customer?.individual?.first_name} ${invoiceData.data?.customer?.individual?.last_name}`}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {invoiceData.data?.customer?.email || "-"}
                    </p>
                  </div>
                </div>

                <div className="grid gap-4">
                  {invoiceData.data?.customer?.type === "company" && (
                    <>
                      {/* Informations entreprise */}
                      <div className="space-y-2">
                        <h3 className="text-sm font-medium">
                          Informations entreprise
                        </h3>
                        <div className="space-y-1 text-sm text-muted-foreground">
                          {invoiceData.data?.customer?.business?.tva_applicable && (
                            <p>
                              N° TVA : {invoiceData.data?.customer?.business?.tva_intra}
                            </p>
                          )}
                          {invoiceData.data?.customer?.business?.siret && (
                            <p>SIRET : {invoiceData.data?.customer?.business?.siret}</p>
                          )}
                        </div>
                      </div>
                    </>
                  )}

                  {/* Adresse de facturation */}
                  {(invoiceData.data?.customer?.address ||
                    invoiceData.data?.customer?.postal_code ||
                    invoiceData.data?.customer?.city ||
                    invoiceData.data?.customer?.country) && (
                    <div className="space-y-2">
                      <h3 className="text-sm font-medium">
                        Adresse de facturation
                      </h3>
                      <div className="space-y-1 text-sm text-muted-foreground">
                        {invoiceData.data?.customer?.address && (
                          <p>{invoiceData.data?.customer?.address}</p>
                        )}

                        <p>
                          {invoiceData.data?.customer?.postal_code}{" "}
                          {invoiceData.data?.customer?.city}
                        </p>
                        {invoiceData.data?.customer?.country && (
                          <p>{invoiceData.data?.customer?.country}</p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Informations de contact */}
                  {invoiceData.data?.customer?.phone && (
                    <div className="space-y-2">
                      <h3 className="text-sm font-medium">Contact</h3>
                      <p className="text-sm text-muted-foreground">
                        {invoiceData.data?.customer?.phone}
                      </p>
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
                  {invoiceData.data?.items?.map((item: IInvoiceItem) => {
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
                <span>{formatCurrency(invoiceData.data?.amount_excluding_tax || 0)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">TVA</span>
                <span>{formatCurrency(invoiceData.data?.tax || 0)}</span>
              </div>
              <Separator />
              <div className="flex justify-between font-medium">
                <span>Total TTC</span>
                <span>{formatCurrency(invoiceData.data?.amount_including_tax || 0)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payments Table */}
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <CardTitle>Paiements</CardTitle>
              {invoiceData.data?.status !== "cancelled" &&
                invoiceData.data?.status !== "paid" && (
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
              {invoiceData.data?.payments?.length
                ? `${invoiceData.data?.payments.length} paiement${
                    invoiceData.data?.payments.length > 1 ? "s" : ""
                  } enregistré${invoiceData.data?.payments.length > 1 ? "s" : ""}`
                : "Aucun paiement enregistré"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {invoiceData.data?.payments && invoiceData.data?.payments.length > 0 ? (
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
                    {invoiceData.data?.payments.map((payment: IPayment) => (
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
                {invoiceData.data?.status !== "cancelled" &&
                  invoiceData.data?.status !== "paid" && (
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
        {(invoiceData.data?.conditions || invoiceData.data?.late_payment_penalty) && (
          <Card>
            <CardHeader>
              <CardTitle>Informations complémentaires</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {invoiceData.data?.conditions && (
                <div className="space-y-2">
                  <h3 className="font-medium">Conditions de paiement</h3>
                  <p className="text-sm text-muted-foreground">
                    {invoiceData.data?.conditions}
                  </p>
                </div>
              )}
              {invoiceData.data?.late_payment_penalty && (
                <div className="space-y-2">
                  <h3 className="font-medium">Pénalités de retard</h3>
                  <p className="text-sm text-muted-foreground">
                    {invoiceData.data?.late_payment_penalty}
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
