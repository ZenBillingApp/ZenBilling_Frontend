"use client";
import React, { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

import useFormattedAmount from "@/hooks/useFormattedAmount";
import useFormattedDate from "@/hooks/useFormattedDate";

import { Invoice } from "@/types/Invoice";
import { Customer } from "@/types/Customer";
import { Item } from "@/types/Item";

import SelectStatusInvoice from "@/components/selectStatusInvoice";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { ToastAction } from "@/components/ui/toast";
import { ContentLayout } from "@/components/admin-panel/content-layout";
import AlertDialog from "@/components/alert-dialog";
import DatePicker from "@/components/datePicker";
import SheetCustomers from "@/components/sheet-customers";
import TableItems from "@/components/table-items";
import EditTableItems from "@/components/edit-table-items";

import { ClipLoader } from "react-spinners";
import { ChevronDownIcon } from "lucide-react";
import { Download } from "lucide-react";
import { MdOutlineEdit, MdDeleteOutline, MdClose } from "react-icons/md";

import api from "@/lib/axios";
import { cn } from "@/lib/utils";
import { set } from "date-fns";
import ErrorScreen from "@/components/error-screen";

type Props = {};

export default function Page({}: Props) {
  const { id } = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const t = useTranslations();

  const { formatAmount } = useFormattedAmount();
  const { formatDate } = useFormattedDate();

  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [editOpen, setEditOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChangeCustomer = async (customer: Customer) => {
    try {
      await api.put(`/invoices/${id}`, {
        client_id: customer.client_id,
      });
      setInvoice((prev) => (prev ? { ...prev, Client: customer } : prev));
      toast({
        title: "Client mis à jour",
        description: "Le client a été mis à jour avec succès",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Une erreur s'est produite",
        description: t(`server.${(error as any).response?.data.message}`),
        action: (
          <ToastAction
            altText="Retry"
            onClick={() => handleChangeCustomer(customer)}
          >
            Réessayer
          </ToastAction>
        ),
      });
    }
  };

  const fetchInvoiceDetails = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get(`/invoices/${id}`);
      setInvoice(response.data);
    } catch (err: any) {
      setError(err.response?.data.message || "Une erreur s'est produite");
      toast({
        variant: "destructive",
        title: "Une Erreur s'est produite",
        description: t(`server.${err.response?.data.message}`),
      });
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchInvoiceDetails();
  }, [fetchInvoiceDetails]);

  let totalAmountWithoutVAT = 0;
  let totalAmount = 0;

  if (invoice?.InvoiceItems) {
    for (let item of invoice.InvoiceItems) {
      const itemTotal = item.unit_price * item.quantity;
      const itemVAT = (item.vat_rate / 100) * itemTotal;
      totalAmountWithoutVAT += itemTotal;
      totalAmount += itemTotal + itemVAT;
    }
  }

  const handleDownload = async () => {
    try {
      const response = await api.get(`/invoices/${id}/pdf`, {
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `Facture_${invoice?.invoice_id}.pdf`);
      document.body.appendChild(link);
      link.click();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Une erreur s'est produite",
        description: t(`server.${(error as any).response?.data.message}`),
        action: (
          <ToastAction altText="Retry" onClick={handleDownload}>
            Réessayer
          </ToastAction>
        ),
      });
    }
  };

  const handleChangeStatus = async (status: string) => {
    try {
      await api.put(`/invoices/${id}`, {
        status,
      });
      setInvoice((prev) => (prev ? { ...prev, status } : prev));
      toast({
        title: "Statut de la facture mis à jour",
        description: "Le statut de la facture a été mis à jour avec succès",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Une erreur s'est produite",
        description: t(`server.${(error as any).response?.data.message}`),
        action: (
          <ToastAction
            altText="Retry"
            onClick={() => handleChangeStatus(status)}
          >
            Réessayer
          </ToastAction>
        ),
      });
    }
  };

  const handleSelectDueDate = async (date: Date) => {
    // Ajuster manuellement le décalage de fuseau horaire
    const localDate = new Date(
      date.getTime() - date.getTimezoneOffset() * 60000
    );
    const isoDate = localDate.toISOString().split("T")[0]; // Garde seulement la partie date sans l'heure

    try {
      await api.put(`/invoices/${id}`, {
        due_date: isoDate,
      });
      setInvoice((prev) =>
        prev ? { ...prev, due_date: new Date(isoDate) } : prev
      );
      toast({
        title: "Date d'échéance mise à jour",
        description: "La date d'échéance a été mise à jour avec succès",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Une erreur s'est produite",
        description: t(`server.${(error as any).response?.data.message}`),
        action: (
          <ToastAction
            altText="Retry"
            onClick={() => handleSelectDueDate(date)}
          >
            Réessayer
          </ToastAction>
        ),
      });
    }
  };

  const handleSaveItems = async (items: Item[]) => {
    try {
      await api.put(`/invoices/${id}`, {
        items,
      });
      setInvoice((prev) => (prev ? { ...prev, InvoiceItems: items } : prev));
      setEditOpen(false);
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Une erreur s'est produite",
        description: t(`server.${(error as any).response?.data.message}`),
        action: (
          <ToastAction altText="Retry" onClick={() => handleSaveItems(items)}>
            Réessayer
          </ToastAction>
        ),
      });
    }
  };

  const HandleOnDelete = async () => {
    try {
      await api.delete(`/invoices/${id}`);
      router.push("/invoices");
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Une erreur s'est produite",
        description: t(`server.${(error as any).response?.data.message}`),
        action: (
          <ToastAction altText="Retry" onClick={HandleOnDelete}>
            Réessayer
          </ToastAction>
        ),
      });
    }
  };

  return (
    <>
      <ContentLayout title={"Factures"}>
        {loading ? (
          <div className="flex justify-center items-center w-full h-full">
            <ClipLoader color={cn("text-primary")} />
          </div>
        ) : error ? (
          <div className="flex flex-col w-full h-full justify-center items-center gap-4">
            <ErrorScreen handleRetry={() => fetchInvoiceDetails()} />
          </div>
        ) : (
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
                  description={
                    "Êtes-vous sûr de vouloir supprimer cette facture ?"
                  }
                  confirmText={"Supprimer"}
                  handleOnConfirm={HandleOnDelete}
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
                  <h2 className="text-sm font-semibold">
                    Statut de la facture
                  </h2>
                  <div className="flex">
                    <SelectStatusInvoice
                      invoice={invoice}
                      handleChangeStatus={handleChangeStatus}
                    />
                  </div>
                </div>
              </div>
              <div className="flex flex-col w-full gap-4 md:w-1/2">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-semibold">
                    Date d&apos;échéance
                  </h2>
                  <DatePicker
                    trigger={
                      <Button
                        variant="ghost"
                        className="p-0 h-fit justify-start text-left font-normal hover:bg-transparent"
                      >
                        {formatDate(new Date(invoice?.due_date as Date)) ||
                          "Sélectionner une date"}
                        <ChevronDownIcon
                          size={16}
                          className="ml-2 opacity-50"
                        />
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
                  <p className="text-sm">
                    <span className="font-semibold">Email :</span>{" "}
                    {invoice?.Company?.email}
                  </p>
                  <p className="text-sm">
                    <span className="font-semibold">Téléphone :</span>{" "}
                    {invoice?.Company?.phone}
                  </p>
                  <p className="text-sm">
                    <span className="font-semibold">N° TVA :</span>{" "}
                    {invoice?.Company?.vat_number}
                  </p>
                  <p className="text-sm">
                    <span className="font-semibold">N° SIRET :</span>{" "}
                    {invoice?.Company?.siret_number}
                  </p>
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
                  <p className="text-sm">
                    <span className="font-semibold">Email :</span>{" "}
                    {invoice?.Client?.email}
                  </p>
                  <p className="text-sm">
                    <span className="font-semibold">Téléphone :</span>{" "}
                    {invoice?.Client?.phone}
                  </p>
                </div>
              </Card>
            </div>
            <Card className="relative">
              <CardHeader>
                <CardTitle>{"Articles"}</CardTitle>
                {editOpen ? (
                  <MdClose
                    size={20}
                    className="absolute top-2 right-2 cursor-pointer"
                    onClick={() => setEditOpen((prev) => !prev)}
                  />
                ) : (
                  <MdOutlineEdit
                    size={20}
                    className="absolute top-2 right-2 cursor-pointer"
                    onClick={() => setEditOpen((prev) => !prev)}
                  />
                )}
              </CardHeader>
              <CardContent>
                {editOpen ? (
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
                      {formatAmount(totalAmountWithoutVAT, {
                        currency: "EUR",
                      })}
                    </p>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-light">{"TVA"}:</span>
                    <p className="flex  text-sm items-end text-right">
                      {formatAmount(totalAmount - totalAmountWithoutVAT, {
                        currency: "EUR",
                      })}
                    </p>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-semibold">{"Total"}:</span>
                    <p className="flex  text-sm items-end text-right">
                      {formatAmount(totalAmount, {
                        currency: "EUR",
                      })}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </ContentLayout>
    </>
  );
}
