"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { AlertTriangle, Edit, Trash } from "lucide-react";
import { Customer } from "@/types/Customer";
import useFormattedAmount from "@/hooks/useFormattedAmount";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { ClipLoader } from "react-spinners";
import TableInvoices from "@/components/tableInvoices";
import { ContentLayout } from "@/components/admin-panel/content-layout";
import AlertDialog from "@/components/alert-dialog";
import EditCustomerDialog from "@/components/edit-customer-dialog";
import ErrorScreen from "@/components/error-screen";
import api from "@/lib/axios";
import { cn } from "@/lib/utils";

interface CustomerDetailsState {
  customer: Customer | null;
  monthlyRevenue: MonthlyRevenue[];
  isLoading: boolean;
  error: string | null;
}

interface MonthlyRevenue {
  month: string;
  amount: number;
}

import { TooltipProps as RechartsTooltipProps } from "recharts";

interface TooltipProps extends RechartsTooltipProps<number, string> {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: string;
}

const initialState: CustomerDetailsState = {
  customer: null,
  monthlyRevenue: [],
  isLoading: true,
  error: null,
};

const CustomTooltip = ({ active, payload, label }: TooltipProps) => {
  const { formatAmount } = useFormattedAmount();

  if (!active || !payload?.length) return null;

  return (
    <Card className="flex flex-col gap-2 p-4">
      <h3>{label}</h3>
      <p>Revenu : {formatAmount(payload[0].value)}</p>
    </Card>
  );
};

export default function CustomerDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const { formatAmount } = useFormattedAmount();

  const [state, setState] = useState<CustomerDetailsState>(initialState);
  const { customer, monthlyRevenue, isLoading, error } = state;

  const fetchCustomerRevenue = useCallback(async (customerId: string) => {
    try {
      const response = await api.get(
        `/customers/${customerId}/monthly-revenue`
      );
      return response.data;
    } catch (error) {
      console.error("Failed to fetch customer revenue:", error);
      throw error;
    }
  }, []);

  const fetchCustomer = useCallback(async (customerId: string) => {
    try {
      const response = await api.get(`/customers/${customerId}`);
      return response.data;
    } catch (error) {
      console.error("Failed to fetch customer:", error);
      throw error;
    }
  }, []);

  const deleteCustomer = useCallback(async (customerId: string) => {
    try {
      await api.delete(`/customers/${customerId}`);
    } catch (error) {
      console.error("Failed to delete customer:", error);
      throw error;
    }
  }, []);

  const fetchData = useCallback(async () => {
    if (!id) return;

    try {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));
      const [customerData, revenueData] = await Promise.all([
        fetchCustomer(id as string),
        fetchCustomerRevenue(id as string),
      ]);
      setState((prev) => ({
        ...prev,
        customer: customerData,
        monthlyRevenue: revenueData,
        isLoading: false,
      }));
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error: "Impossible de charger les données du client",
        isLoading: false,
      }));
    }
  }, [id, fetchCustomer, fetchCustomerRevenue]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleDelete = async () => {
    if (!id) return;

    try {
      await deleteCustomer(id as string);
      router.push("/customers");
      toast({
        title: "Client supprimé",
        description: "Le client a été supprimé avec succès",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le client",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <ContentLayout title="Client">
        <div className="flex w-full h-full items-center justify-center">
          <ClipLoader color={cn("text-primary")} />
        </div>
      </ContentLayout>
    );
  }

  if (error) {
    return (
      <ContentLayout title="Client">
        <ErrorScreen handleRetry={fetchData} />
      </ContentLayout>
    );
  }

  if (!customer) return null;

  const fullName = `${customer.first_name} ${customer.last_name}`;

  return (
    <ContentLayout title="Client">
      <div className="flex flex-col w-full items-center py-4 justify-between sm:flex-row sm:items-center sm:justify-between gap-6">
        <h1 className="text-3xl font-semibold">{fullName}</h1>
        <div className="flex items-center gap-4">
          <EditCustomerDialog
            trigger={
              <Button
                variant="default"
                className={cn("flex items-center gap-2")}
              >
                <Edit size={20} />
                Modifier
              </Button>
            }
            customer={customer}
            onSave={fetchData}
          />
          <AlertDialog
            trigger={
              <Button
                variant="destructive"
                className={cn("flex items-center gap-2")}
              >
                <Trash size={20} />
                Supprimer
              </Button>
            }
            handleOnConfirm={handleDelete}
            title="Supprimer le client"
            description={`Voulez-vous vraiment supprimer le client ${fullName} ?`}
            confirmText="Supprimer"
          />
        </div>
      </div>

      <div className="flex flex-col w-full gap-6">
        <div className="flex flex-col xl:flex-row w-full gap-6">
          <Card className="flex flex-col justify-center w-full xl:w-1/2">
            <CardHeader>
              <CardTitle>Contact du client</CardTitle>
              <CardDescription>
                Informations de contact du client
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <span className="font-semibold">Email :</span> {customer.email}
              </div>
              <div className="flex gap-2">
                <span className="font-semibold">Téléphone :</span>{" "}
                {customer.phone}
              </div>
            </CardContent>
          </Card>

          <Card className="flex flex-col justify-center w-full xl:w-1/2">
            <CardHeader>
              <CardTitle>Adresse du client</CardTitle>
              <CardDescription>
                Informations sur l&apos;adresse du client
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2 break-words">
                <span className="font-semibold">Adresse :</span>
                {customer.street_address || "-"}
              </div>
              <div className="flex gap-2">
                <span className="font-semibold">Ville :</span> {customer.city}
              </div>
              <div className="flex gap-2">
                <span className="font-semibold">Code postal :</span>{" "}
                {customer.postal_code}
              </div>
              <div className="flex gap-2">
                <span className="font-semibold">Pays :</span> {customer.country}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="w-full">
          <CardHeader>
            <CardTitle>Revenus mensuels du client</CardTitle>
            <CardDescription>
              Revenus mensuels générés par le client
            </CardDescription>
          </CardHeader>
          <CardContent>
            {monthlyRevenue.length === 0 ? (
              <Alert>
                <AlertTriangle className="w-5 h-5" />
                <AlertTitle>Aucune facture trouvée</AlertTitle>
                <AlertDescription>
                  Aucune facture trouvée pour ce client
                </AlertDescription>
              </Alert>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={monthlyRevenue}>
                  <CartesianGrid horizontal vertical={false} />
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
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="amount" fill="hsl(var(--primary))" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Factures du client</CardTitle>
            <CardDescription>Liste des factures du client</CardDescription>
          </CardHeader>
          <CardContent>
            <TableInvoices invoices={customer.Invoices} search="" />
          </CardContent>
        </Card>
      </div>
    </ContentLayout>
  );
}
