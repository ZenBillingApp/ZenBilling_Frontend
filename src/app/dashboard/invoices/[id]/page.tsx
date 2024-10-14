"use client";
import React, { useEffect, useState } from "react";
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

  const handleChangeCustomer = async (customer: Customer) => {
    try {
      await api.put(`/invoices/${id}`, {
        client_id: customer.client_id,
      });
      setInvoice((prev) => (prev ? { ...prev, Client: customer } : prev));
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Échec de la mise à jour du client",
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

  useEffect(() => {
    const fetchInvoiceDetails = async () => {
      try {
        const response = await api.get(`/invoices/${id}`);
        setInvoice(response.data);
      } catch (error) {
        console.error(error);
        toast({
          variant: "destructive",
          title: "Erreur",
          description: "Échec du chargement des détails de la facture",
        });
      }
      setLoading(false);
    };
    fetchInvoiceDetails();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full w-full">
        <ClipLoader color="#009933" />
      </div>
    );
  }

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
      link.setAttribute("download", `invoice_${id}.pdf`);
      document.body.appendChild(link);
      link.click();
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Échec du téléchargement de la facture",
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
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Échec de la mise à jour du statut de la facture",
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
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Échec de la mise à jour de la date d'échéance",
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
        title: "Erreur",
        description: "Échec de la mise à jour des articles de la facture",
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
      router.push("/dashboard/invoices");
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Échec de la suppression de la facture",
        action: (
          <ToastAction altText="Retry" onClick={HandleOnDelete}>
            Réessayer
          </ToastAction>
        ),
      });
    }
  };

  return (
    <ContentLayout title={t("invoices.invoice_details")}>
      <div className="flex flex-col flex-1 gap-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <h1 className="text-2xl font-semibold">
            {" "}
            {t("invoices.invoice") + " / " + id}
          </h1>
          <div className="flex gap-4">
            <Button
              variant="outline"
              className="flex items-center gap-2"
              onClick={handleDownload}
            >
              <Download size={16} />
              {t("common.common_download_pdf")}
            </Button>

            <AlertDialog
              trigger={
                <Button
                  variant="destructive"
                  className="flex items-center gap-2"
                >
                  <MdDeleteOutline size={20} />
                  {t("common.common_delete")}
                </Button>
              }
              title={t("invoices.invoice_delete")}
              description={t("invoices.invoice_delete_confirm")}
              confirmText={t("common.common_delete")}
              handleOnConfirm={HandleOnDelete}
            />
          </div>
        </div>
        <Card className="flex flex-col justify-between p-6 md:flex-row gap-4">
          <div className="flex flex-col w-full gap-4 md:w-1/2">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold">
                {t("invoices.invoice_id")}
              </h2>
              <p className="flex text-sm text-right">{invoice?.invoice_id}</p>
            </div>
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold">
                {t("invoices.invoice_date")}
              </h2>
              <p className="flex text-sm text-right">
                {invoice?.invoice_date
                  ? formatDate(new Date(invoice.invoice_date))
                  : ""}
              </p>
            </div>

            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold">
                {t("invoices.invoice_status")}
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
                {t("invoices.invoice_due_date")}
              </h2>
              <DatePicker
                trigger={
                  <Button
                    variant="ghost"
                    className="p-0 h-fit justify-start text-left font-normal hover:bg-transparent"
                  >
                    {formatDate(new Date(invoice?.due_date as Date)) ||
                      "Select Due Date"}
                    <ChevronDownIcon size={16} className="ml-2 opacity-50" />
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
            <h2 className="text-lg font-semibold">
              {t("invoices.invoice_myCompany")}
            </h2>
            <div className="flex flex-col pl-2">
              <h2 className="text-sm font-semibold">
                {invoice?.Company?.name}
              </h2>
              <p className="text-sm">{invoice?.Company?.street_address}</p>
              <p className="text-sm">
                {invoice?.Company?.city}, {invoice?.Company?.state}{" "}
                {invoice?.Company?.postal_code}
              </p>
              <p className="text-sm">{invoice?.Company?.country}</p>
              <p className="text-sm">
                <span className="font-semibold">
                  {t("common.common_email")} :
                </span>{" "}
                {invoice?.Company?.email}
              </p>
              <p className="text-sm">
                <span className="font-semibold">
                  {t("common.common_phone")} :
                </span>{" "}
                {invoice?.Company?.phone}
              </p>
              <p className="text-sm">
                <span className="font-semibold">
                  {t("common.common_vat_number")} :
                </span>{" "}
                {invoice?.Company?.vat_number}
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
            <h2 className="text-lg font-semibold">
              {t("invoices.invoice_billTo")} :
            </h2>
            <div className="flex flex-col pl-2">
              <h2 className="text-sm font-semibold">
                {invoice?.Clients?.first_name} {invoice?.Clients?.last_name}
              </h2>
              <p className="text-sm">{invoice?.Clients?.street_address}</p>
              <p className="text-sm">
                {invoice?.Clients?.city}, {invoice?.Clients?.state}{" "}
                {invoice?.Clients?.postal_code}
              </p>
              <p className="text-sm">{invoice?.Clients?.country}</p>
              <p className="text-sm">
                <span className="font-semibold">
                  {t("common.common_email")} :
                </span>{" "}
                {invoice?.Clients?.email}
              </p>
              <p className="text-sm">
                <span className="font-semibold">
                  {t("common.common_phone")} :
                </span>{" "}
                {invoice?.Clients?.phone}
              </p>
            </div>
          </Card>
        </div>
        <Card className="relative">
          <CardHeader>
            <CardTitle>{t("items.items")}</CardTitle>
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
              <CardTitle>{t("invoices.invoice_summary")}</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              <div className="flex justify-between">
                <h2 className="text-sm font-semibold">
                  {t("invoices.invoice_subtotal")} :
                </h2>
                <p className="flex  text-sm items-end text-right">
                  {formatAmount(totalAmountWithoutVAT, {
                    currency: "EUR",
                  })}
                </p>
              </div>
              <div className="flex justify-between">
                <h2 className="text-sm font-semibold">
                  {t("invoices.invoice_vat")} :
                </h2>
                <p className="flex  text-sm items-end text-right">
                  {formatAmount(totalAmount - totalAmountWithoutVAT, {
                    currency: "EUR",
                  })}
                </p>
              </div>
              <div className="flex justify-between">
                <h2 className="text-sm font-semibold">
                  {t("invoices.invoice_total")} :
                </h2>
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
    </ContentLayout>
  );
}
