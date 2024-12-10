"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, Plus } from "lucide-react";
import { MdClose, MdOutlineEdit } from "react-icons/md";

import { Item } from "@/types/Item";
import { Customer } from "@/types/Customer";

import useFormattedAmount from "@/hooks/useFormattedAmount";
import { useToast } from "@/components/ui/use-toast";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ContentLayout } from "@/components/admin-panel/content-layout";
import DatePicker from "@/components/datePicker";
import SheetCustomers from "@/components/sheet-customers";
import EditTableItems from "@/components/edit-table-items";
import TableItems from "@/components/table-items";

import api from "@/lib/axios";
import { cn } from "@/lib/utils";

interface CreateInvoiceFormData {
  client: Customer | null;
  items: Item[];
  dueDate: Date;
  isEditingItems: boolean;
  isSubmitting: boolean;
}

const initialFormState: CreateInvoiceFormData = {
  client: null,
  items: [],
  dueDate: new Date(),
  isEditingItems: true,
  isSubmitting: false,
};

interface InvoiceTotals {
  totalAmountWithoutVAT: number;
  totalVAT: number;
  totalAmount: number;
}

const calculateInvoiceTotals = (items: Item[] = []): InvoiceTotals => {
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

export default function CreateInvoicePage() {
  const router = useRouter();
  const { toast } = useToast();
  const { formatAmount } = useFormattedAmount();

  const [formData, setFormData] =
    useState<CreateInvoiceFormData>(initialFormState);
  const { client, items, dueDate, isEditingItems, isSubmitting } = formData;

  const { totalAmount, totalAmountWithoutVAT, totalVAT } =
    calculateInvoiceTotals(items);

  const handleCreateInvoice = async () => {
    if (!client || items.length === 0) return;

    try {
      setFormData((prev) => ({ ...prev, isSubmitting: true }));

      const localDate = new Date(
        dueDate.getTime() - dueDate.getTimezoneOffset() * 60000
      );
      const isoDate = localDate.toISOString().split("T")[0];

      const response = await api.post("/invoices", {
        client_id: client.client_id,
        due_date: isoDate,
        items,
      });

      toast({
        title: "Facture créée",
        description: "La facture a été créée avec succès",
      });

      router.push(`/invoices/${response.data.invoice_id}`);
    } catch (error) {
      console.error("Failed to create invoice:", error);
      toast({
        title: "Erreur",
        description: "Impossible de créer la facture",
        variant: "destructive",
      });
    } finally {
      setFormData((prev) => ({ ...prev, isSubmitting: false }));
    }
  };

  return (
    <>
      <ContentLayout title={"Factures"}>
        <div className="flex flex-col w-full gap-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold">{"Créer une facture"}</h1>
          </div>
          <div className="flex flex-col gap-6">
            <div className="flex gap-2">
              <div className="flex flex-col items-start w-96 gap-2">
                <Label>{"Date d'échéance"}</Label>
                <DatePicker
                  trigger={
                    <Button
                      variant="outline"
                      className="w-full flex items-center justify-between"
                    >
                      {formData.dueDate?.toLocaleDateString() ??
                        "Sélectionner une date"}
                      <ChevronDown size={16} className="ml-2 opacity-50" />
                    </Button>
                  }
                  value={formData.dueDate}
                  onChange={(date) => {
                    if (date) {
                      setFormData((prev) => ({ ...prev, dueDate: date }));
                    } else {
                      setFormData((prev) => ({ ...prev, dueDate: new Date() }));
                    }
                  }}
                />
              </div>
            </div>
            <div className="flex flex-col items-start w-full gap-2 sm:w-96">
              <Label>{"Client"}</Label>
              <SheetCustomers
                trigger={
                  <Button className="w-full cursor-pointer" variant="outline">
                    {formData.client
                      ? `${formData.client.first_name} ${formData.client.last_name}`
                      : "Sélectionner un client"}
                  </Button>
                }
                handleSelectCustomer={(customer) => {
                  setFormData((prev) => ({ ...prev, client: customer }));
                }}
              />
            </div>
            <div className="flex flex-col items-start w-full gap-4 mb-4">
              <Card className="relative w-full">
                <CardHeader>
                  <CardTitle>{"Articles"}</CardTitle>
                  {isEditingItems ? (
                    <MdClose
                      size={20}
                      className="absolute top-2 right-2 cursor-pointer"
                      onClick={() =>
                        setFormData((prev) => ({
                          ...prev,
                          isEditingItems: false,
                        }))
                      }
                    />
                  ) : (
                    <MdOutlineEdit
                      size={20}
                      className="absolute top-2 right-2 cursor-pointer"
                      onClick={() =>
                        setFormData((prev) => ({
                          ...prev,
                          isEditingItems: true,
                        }))
                      }
                    />
                  )}
                </CardHeader>
                <CardContent>
                  {isEditingItems ? (
                    <EditTableItems
                      items={items}
                      handleOnSaveItems={(items) => {
                        setFormData((prev) => ({ ...prev, items }));
                        setFormData((prev) => ({
                          ...prev,
                          isEditingItems: false,
                        }));
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
                    <CardTitle>{"Résumé de la facture"}</CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-col gap-2">
                    <div className="flex justify-between w-full">
                      <span className="font-light text-sm ">
                        {"Sous-total"}:
                      </span>
                      <p className="flex  text-sm items-end text-right">
                        {formatAmount(totalAmountWithoutVAT, {
                          currency: "EUR",
                        })}
                      </p>
                    </div>
                    <div className="flex justify-between w-full">
                      <span className="font-light text-sm ">{"TVA"}:</span>
                      <p className="flex  text-sm items-end text-right">
                        {formatAmount(totalVAT, { currency: "EUR" })}
                      </p>
                    </div>
                    <div className="flex justify-between w-full">
                      <span className="font-light text-sm ">{"Total"}:</span>
                      <p className="flex  text-sm items-end text-right">
                        {formatAmount(totalAmount, { currency: "EUR" })}
                      </p>
                    </div>

                    <Button
                      className="w-full mt-4"
                      onClick={handleCreateInvoice}
                      disabled={!formData.client || items.length === 0}
                    >
                      {" "}
                      {isSubmitting ? (
                        "Création en cours..."
                      ) : (
                        <>
                          <Plus size={20} className="mr-2" /> Créer la facture
                        </>
                      )}
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
