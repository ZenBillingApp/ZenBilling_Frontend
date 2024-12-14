"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Invoice } from "@/types/Invoice";
import { Customer } from "@/types/Customer";
import { Item } from "@/types/Item";
import useFormattedAmount from "@/hooks/useFormattedAmount";
import useFormattedDate from "@/hooks/useFormattedDate";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ContentLayout } from "@/components/admin-panel/content-layout";
import AlertDialog from "@/components/alert-dialog";
import DatePicker from "@/components/datePicker";
import SheetCustomers from "@/components/sheet-customers";
import TableItems from "@/components/table-items";
import EditTableItems from "@/components/edit-table-items";
import ErrorScreen from "@/components/error-screen";
import SelectStatusInvoice from "@/components/selectStatusInvoice";
import { useToast } from "@/components/ui/use-toast";

import {
  Download,
  Eye,
  ChevronDown,
  Printer,
  Building2,
  MapPin,
  Mail,
  Phone,
  Receipt,
  Calendar,
  CircleDollarSign,
  FileEdit,
  XCircle,
  Trash2,
  ClockIcon,
  Building,
} from "lucide-react";

import { ClipLoader } from "react-spinners";

import api from "@/lib/axios";
import { cn } from "@/lib/utils";

interface InvoiceState {
  data: Invoice | null;
  isLoading: boolean;
  error: string | null;
}

interface InvoiceTotals {
  totalAmountWithoutVAT: number;
  totalVAT: number;
  totalAmount: number;
}

const calculateTotals = (items: Item[] = []): InvoiceTotals => {
  return items.reduce(
    (acc, item) => {
      const itemTotal = item.unit_price * item.quantity;
      const itemVAT = (item.vat_rate / 100) * itemTotal;

      return {
        totalAmountWithoutVAT: acc.totalAmountWithoutVAT + itemTotal,
        totalVAT: acc.totalVAT + itemVAT,
        totalAmount: acc.totalAmount + itemTotal + itemVAT,
      };
    },
    { totalAmountWithoutVAT: 0, totalVAT: 0, totalAmount: 0 }
  );
};

export default function InvoicePage() {
  const { id } = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const { formatAmount } = useFormattedAmount();
  const { formatDate } = useFormattedDate();

  const [{ data: invoice, isLoading, error }, setState] =
    useState<InvoiceState>({
      data: null,
      isLoading: true,
      error: null,
    });
  const [isEditingItems, setIsEditingItems] = useState(false);

  const fetchInvoiceDetails = useCallback(async () => {
    try {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));
      const response = await api.get(`/invoices/${id}`);
      setState((prev) => ({ ...prev, data: response.data, isLoading: false }));
    } catch (error) {
      console.error("Failed to fetch invoice:", error);
      setState((prev) => ({
        ...prev,
        error: "Impossible de charger la facture",
        isLoading: false,
      }));
    }
  }, [id]);

  useEffect(() => {
    fetchInvoiceDetails();
  }, [fetchInvoiceDetails]);
  const handleUpdateInvoice = async (updates: Partial<Invoice>) => {
    try {
      // Si la mise à jour contient des items, envoyer les items seuls
      if ("InvoiceItems" in updates) {
        await api.put(`/invoices/${id}`, {
          items: updates.InvoiceItems,
        });
      } else {
        await api.put(`/invoices/${id}`, updates);
      }

      // Rafraîchir les données complètes
      const response = await api.get(`/invoices/${id}`);
      setState((prev) => ({
        ...prev,
        data: response.data,
      }));

      toast({
        title: "Mise à jour réussie",
        description: "La facture a été mise à jour avec succès",
      });
    } catch (error) {
      console.error("Failed to update invoice:", error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour la facture",
        variant: "destructive",
      });
    }
  };

  const handleChangeCustomer = async (customer: Customer) => {
    await handleUpdateInvoice({
      client_id: customer.client_id,
      Client: customer, // Pour la mise à jour locale
    });
  };

  const handleChangeStatus = async (status: string) => {
    if (!status) return;
    await handleUpdateInvoice({ status });
  };

  const handleSelectDueDate = async (date: Date | null) => {
    if (!date) return;

    // Conversion en date locale avec le bon format
    const localDate = new Date(
      date.getTime() - date.getTimezoneOffset() * 60000
    );
    const formattedDate = localDate.toISOString().split("T")[0];

    await handleUpdateInvoice({
      due_date: new Date(formattedDate),
    });
  };

  const handleSaveItems = async (items: Item[]) => {
    if (!items.length) {
      toast({
        title: "Erreur",
        description: "La facture doit contenir au moins un article",
        variant: "destructive",
      });
      return;
    }

    try {
      await handleUpdateInvoice({ InvoiceItems: items });
      setIsEditingItems(false);
    } catch (error) {
      setIsEditingItems(true); // Garder l'édition ouverte en cas d'erreur
    }
  };

  const handleDownload = async () => {
    try {
      const response = await api.get(`/invoices/${id}/pdf`, {
        responseType: "blob",
      });

      const url = URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.download = `Facture_${invoice?.invoice_id}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to download PDF:", error);
      toast({
        title: "Erreur",
        description: "Impossible de télécharger le PDF",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/invoices/${id}`);
      router.push("/invoices");
      toast({
        title: "Suppression réussie",
        description: "La facture a été supprimée avec succès",
      });
    } catch (error) {
      console.error("Failed to delete invoice:", error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer la facture",
        variant: "destructive",
      });
    }
  };

  const totals = calculateTotals(invoice?.InvoiceItems);

  if (isLoading) {
    return (
      <ContentLayout title="Factures">
        <div className="flex justify-center items-center w-full h-full">
          <ClipLoader color={cn("text-primary")} />
        </div>
      </ContentLayout>
    );
  }

  if (error) {
    return (
      <ContentLayout title="Factures">
        <ErrorScreen handleRetry={fetchInvoiceDetails} />
      </ContentLayout>
    );
  }

  if (!invoice) return null;

  return (
    <ContentLayout title="Factures">
      <div className="flex flex-col w-full gap-6">
        {/* En-tête */}
        <div className="flex flex-col sm:flex-row justify-between items-center p-6 bg-background rounded-lg border gap-4">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-full bg-primary/10">
                <Receipt className="w-6 h-6 text-primary" />
              </div>
              <div className="space-y-1">
                <h1 className="text-2xl font-bold">
                  Facture #{invoice?.invoice_number}
                </h1>
                <div className="flex items-center gap-2">
                  <SelectStatusInvoice
                    invoice={invoice}
                    handleChangeStatus={handleChangeStatus}
                  />
                  <Badge variant="outline" className="gap-2">
                    <Calendar className="w-4 h-4" />
                    {formatDate(new Date(invoice?.invoice_date))}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="gap-2"
              onClick={handleDownload}
            >
              <Download className="w-4 h-4" />
              Télécharger
            </Button>
            <AlertDialog
              trigger={
                <Button variant="destructive" className="gap-2">
                  <Trash2 className="w-4 h-4" />
                  Supprimer
                </Button>
              }
              title="Supprimer la facture"
              description="Êtes-vous sûr de vouloir supprimer cette facture ?"
              confirmText="Supprimer"
              handleOnConfirm={handleDelete}
            />
          </div>
        </div>

        {/* Informations principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {/* Dates et Status */}
          <Card>
            <CardHeader className="space-y-1">
              <div className="flex items-center gap-2">
                <ClockIcon className="w-4 h-4 text-muted-foreground" />
                <CardTitle className="text-lg">Dates</CardTitle>
              </div>
              <Separator />
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="space-y-2">
                <span className="text-sm text-muted-foreground">
                  Date d&apos;émission
                </span>
                <div className="font-medium">
                  {formatDate(new Date(invoice?.invoice_date))}
                </div>
              </div>
              <div className="space-y-2">
                <span className="text-sm text-muted-foreground">
                  Date d&apos;échéance
                </span>
                <DatePicker
                  trigger={
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      {formatDate(new Date(invoice?.due_date)) ||
                        "Sélectionner une date"}
                      <ChevronDown className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  }
                  value={invoice?.due_date}
                  onChange={handleSelectDueDate}
                />
              </div>
            </CardContent>
          </Card>

          {/* Émetteur */}
          <Card>
            <CardHeader className="space-y-1">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-muted-foreground" />
                <CardTitle className="text-lg">Émetteur</CardTitle>
              </div>
              <Separator />
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1">
                <div className="font-medium">{invoice?.Company?.name}</div>
                <div className="text-sm text-muted-foreground space-y-1">
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 mt-0.5" />
                    <div>
                      <div>{invoice?.Company?.street_address}</div>
                      <div>
                        {invoice?.Company?.postal_code} {invoice?.Company?.city}
                      </div>
                      <div>{invoice?.Company?.country}</div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Client */}
          <Card>
            <CardHeader className="space-y-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Building className="w-4 h-4 text-muted-foreground" />
                  <CardTitle className="text-lg">Client</CardTitle>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() =>
                      router.push(`/customers/${invoice?.Client?.client_id}`)
                    }
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                  <SheetCustomers
                    trigger={
                      <Button variant="ghost" size="icon">
                        <FileEdit className="w-4 h-4" />
                      </Button>
                    }
                    handleSelectCustomer={handleChangeCustomer}
                  />
                </div>
              </div>
              <Separator />
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1">
                <div className="font-medium">
                  {invoice?.Client?.type === "company"
                    ? invoice?.Client?.name
                    : `${invoice?.Client?.first_name} ${invoice?.Client?.last_name}`}
                  <Badge variant="outline" className="ml-2">
                    {invoice?.Client?.type === "company"
                      ? "Entreprise"
                      : "Particulier"}
                  </Badge>
                </div>
                {invoice?.Client?.type === "company" && (
                  <div className="text-sm space-y-1 text-muted-foreground">
                    {invoice?.Client?.siret_number && (
                      <div>SIRET: {invoice?.Client?.siret_number}</div>
                    )}
                    {invoice?.Client?.vat_number && (
                      <div>TVA: {invoice?.Client?.vat_number}</div>
                    )}
                  </div>
                )}
                <div className="text-sm text-muted-foreground space-y-1 mt-2">
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 mt-0.5" />
                    <div>
                      <div>{invoice?.Client?.street_address}</div>
                      <div>
                        {invoice?.Client?.postal_code} {invoice?.Client?.city}
                      </div>
                      <div>{invoice?.Client?.country}</div>
                    </div>
                  </div>
                  {invoice?.Client?.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      {invoice?.Client?.email}
                    </div>
                  )}
                  {invoice?.Client?.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      {invoice?.Client?.phone}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Articles */}
        <Card>
          <CardHeader className="space-y-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Receipt className="w-4 h-4 text-muted-foreground" />
                <CardTitle className="text-lg">Articles</CardTitle>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsEditingItems(!isEditingItems)}
              >
                {isEditingItems ? (
                  <XCircle className="w-4 h-4" />
                ) : (
                  <FileEdit className="w-4 h-4" />
                )}
              </Button>
            </div>
            <Separator />
          </CardHeader>
          <CardContent>
            {isEditingItems ? (
              <EditTableItems
                items={invoice?.InvoiceItems || []}
                handleOnSaveItems={handleSaveItems}
              />
            ) : (
              <TableItems items={invoice?.InvoiceItems || []} />
            )}
          </CardContent>
        </Card>

        {/* Résumé */}
        <div className="flex justify-end">
          <Card className="w-full md:w-1/2 xl:w-1/3">
            <CardHeader className="space-y-1">
              <div className="flex items-center gap-2">
                <CircleDollarSign className="w-4 h-4 text-muted-foreground" />
                <CardTitle className="text-lg">Résumé</CardTitle>
              </div>
              <Separator />
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Sous-total</span>
                <span>{formatAmount(totals.totalAmountWithoutVAT)}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">TVA</span>
                <span>{formatAmount(totals.totalVAT)}</span>
              </div>
              <Separator />
              <div className="flex justify-between items-center font-medium">
                <span>Total</span>
                <span className="text-lg">
                  {formatAmount(totals.totalAmount)}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </ContentLayout>
  );
}
