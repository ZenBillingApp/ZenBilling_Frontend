"use client";
import React from "react";
import { useParams, useRouter } from "next/navigation";

import { Customer } from "@/types/Customer";

import useFormattedAmount from "@/hooks/useFormattedAmount";

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
import ErrorScreen from "@/components/error-screen";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

import { MdOutlineEdit, MdDeleteOutline } from "react-icons/md";
import { AlertTriangle } from "lucide-react";
import { ClipLoader } from "react-spinners";

import { cn } from "@/lib/utils";
import api from "@/lib/axios";
import { format } from "path";

type Props = {};

const CustomTooltip = ({ active, payload, label }: any) => {
  const { formatAmount } = useFormattedAmount();
  if (active) {
    return (
      <Card className="flex flex-col gap-2 p-4">
        <h3>{label}</h3>
        <p>{`Revenu : ${formatAmount(payload[0].value)}`}</p>
      </Card>
    );
  }
  return null;
};

export default function Page({}: Props) {
  const { id } = useParams();
  const router = useRouter();
  const { toast } = useToast();

  const { formatAmount } = useFormattedAmount();

  const [customer, setCustomer] = React.useState<Customer | null>(null);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [error, setError] = React.useState<string | null>(null);
  const [monthlyInvoice, setMonthlyInvoice] = React.useState<
    Array<{ month: string; amount: number }>
  >([]);

  const handleOnDelete = async () => {
    try {
      setLoading(true);
      await api.delete(`/customers/${id}`);
      router.push("/customers");
      toast({
        title: "Client supprimé",
        description: "Le client a été supprimé avec succès",
      });
    } catch (err: any) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    const fetchMonthlyInvoice = async () => {
      try {
        const response = await api.get(`/customers/${id}/monthly-revenue`);
        setMonthlyInvoice(response.data);
      } catch (err: any) {
        console.log(err);
      }
    };
    fetchMonthlyInvoice();
  }, [id]);

  const fetchCustomer = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get(`/customers/${id}`);
      setCustomer(response.data);
    } catch (err: any) {
      console.log(err);
      setError(err.response.data.message);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchCustomer();
  }, [id]);

  const handleOnEdit = async () => {
    fetchCustomer();
  };

  return (
    <>
      <ContentLayout title={"Client"}>
        <div className="flex flex-col w-full h-full gap-6">
          {loading ? (
            <div className="flex w-full h-full items-center justify-center">
              <ClipLoader color={cn("text-primary")} />
            </div>
          ) : error ? (
            <div className="flex flex-col w-full h-full justify-center items-center gap-4">
              <ErrorScreen handleRetry={fetchCustomer} />
            </div>
          ) : (
            <>
              <div className="flex flex-col w-full items-center justify-between sm:flex-row sm:items-center sm:justify-between gap-6">
                <h1 className="text-3xl font-semibold">
                  {customer
                    ? `${customer.first_name} ${customer.last_name}`
                    : ""}
                </h1>
                <div className="flex items-center gap-2">
                  <EditCustomerDialog
                    trigger={
                      <Button
                        variant="default"
                        className={cn("flex items-center gap-2")}
                      >
                        <MdOutlineEdit size={20} />
                        Modifier
                      </Button>
                    }
                    customer={customer}
                    onSave={handleOnEdit}
                  />

                  <AlertDialog
                    trigger={
                      <Button
                        variant="destructive"
                        className={cn("flex items-center gap-2")}
                      >
                        <MdDeleteOutline size={20} />
                        Supprimer
                      </Button>
                    }
                    handleOnConfirm={handleOnDelete}
                    title={"Supprimer le client"}
                    description={`Voulez-vous vraiment supprimer le client ${customer?.first_name} ${customer?.last_name} ?`}
                    confirmText={"Supprimer"}
                  />
                </div>
              </div>
              <div className="flex flex-col w-full  gap-6">
                <div className="flex flex-col xl:flex-row w-full gap-6">
                  <Card className="flex flex-col justify-center w-full xl:w-1/2">
                    <CardHeader>
                      <CardTitle>{"Contact du client"}</CardTitle>
                      <CardDescription>
                        {"Informations de contact du client"}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex gap-2">
                        <span className="font-semibold">Email :</span>{" "}
                        {customer?.email}
                      </div>
                      <div className="flex gap-2">
                        <span className="font-semibold">Téléphone :</span>{" "}
                        {customer?.phone}
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="flex flex-col justify-center w-full xl:w-1/2">
                    <CardHeader>
                      <CardTitle>Adresse du client</CardTitle>
                      <CardDescription>
                        {"Informations sur l'adresse du client"}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex gap-2 break-word">
                        <span className="font-semibold">Adresse :</span>{" "}
                        {customer?.street_address || "-"}
                      </div>
                      <div className="flex gap-2">
                        <span className="font-semibold">Ville :</span>{" "}
                        {customer?.city}
                      </div>
                      <div className="flex gap-2">
                        <span className="font-semibold">Code postal :</span>{" "}
                        {customer?.postal_code}
                      </div>
                      <div className="flex gap-2">
                        <span className="font-semibold">Pays :</span>{" "}
                        {customer?.country}
                      </div>
                    </CardContent>
                  </Card>
                </div>
                <div className="flex w-full gap-6">
                  <Card className="w-full">
                    <CardHeader>
                      <CardTitle>Revenus mensuels du client</CardTitle>
                      <CardDescription>
                        Revenus mensuels générés par le client
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {monthlyInvoice.length === 0 ? (
                        <Alert>
                          <AlertTriangle className="w-5 h-5" />
                          <AlertTitle>Aucune facture trouvée</AlertTitle>
                          <AlertDescription>
                            Aucune facture trouvée pour ce client
                          </AlertDescription>
                        </Alert>
                      ) : (
                        <ResponsiveContainer width="100%" height={300}>
                          <BarChart data={monthlyInvoice}>
                            <CartesianGrid horizontal={true} vertical={false} />
                            <XAxis
                              dataKey="month"
                              tick={{ fontSize: 12 }}
                              tickLine={false}
                            />
                            <YAxis
                              tickLine={false}
                              tick={{ fontSize: 12 }}
                              tickFormatter={(value) => formatAmount(value)}
                            />
                            <Tooltip content={CustomTooltip} />
                            <Bar
                              dataKey="amount"
                              fill={"hsl(var(--primary))"}
                            />
                          </BarChart>
                        </ResponsiveContainer>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
              <Card>
                <CardHeader>
                  <CardTitle>{"Factures du client"}</CardTitle>
                  <CardDescription>
                    {"Liste des factures du client"}
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
    </>
  );
}
