"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Item } from "@/types/Item";
import { Customer } from "@/types/Customer";
import useFormattedAmount from "@/hooks/useFormattedAmount";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ContentLayout } from "@/components/admin-panel/content-layout";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import DatePicker from "@/components/datePicker";
import SheetCustomers from "@/components/sheet-customers";
import EditTableItems from "@/components/edit-table-items";
import TableItems from "@/components/table-items";

import { useToast } from "@/components/ui/use-toast";

import {
  Calendar,
  CircleDollarSign,
  FileEdit,
  Loader2,
  PlusCircle,
  Receipt,
  User2,
  XCircle,
  Building2,
  AlertCircle,
} from "lucide-react";

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
    <ContentLayout title="Factures">
      <div className="flex flex-col w-full gap-6">
        {/* En-tête */}
        <div className="flex flex-col sm:flex-row justify-between items-center p-6 bg-background rounded-lg border gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-full bg-primary/10">
              <Receipt className="w-6 h-6 text-primary" />
            </div>
            <div className="space-y-1">
              <h1 className="text-2xl font-bold">Créer une facture</h1>
              <p className="text-sm text-muted-foreground">
                Remplissez les informations pour créer une nouvelle facture
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="space-y-6 xl:col-span-2">
            {/* Client */}
            <Card>
              <CardHeader className="space-y-1">
                <div className="flex items-center gap-2">
                  <User2 className="w-4 h-4 text-muted-foreground" />
                  <CardTitle className="text-lg">Client</CardTitle>
                </div>
                <Separator />
              </CardHeader>
              <CardContent className="space-y-4">
                <SheetCustomers
                  trigger={
                    <Button
                      variant="outline"
                      className="w-full justify-between"
                    >
                      {client ? (
                        <div className="flex items-center gap-2">
                          {client.type === "company" ? (
                            <Building2 className="w-4 h-4" />
                          ) : (
                            <User2 className="w-4 h-4" />
                          )}
                          <span>
                            {client.type === "company"
                              ? client.name
                              : `${client.first_name} ${client.last_name}`}
                          </span>
                          <Badge variant="outline">
                            {client.type === "company"
                              ? "Entreprise"
                              : "Particulier"}
                          </Badge>
                        </div>
                      ) : (
                        <span>Sélectionner un client</span>
                      )}
                      <PlusCircle className="w-4 h-4" />
                    </Button>
                  }
                  handleSelectCustomer={(customer) => {
                    setFormData((prev) => ({ ...prev, client: customer }));
                  }}
                />
              </CardContent>
            </Card>

            {/* Date d'échéance */}
            <Card>
              <CardHeader className="space-y-1">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <CardTitle className="text-lg">
                    Date d&apos;échéance
                  </CardTitle>
                </div>
                <Separator />
              </CardHeader>
              <CardContent>
                <DatePicker
                  trigger={
                    <Button
                      variant="outline"
                      className="w-full justify-between"
                    >
                      {formData.dueDate?.toLocaleDateString() ??
                        "Sélectionner une date"}
                      <Calendar className="w-4 h-4" />
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
              </CardContent>
            </Card>

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
                    onClick={() =>
                      setFormData((prev) => ({
                        ...prev,
                        isEditingItems: !prev.isEditingItems,
                      }))
                    }
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
                    items={items}
                    handleOnSaveItems={(items) => {
                      setFormData((prev) => ({
                        ...prev,
                        items,
                        isEditingItems: false,
                      }));
                    }}
                  />
                ) : (
                  <>
                    {items.length === 0 ? (
                      <div className="flex flex-col items-center justify-center p-8 text-center border rounded-lg border-dashed gap-2">
                        <AlertCircle className="w-8 h-8 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">
                          Aucun article ajouté
                        </p>
                        <Button
                          variant="outline"
                          onClick={() =>
                            setFormData((prev) => ({
                              ...prev,
                              isEditingItems: true,
                            }))
                          }
                        >
                          Ajouter des articles
                        </Button>
                      </div>
                    ) : (
                      <TableItems items={items} />
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Résumé */}
          <div className="xl:col-span-1">
            <div className="sticky top-6">
              <Card>
                <CardHeader className="space-y-1">
                  <div className="flex items-center gap-2">
                    <CircleDollarSign className="w-4 h-4 text-muted-foreground" />
                    <CardTitle className="text-lg">Résumé</CardTitle>
                  </div>
                  <Separator />
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">Sous-total</span>
                      <span>{formatAmount(totalAmountWithoutVAT)}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">TVA</span>
                      <span>{formatAmount(totalVAT)}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between items-center font-medium">
                      <span>Total</span>
                      <span className="text-lg">
                        {formatAmount(totalAmount)}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {!client && (
                      <p className="text-sm text-muted-foreground">
                        Sélectionnez un client pour créer la facture
                      </p>
                    )}
                    {items.length === 0 && (
                      <p className="text-sm text-muted-foreground">
                        Ajoutez au moins un article
                      </p>
                    )}
                    <Button
                      className="w-full gap-2"
                      onClick={handleCreateInvoice}
                      disabled={!client || items.length === 0 || isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Création en cours...
                        </>
                      ) : (
                        <>
                          <PlusCircle className="w-4 h-4" />
                          Créer la facture
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </ContentLayout>
  );
}
