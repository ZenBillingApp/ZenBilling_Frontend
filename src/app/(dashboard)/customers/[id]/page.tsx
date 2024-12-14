"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Customer } from "@/types/Customer";
import useFormattedAmount from "@/hooks/useFormattedAmount";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ClipLoader } from "react-spinners";
import TableInvoices from "@/components/tableInvoices";
import { ContentLayout } from "@/components/admin-panel/content-layout";
import AlertDialog from "@/components/alert-dialog";
import EditCustomerDialog from "@/components/edit-customer-dialog";
import ErrorScreen from "@/components/error-screen";
import api from "@/lib/axios";

import {
  BuildingIcon,
  User2Icon,
  Edit2Icon,
  Trash2Icon,
  AlertTriangleIcon,
  MailIcon,
  PhoneIcon,
  MapPinIcon,
  Building2Icon,
  ReceiptIcon,
  BanknoteIcon,
  CalendarIcon,
} from "lucide-react";

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

  const getCustomerName = (customer: Customer) => {
    return customer.type === "company"
      ? customer.name
      : `${customer.first_name} ${customer.last_name}`;
  };

  if (isLoading) {
    return (
      <ContentLayout title="Client">
        <div className="flex w-full h-[50vh] items-center justify-center">
          <ClipLoader color="hsl(var(--primary))" size={40} />
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

  const isCompany = customer.type === "company";
  const customerName = getCustomerName(customer);

  return (
    <ContentLayout title="Client">
      <div className="flex flex-col w-full gap-8">
        {/* En-tête */}
        <div className="flex flex-col sm:flex-row justify-between gap-6 bg-background border rounded-lg p-6">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-full bg-primary/10">
                {isCompany ? (
                  <Building2Icon className="w-8 h-8 text-primary" />
                ) : (
                  <User2Icon className="w-8 h-8 text-primary" />
                )}
              </div>
              <div className="space-y-1">
                <h1 className="text-2xl font-bold">{customerName}</h1>
                <div className="flex items-center gap-2">
                  <Badge variant={isCompany ? "secondary" : "outline"}>
                    {isCompany ? "Entreprise" : "Particulier"}
                  </Badge>
                  {(customer.invoice_count ?? 0) > 0 && (
                    <Badge variant="default">
                      {customer.invoice_count} facture
                      {(customer.invoice_count ?? 0) > 1 ? "s" : ""}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <EditCustomerDialog
              trigger={
                <Button variant="outline" size="sm" className="gap-2">
                  <Edit2Icon className="w-4 h-4" />
                  Modifier
                </Button>
              }
              customer={customer}
              onSave={fetchData}
            />
            <AlertDialog
              trigger={
                <Button variant="destructive" size="sm" className="gap-2">
                  <Trash2Icon className="w-4 h-4" />
                  Supprimer
                </Button>
              }
              handleOnConfirm={handleDelete}
              title="Supprimer le client"
              description={`Voulez-vous vraiment supprimer ${
                isCompany ? "l'entreprise" : "le client"
              } ${customerName} ?`}
              confirmText="Supprimer"
            />
          </div>
        </div>

        {/* Informations */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {isCompany && (
            <Card>
              <CardHeader className="space-y-1">
                <div className="flex items-center gap-2">
                  <BuildingIcon className="w-4 h-4 text-muted-foreground" />
                  <CardTitle className="text-lg">
                    Informations entreprise
                  </CardTitle>
                </div>
                <Separator />
              </CardHeader>
              <CardContent className="grid gap-4">
                <div className="space-y-3">
                  <div className="flex flex-col">
                    <span className="text-sm text-muted-foreground">SIRET</span>
                    <span className="font-mono">
                      {customer.siret_number || "-"}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm text-muted-foreground">SIREN</span>
                    <span className="font-mono">
                      {customer.siren_number || "-"}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm text-muted-foreground">
                      N° TVA
                    </span>
                    <span className="font-mono">
                      {customer.vat_number || "-"}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader className="space-y-1">
              <div className="flex items-center gap-2">
                <PhoneIcon className="w-4 h-4 text-muted-foreground" />
                <CardTitle className="text-lg">Contact</CardTitle>
              </div>
              <Separator />
            </CardHeader>
            <CardContent className="grid gap-4">
              {!isCompany && (
                <div className="space-y-3">
                  <div className="flex flex-col">
                    <span className="text-sm text-muted-foreground">
                      Prénom
                    </span>
                    <span>{customer.first_name}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm text-muted-foreground">Nom</span>
                    <span>{customer.last_name}</span>
                  </div>
                  <Separator />
                </div>
              )}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <MailIcon className="w-4 h-4 text-muted-foreground" />
                  <span>{customer.email || "Aucun email"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <PhoneIcon className="w-4 h-4 text-muted-foreground" />
                  <span>{customer.phone || "Aucun téléphone"}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="space-y-1">
              <div className="flex items-center gap-2">
                <MapPinIcon className="w-4 h-4 text-muted-foreground" />
                <CardTitle className="text-lg">Adresse</CardTitle>
              </div>
              <Separator />
            </CardHeader>
            <CardContent className="space-y-4">
              {customer.street_address ? (
                <div className="flex flex-col gap-1">
                  <span>{customer.street_address}</span>
                  <span>
                    {customer.postal_code} {customer.city}
                  </span>
                  <span>{customer.country}</span>
                </div>
              ) : (
                <span className="text-muted-foreground">Aucune adresse</span>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Statistiques */}
        <div className="space-y-6">
          <Card>
            <CardHeader className="space-y-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BanknoteIcon className="w-4 h-4 text-muted-foreground" />
                  <CardTitle className="text-lg">Revenus mensuels</CardTitle>
                </div>
                <Badge variant="outline" className="gap-2">
                  <CalendarIcon className="w-4 h-4" />
                  12 derniers mois
                </Badge>
              </div>
              <Separator />
            </CardHeader>
            <CardContent className="pt-6">
              {monthlyRevenue.length === 0 ? (
                <Alert variant="default" className="bg-muted/50">
                  <AlertTriangleIcon className="w-4 h-4" />
                  <AlertTitle>Aucune donnée</AlertTitle>
                  <AlertDescription>
                    Aucune facture n&apos;a été émise pour ce client
                  </AlertDescription>
                </Alert>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    data={monthlyRevenue}
                    margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis
                      dataKey="month_name"
                      tick={{ fontSize: 12 }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      tick={{ fontSize: 12 }}
                      tickFormatter={(value) => formatAmount(value)}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar
                      dataKey="amount"
                      fill="hsl(var(--primary))"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="space-y-1">
              <div className="flex items-center gap-2">
                <ReceiptIcon className="w-4 h-4 text-muted-foreground" />
                <CardTitle className="text-lg">Factures</CardTitle>
              </div>
              <Separator />
            </CardHeader>
            <CardContent className="pt-6">
              <TableInvoices
                invoices={customer?.Invoices?.map((invoice) => ({
                  ...invoice,
                  Client: customer,
                }))}
                search=""
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </ContentLayout>
  );
}
