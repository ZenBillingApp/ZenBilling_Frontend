"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

import useFormattedAmount from "@/hooks/useFormattedAmount";

import { Item } from "@/types/Item";
import { Customer } from "@/types/Customer";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ContentLayout } from "@/components/admin-panel/content-layout";
import DatePicker from "@/components/datePicker";
import SheetCustomers from "@/components/sheet-customers";
import EditTableItems from "@/components/edit-table-items";
import TableItems from "@/components/table-items";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";

import { ChevronDownIcon, Plus } from "lucide-react";
import { MdClose, MdOutlineEdit } from "react-icons/md";

import { cn } from "@/lib/utils";
import api from "@/lib/axios";

type Props = {};

export default function Page({}: Props) {
  const router = useRouter();
  const { toast } = useToast();
  const t = useTranslations();
  const { formatAmount } = useFormattedAmount();

  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null
  );
  const [editItems, setEditItems] = useState<boolean>(false);
  const [items, setItems] = useState<Item[]>([]);
  const [date, setDate] = useState<Date>(new Date());
  const [error, setError] = useState<
    | string
    | [
        {
          msg: string;
        }
      ]
    | null
  >(null);

  const handleCreateInvoice = async () => {
    const localDate = new Date(
      date.getTime() - date.getTimezoneOffset() * 60000
    );
    const isoDate = localDate.toISOString().split("T")[0]; // Garde seulement la partie date sans l'heure

    try {
      setError(null);
      const response = await api.post("/invoices", {
        client_id: selectedCustomer?.client_id,
        due_date: isoDate,
        items,
      });
      toast({
        title: "Facture créée",
        description: "La facture a été créée avec succès",
      });
      router.push(`/dashboard/invoices/${response.data.invoice_id}`);
    } catch (err: any) {
      setError(
        err.response?.data.message ||
          err.response?.data.errors ||
          "Une erreur s'est produite"
      );
      toast({
        variant: "destructive",
        title: "Erreur lors de la création de la facture",
        description:
          err.response?.data.message ||
          err.response?.data.errors.map((e: { msg: string }) => e.msg) ||
          "Une erreur s'est produite lors de la création de la facture",
      });
    }
  };

  const calculateSubtotal = () => {
    return items
      .reduce((total, item) => total + item.quantity * item.unit_price, 0)
      .toFixed(2);
  };

  const calculateTax = () => {
    return items
      .reduce(
        (total, item) =>
          total + (item.quantity * item.unit_price * item.vat_rate) / 100,
        0
      )
      .toFixed(2);
  };

  const calculateTotal = () => {
    return (
      parseFloat(calculateSubtotal()) + parseFloat(calculateTax())
    ).toFixed(2);
  };

  return (
    <>
      <ContentLayout title={t("invoices.create_invoice")}>
        <div className="flex flex-col w-full h-full gap-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold">
              {t("invoices.create_invoice")}
            </h1>
          </div>
          <div className="flex flex-col gap-6">
            <div className="flex gap-2">
              <div className="flex flex-col items-start w-96 gap-2">
                <Label>{t("invoices.invoice_due_date")}</Label>
                <DatePicker
                  trigger={
                    <Button
                      variant="outline"
                      className="w-full flex items-center justify-between"
                    >
                      {date.toLocaleDateString() ?? "Select a date"}
                      <ChevronDownIcon size={16} className="ml-2 opacity-50" />
                    </Button>
                  }
                  value={date}
                  onChange={(date) => setDate(date)}
                />
              </div>
            </div>
            <div className="flex flex-col items-start w-full gap-2 sm:w-96">
              <Label>{t("invoices.invoice_billTo")} </Label>
              <SheetCustomers
                trigger={
                  <Input
                    type="text"
                    className="w-full cursor-pointer"
                    placeholder={t(
                      "invoices.invoice_placeholder_select_customer"
                    )}
                    value={
                      selectedCustomer
                        ? `${selectedCustomer.first_name} ${selectedCustomer.last_name}`
                        : ""
                    }
                  />
                }
                handleSelectCustomer={(customer) => {
                  setSelectedCustomer(customer);
                }}
              />
            </div>
            <div className="flex flex-col items-start w-full gap-4 mb-4">
              <Card className="relative w-full">
                <CardHeader>
                  <CardTitle>{t("items.items")}</CardTitle>
                  {editItems ? (
                    <MdClose
                      size={20}
                      className="absolute top-2 right-2 cursor-pointer"
                      onClick={() => setEditItems((prev) => !prev)}
                    />
                  ) : (
                    <MdOutlineEdit
                      size={20}
                      className="absolute top-2 right-2 cursor-pointer"
                      onClick={() => setEditItems((prev) => !prev)}
                    />
                  )}
                </CardHeader>
                <CardContent>
                  {editItems ? (
                    <EditTableItems
                      items={items}
                      handleOnSaveItems={(items) => {
                        setItems(items);
                        setEditItems(false);
                      }}
                    />
                  ) : (
                    <TableItems items={items} />
                  )}
                </CardContent>
              </Card>
              <div className={cn("flex flex-col items-end w-full")}>
                <Card className="w-full md:w-1/2 xl:w-1/3">
                  <CardHeader>
                    <CardTitle>{t("invoices.invoice_summary")}</CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-col gap-2">
                    <div className="flex justify-between w-full">
                      <span className="font-light text-sm ">
                        {t("invoices.invoice_subtotal")}:
                      </span>
                      <p className="flex  text-sm items-end text-right">
                        {formatAmount(parseFloat(calculateSubtotal()), {
                          currency: "EUR",
                        })}
                      </p>
                    </div>
                    <div className="flex justify-between w-full">
                      <span className="font-light text-sm ">
                        {t("invoices.invoice_vat")}:
                      </span>
                      <p className="flex  text-sm items-end text-right">
                        {formatAmount(parseFloat(calculateTax()), {
                          currency: "EUR",
                        })}
                      </p>
                    </div>
                    <div className="flex justify-between w-full">
                      <span className="font-light text-sm ">
                        {t("invoices.invoice_total")}:
                      </span>
                      <p className="flex  text-sm items-end text-right">
                        {formatAmount(parseFloat(calculateTotal()), {
                          currency: "EUR",
                        })}
                      </p>
                    </div>

                    <Button
                      className="w-full mt-4"
                      onClick={handleCreateInvoice}
                      disabled={!selectedCustomer || items.length === 0}
                    >
                      <Plus size={20} className="mr-2" />
                      {t("invoices.invoice_create")}
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </ContentLayout>
    </>
  );
}
