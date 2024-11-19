"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Download, Eye, ChevronDown } from "lucide-react";
import { MdOutlineEdit, MdDeleteOutline, MdClose } from "react-icons/md";

import { Invoice } from "@/types/Invoice";
import { Customer } from "@/types/Customer";
import { Item } from "@/types/Item";

import useFormattedAmount from "@/hooks/useFormattedAmount";
import useFormattedDate from "@/hooks/useFormattedDate";
import { useToast } from "@/components/ui/use-toast";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ContentLayout } from "@/components/admin-panel/content-layout";
import AlertDialog from "@/components/alert-dialog";
import DatePicker from "@/components/datePicker";
import SheetCustomers from "@/components/sheet-customers";
import TableItems from "@/components/table-items";
import EditTableItems from "@/components/edit-table-items";
import ErrorScreen from "@/components/error-screen";
import SelectStatusInvoice from "@/components/selectStatusInvoice";

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
      await api.put(`/invoices/${id}`, updates);
      setState((prev) => ({
        ...prev,
        data: prev.data ? { ...prev.data, ...updates } : null,
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
    await handleUpdateInvoice({ Client: customer });
  };

  const handleChangeStatus = async (status: string) => {
    await handleUpdateInvoice({ status });
  };

  const handleSelectDueDate = async (date: Date) => {
    const localDate = new Date(
      date.getTime() - date.getTimezoneOffset() * 60000
    );
    const isoDate = localDate.toISOString().split("T")[0];
    await handleUpdateInvoice({ due_date: new Date(isoDate) });
  };

  const handleSaveItems = async (items: Item[]) => {
    await handleUpdateInvoice({ InvoiceItems: items });
    setIsEditingItems(false);
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
    <ContentLayout title={"Factures"}>
      <div className="flex flex-col flex-1 gap-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <h1 className="text-2xl font-semibold">
            Facture {invoice?.invoice_id}
          </h1>
          <div className="flex gap-4">
            <Button
              variant="outline"
              className="flex items-center gap-2"
              onClick={handleDownload}
            >
              <Download size={16} />
              Télécharger PDF
            </Button>

            <AlertDialog
              trigger={
                <Button
                  variant="destructive"
                  className="flex items-center gap-2"
                >
                  <MdDeleteOutline size={20} />
                  Supprimer
                </Button>
              }
              title={"Supprimer la facture"}
              description={"Êtes-vous sûr de vouloir supprimer cette facture ?"}
              confirmText={"Supprimer"}
              handleOnConfirm={handleDelete}
            />
          </div>
        </div>
        <Card className="flex flex-col justify-between p-6 md:flex-row gap-4">
          <div className="flex flex-col w-full gap-4 md:w-1/2">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold">Numéro de facture</h2>
              <p className="flex text-sm text-right">
                {invoice?.invoice_number}
              </p>
            </div>
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold">Date de facturation</h2>
              <p className="flex text-sm text-right">
                {invoice?.invoice_date
                  ? formatDate(new Date(invoice.invoice_date))
                  : ""}
              </p>
            </div>

            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold">Statut de la facture</h2>
              <div className="flex ">
                <SelectStatusInvoice
                  invoice={invoice}
                  handleChangeStatus={handleChangeStatus}
                />
              </div>
            </div>
          </div>
          <div className="flex flex-col w-full gap-4 md:w-1/2">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold">Date d&apos;échéance</h2>
              <DatePicker
                trigger={
                  <Button
                    variant="ghost"
                    className="p-0 h-fit justify-start text-left font-normal hover:bg-transparent"
                  >
                    {formatDate(new Date(invoice?.due_date as Date)) ||
                      "Sélectionner une date"}
                    <ChevronDown size={16} className="ml-2 opacity-50" />
                  </Button>
                }
                value={invoice?.due_date}
                onChange={handleSelectDueDate}
              />
            </div>
          </div>
        </Card>
        <div className="flex flex-col gap-6 md:flex-row">
          <Card className="flex flex-col w-full gap-2 p-6">
            <h2 className="text-lg font-semibold">Emetteur :</h2>
            <div className="flex flex-col pl-2">
              <h2 className="text-sm font-semibold">
                {invoice?.Company?.name.toUpperCase()}
              </h2>
              <p className="text-sm">{invoice?.Company?.street_address}</p>
              <p className="text-sm">
                {invoice?.Company?.city}, {invoice?.Company?.postal_code}
              </p>
              <p className="text-sm">{invoice?.Company?.country}</p>
            </div>
          </Card>
          <Card className="relative flex flex-col w-full gap-2 p-6">
            <SheetCustomers
              trigger={
                <MdOutlineEdit
                  size={20}
                  className="absolute top-2 right-2 cursor-pointer"
                />
              }
              handleSelectCustomer={handleChangeCustomer}
            />
            <Eye
              size={20}
              className="absolute top-2 right-8 cursor-pointer"
              onClick={() =>
                router.push(`/customers/${invoice?.Client?.client_id}`)
              }
            />

            <h2 className="text-lg font-semibold">Destinataire :</h2>
            <div className="flex flex-col pl-2">
              <h2 className="text-sm font-semibold">
                {invoice?.Client?.first_name.toUpperCase()}{" "}
                {invoice?.Client?.last_name.toUpperCase()}
              </h2>
              <p className="text-sm">{invoice?.Client?.street_address}</p>
              <p className="text-sm">
                {invoice?.Client?.city}, {invoice?.Client?.postal_code}
              </p>
              <p className="text-sm">{invoice?.Client?.country}</p>
            </div>
          </Card>
        </div>
        <Card className="relative">
          <CardHeader>
            <CardTitle>{"Articles"}</CardTitle>
            {isEditingItems ? (
              <MdClose
                size={20}
                className="absolute top-2 right-2 cursor-pointer"
                onClick={() => setIsEditingItems(false)}
              />
            ) : (
              <MdOutlineEdit
                size={20}
                className="absolute top-2 right-2 cursor-pointer"
                onClick={() => setIsEditingItems(true)}
              />
            )}
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

        <div className={"flex flex-col items-end w-full"}>
          <Card className="w-full md:w-1/2 xl:w-1/3">
            <CardHeader>
              <CardTitle>{"Résumé de la facture"}</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              <div className="flex justify-between">
                <span className="text-sm font-light">{"Sous-total"}:</span>
                <p className="flex  text-sm items-end text-right">
                  {formatAmount(totals.totalAmountWithoutVAT, {
                    currency: "EUR",
                  })}
                </p>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-light">{"TVA"}:</span>
                <p className="flex  text-sm items-end text-right">
                  {formatAmount(
                    totals.totalAmount - totals.totalAmountWithoutVAT,
                    {
                      currency: "EUR",
                    }
                  )}
                </p>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-semibold">{"Total"}:</span>
                <p className="flex  text-sm items-end text-right">
                  {formatAmount(totals.totalAmount, {
                    currency: "EUR",
                  })}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </ContentLayout>
  );
}
