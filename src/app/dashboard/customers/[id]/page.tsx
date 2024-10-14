"use client";
import React from "react";
import { useParams, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

import { Customer } from "@/types/Customer";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import TableInvoices from "@/components/tableInvoices";
import { ContentLayout } from "@/components/admin-panel/content-layout";
import AlertDialog from "@/components/alert-dialog";
import EditCustomerDialog from "@/components/edit-customer-dialog";
import { useToast } from "@/components/ui/use-toast";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import { MdOutlineEdit, MdDeleteOutline } from "react-icons/md";
import { AlertTriangle } from "lucide-react";
import { ClipLoader } from "react-spinners";

import { cn } from "@/lib/utils";
import api from "@/lib/axios";

type Props = {};

export default function Page({}: Props) {
  const { id } = useParams();
  const router = useRouter();
  const { toast } = useToast();

  const t = useTranslations();

  const [customer, setCustomer] = React.useState<Customer | null>(null);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [monthlyInvoice, setMonthlyInvoice] = React.useState<
    Array<{ month: string; amount: number }>
  >([]);

  const handleOnDelete = async () => {
    try {
      setLoading(true);
      await api.delete(`/customers/${id}`);
      toast({
        title: "Client supprimé",
        description: "Le client a été supprimé avec succès",
      });
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Une erreur s'est produite",
        description: "Impossible de supprimer le client",
      });
    } finally {
      router.push("/dashboard/customers");
    }
  };

  React.useEffect(() => {
    const fetchMonthlyInvoice = async () => {
      try {
        const response = await api.get(`/customers/${id}/monthly-revenue`);
        setMonthlyInvoice(response.data);
      } catch (error) {
        console.error(error);
        toast({
          variant: "destructive",
          title: "Une erreur s'est produite",
          description: "Impossible de charger les revenus mensuels",
        });
      } finally {
        setLoading(false);
      }
    };
    fetchMonthlyInvoice();
  }, [id]);

  React.useEffect(() => {
    const fetchCustomer = async () => {
      try {
        const response = await api.get(`/customers/${id}`);
        setCustomer(response.data);
      } catch (error) {
        console.error(error);
        toast({
          variant: "destructive",
          title: "Une erreur s'est produite",
          description: "Impossible de charger les informations du client",
        });
      }
    };
    fetchCustomer();
  }, [id]);

  const handleOnEdit = async (newCustomer: Customer) => {
    setCustomer({ ...customer, ...newCustomer });
  };

  return (
    <ContentLayout title={t("customers.customer_details")}>
      <div className="flex flex-col w-full gap-6">
        {loading ? (
          <div className="flex w-full h-screen items-center justify-center">
            <ClipLoader color="#009933" loading={loading} size={50} />
          </div>
        ) : (
          <>
            <div className="flex flex-col w-full items-center justify-between sm:flex-row sm:items-center sm:justify-between gap-6">
              <h1 className="text-3xl font-semibold">
                {customer ? `${customer.first_name} ${customer.last_name}` : ""}
              </h1>
              <div className="flex items-center gap-2">
                <EditCustomerDialog
                  trigger={
                    <Button
                      variant="default"
                      className={cn(
                        "flex items-center gap-2",
                        "hover:bg-green-500 hover:text-white"
                      )}
                    >
                      <MdOutlineEdit size={20} />
                      {t("common.common_edit")}
                    </Button>
                  }
                  customer={customer}
                  onSave={handleOnEdit}
                />

                <AlertDialog
                  trigger={
                    <Button
                      variant="destructive"
                      className={cn(
                        "flex items-center gap-2",
                        "hover:bg-red-500 hover:text-white"
                      )}
                    >
                      <MdDeleteOutline size={20} />
                      {t("common.common_delete")}
                    </Button>
                  }
                  handleOnConfirm={handleOnDelete}
                  title={t("customers.customer_delete")}
                  description={t("customers.customer_delete_confirm")}
                  confirmText={t("common.common_delete")}
                />
              </div>
            </div>
            <div className="flex flex-col w-full  sm:flex-row gap-6">
              <div className="flex w-full sm:w-1/2 flex-col gap-6">
                <Card className="flex flex-col justify-center  ">
                  <CardHeader>
                    <CardTitle>
                      {t("customers.customer_contact_info")}
                    </CardTitle>
                    <CardDescription>
                      {t("customers.customer_contact_info_description")}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-2">
                      <span className="font-semibold">
                        {t("common.common_email")} :{" "}
                      </span>{" "}
                      {customer?.email}
                    </div>
                    <div className="flex gap-2">
                      <span className="font-semibold">
                        {t("common.common_phone")} :{" "}
                      </span>{" "}
                      {customer?.phone}
                    </div>
                  </CardContent>
                </Card>
                <Card className="flex flex-col ">
                  <CardHeader>
                    <CardTitle>{t("customers.customer_address")}</CardTitle>
                    <CardDescription>
                      {t("customers.customer_address_description")}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-2 break-word">
                      <span className="font-semibold">
                        {t("common.common_street")} :{" "}
                      </span>{" "}
                      {customer?.street_address || "-"}
                    </div>
                    <div className="flex gap-2">
                      <span className="font-semibold">
                        {t("common.common_city")} :{" "}
                      </span>{" "}
                      {customer?.city}
                    </div>
                    <div className="flex gap-2">
                      <span className="font-semibold">
                        {t("common.common_state")} :{" "}
                      </span>{" "}
                      {customer?.state}
                    </div>
                    <div className="flex gap-2">
                      <span className="font-semibold">
                        {t("common.common_zip")} :{" "}
                      </span>{" "}
                      {customer?.postal_code}
                    </div>
                    <div className="flex gap-2">
                      <span className="font-semibold">
                        {t("common.common_country")} :{" "}
                      </span>{" "}
                      {customer?.country}
                    </div>
                  </CardContent>
                </Card>
              </div>
              <div className="flex w-full sm:w-1/2">
                <Card className="w-full">
                  <CardHeader>
                    <CardTitle>
                      {t("customers.customer_monthly_revenue")}
                    </CardTitle>
                    <CardDescription>
                      {t("customers.customer_monthly_revenue_description")}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {monthlyInvoice.length === 0 ? (
                      <Alert>
                        <AlertTriangle className="w-5 h-5" />
                        <AlertTitle>
                          {t("invoices.invoice_table_no_invoices")}
                        </AlertTitle>
                        <AlertDescription>
                          {t("invoices.invoice_table_no_invoices_description")}
                        </AlertDescription>
                      </Alert>
                    ) : (
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={monthlyInvoice}>
                          <XAxis dataKey="month" />
                          <YAxis name="Amount" />
                          <Tooltip />
                          <Bar dataKey="amount" fill="#009933" />
                        </BarChart>
                      </ResponsiveContainer>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
            <Card>
              <CardHeader>
                <CardTitle>{t("invoices.invoices")}</CardTitle>
                <CardDescription>
                  {t("customers.customer_invoices_description")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <TableInvoices invoices={customer?.Invoices} search={""} />
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </ContentLayout>
  );
}
