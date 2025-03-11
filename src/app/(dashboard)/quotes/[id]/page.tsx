"use client";

import { useParams, useRouter } from "next/navigation";
import {
  useQuote,
  useDownloadQuotePdf,
  useUpdateQuote,
  useSendQuote,
} from "@/hooks/useQuote";
import { useFormat } from "@/hooks/useFormat";
import { useState } from "react";
import type { EditQuoteSchema } from "@/components/quotes/edit-quote-dialog";
import type { IApiErrorResponse } from "@/types/api.types";
import type { IQuoteItem } from "@/types/QuoteItem.interface";
import type { IUpdateQuoteRequest } from "@/types/Quote.request.interface";
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
  Send,
  ThumbsUp,
  ThumbsDown,
} from "lucide-react";
import { EditQuoteDialog } from "@/components/quotes/edit-quote-dialog";

export default function QuoteDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { formatCurrency, formatPercent } = useFormat();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const { data: quoteData, isLoading } = useQuote(params.id as string);
  const downloadPdf = useDownloadQuotePdf(quoteData?.quote_number as string);
  const updateQuote = useUpdateQuote(params.id as string);
  const sendQuote = useSendQuote(params.id as string);

  const handleUpdateQuote = async (data: Partial<EditQuoteSchema>) => {
    const updateData: IUpdateQuoteRequest = {
      quote_date: data.quote_date,
      validity_date: data.validity_date,
      conditions: data.conditions || undefined,
      notes: data.notes || undefined,
    };
    await updateQuote.mutateAsync(updateData);
    setIsEditDialogOpen(false);
  };

  const handleUpdateStatus = async (
    status: "sent" | "accepted" | "rejected"
  ) => {
    await updateQuote.mutateAsync({ status });
  };

  const getStatusBadgeVariant = (status: string) => {
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

  const getStatusLabel = (status: string) => {
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "accepted":
        return <CheckCircle2 className="w-4 h-4" />;
      case "sent":
        return <Send className="w-4 h-4" />;
      case "draft":
        return <AlertCircle className="w-4 h-4" />;
      case "rejected":
        return <Ban className="w-4 h-4" />;
      case "expired":
        return <Ban className="w-4 h-4" />;
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-6 max-w-5xl">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-1/4"></div>
          <div className="h-[200px] bg-muted rounded"></div>
          <div className="h-[400px] bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  if (!quoteData) {
    return (
      <div className="container mx-auto px-4 py-6 max-w-5xl">
        <Card>
          <CardHeader>
            <CardTitle>Devis introuvable</CardTitle>
            <CardDescription>
              Ce devis n&apos;existe pas ou a été supprimé.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <Button onClick={() => router.back()} variant="outline">
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
          <h1 className="text-2xl font-bold font-dmSans flex items-center">
            <FileText className="w-6 h-6 mr-2 flex-shrink-0" />
            Devis {quoteData?.quote_number}
          </h1>
        </div>
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          <EditQuoteDialog
            open={isEditDialogOpen}
            onOpenChange={setIsEditDialogOpen}
            onSubmit={handleUpdateQuote}
            defaultValues={{
              quote_date: quoteData.quote_date,
              validity_date: quoteData.validity_date,
              conditions: quoteData.conditions,
              notes: quoteData.notes,
            }}
            isLoading={updateQuote.isPending}
            isError={updateQuote.isError}
            error={{message:(updateQuote.error as IApiErrorResponse)?.message, errors:(updateQuote.error as IApiErrorResponse)?.errors}}
          />
          <div className="flex flex-wrap gap-2 w-full">
            {quoteData.status === "draft" && (
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
                  onClick={() => sendQuote.mutate()}
                  disabled={sendQuote.isPending}
                  className="flex-1 sm:flex-none"
                >
                  {sendQuote.isPending ? (
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
            {quoteData.status === "sent" && (
              <>
                <Button
                  variant="outline"
                  onClick={() => handleUpdateStatus("accepted")}
                  className="flex-1 sm:flex-none"
                >
                  <ThumbsUp className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">
                    Marquer comme accepté
                  </span>
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleUpdateStatus("rejected")}
                  className="flex-1 sm:flex-none"
                >
                  <ThumbsDown className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">Marquer comme refusé</span>
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
        <Card className="bg-card">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full">
                <Badge
                  variant={getStatusBadgeVariant(quoteData.status)}
                  className="px-4 py-1.5 text-sm w-fit"
                >
                  <span className="flex items-center gap-2">
                    {getStatusIcon(quoteData.status)}
                    {getStatusLabel(quoteData.status)}
                  </span>
                </Badge>
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 text-sm text-muted-foreground w-full">
                  <div className="flex items-center gap-2">
                    <CalendarDays className="w-4 h-4 flex-shrink-0" />
                    <span>
                      Émis le{" "}
                      {new Date(quoteData.quote_date).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 flex-shrink-0" />
                    <span>
                      Valide jusqu&apos;au{" "}
                      {new Date(quoteData.validity_date).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
              <div className="text-right w-full sm:w-auto">
                <p className="text-sm text-muted-foreground">Total TTC</p>
                <p className="text-2xl font-bold tabular-nums">
                  {formatCurrency(quoteData.amount_including_tax)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Client Info */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="bg-card">
            <CardHeader>
              <CardTitle className="text-lg">Client</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <Badge variant="outline" className="mt-1 px-2 py-1">
                    {quoteData.customer?.type === "company" ? (
                      <Building className="w-4 h-4" />
                    ) : (
                      <User className="w-4 h-4" />
                    )}
                  </Badge>
                  <div>
                    <p className="font-medium">
                      {quoteData.customer?.type === "company"
                        ? quoteData.customer.business?.name
                        : `${quoteData.customer?.individual?.first_name} ${quoteData.customer?.individual?.last_name}`}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {quoteData.customer?.email || "-"}
                    </p>
                  </div>
                </div>

                <div className="grid gap-4">
                  {quoteData.customer?.type === "company" && (
                    <>
                      <div className="space-y-2">
                        <h3 className="text-sm font-medium">
                          Informations entreprise
                        </h3>
                        <div className="space-y-1 text-sm text-muted-foreground">
                          {quoteData.customer?.business?.tva_applicable && (
                            <p>
                              N° TVA : {quoteData.customer?.business.tva_intra}
                            </p>
                          )}
                          {quoteData.customer?.business?.siret && (
                            <p>SIRET : {quoteData.customer?.business.siret}</p>
                          )}
                        </div>
                      </div>
                    </>
                  )}

                  {(quoteData.customer?.address ||
                    quoteData.customer?.postal_code ||
                    quoteData.customer?.city ||
                    quoteData.customer?.country) && (
                    <div className="space-y-2">
                      <h3 className="text-sm font-medium">Adresse</h3>
                      <div className="space-y-1 text-sm text-muted-foreground">
                        {quoteData.customer?.address && (
                          <p>{quoteData.customer?.address}</p>
                        )}
                        <p>
                          {quoteData.customer?.postal_code}{" "}
                          {quoteData.customer?.city}
                        </p>
                        {quoteData.customer?.country && (
                          <p>{quoteData.customer?.country}</p>
                        )}
                      </div>
                    </div>
                  )}

                  {quoteData.customer?.phone && (
                    <div className="space-y-2">
                      <h3 className="text-sm font-medium">Contact</h3>
                      <p className="text-sm text-muted-foreground">
                        {quoteData.customer?.phone}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Additional Information */}
          {(quoteData.conditions || quoteData.notes) && (
            <Card className="bg-card">
              <CardHeader>
                <CardTitle className="text-lg">
                  Informations complémentaires
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {quoteData.conditions && (
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium">Conditions</h3>
                    <p className="text-sm text-muted-foreground">
                      {quoteData.conditions}
                    </p>
                  </div>
                )}
                {quoteData.notes && (
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium">Notes</h3>
                    <p className="text-sm text-muted-foreground">
                      {quoteData.notes}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Products Table */}
        <Card className="bg-card">
          <CardHeader>
            <CardTitle className="text-lg">Produits</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto -mx-6">
              <div className="inline-block min-w-full align-middle px-6">
                <div className="overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[40%] font-medium">
                          Produit
                        </TableHead>
                        <TableHead className="hidden sm:table-cell font-medium">
                          Prix unitaire HT
                        </TableHead>
                        <TableHead className="hidden sm:table-cell font-medium">
                          TVA
                        </TableHead>
                        <TableHead className="font-medium">Quantité</TableHead>
                        <TableHead className="hidden sm:table-cell font-medium">
                          Unité
                        </TableHead>
                        <TableHead className="hidden lg:table-cell font-medium">
                          Total HT
                        </TableHead>
                        <TableHead className="font-medium">Total TTC</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {quoteData.items?.map((item: IQuoteItem) => {
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
                            <TableCell className="hidden sm:table-cell tabular-nums">
                              {formatCurrency(item.unit_price_excluding_tax)}
                            </TableCell>
                            <TableCell className="hidden sm:table-cell">
                              {formatPercent(vatRateToNumber(item.vat_rate))}
                            </TableCell>
                            <TableCell className="tabular-nums">
                              {item.quantity}
                            </TableCell>
                            <TableCell className="hidden sm:table-cell">
                              <Badge variant="outline" className="w-fit">
                                {item.unit}
                              </Badge>
                            </TableCell>
                            <TableCell className="hidden lg:table-cell tabular-nums">
                              {formatCurrency(totalHT)}
                            </TableCell>
                            <TableCell className="tabular-nums">
                              {formatCurrency(totalTTC)}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </div>

            <div className="mt-6 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total HT</span>
                <span className="font-medium tabular-nums">
                  {formatCurrency(quoteData.amount_excluding_tax)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">TVA</span>
                <span className="font-medium tabular-nums">
                  {formatCurrency(quoteData.tax)}
                </span>
              </div>
              <Separator />
              <div className="flex justify-between font-medium">
                <span>Total TTC</span>
                <span className="tabular-nums">
                  {formatCurrency(quoteData.amount_including_tax)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
