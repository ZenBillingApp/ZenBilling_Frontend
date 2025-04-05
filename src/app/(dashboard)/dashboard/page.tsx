"use client";

import { useDashboardMetrics } from "@/hooks/useDashboard";
import { useFormat } from "@/hooks/useFormat";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  FileText,
  ShoppingCart,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Clock,
  Ban,
  Mail,
  Building2,
  User,
} from "lucide-react";
import type { InvoiceStatusCount, TopCustomer } from "@/types/Dashboard.interface";

export default function DashboardPage() {
  const router = useRouter();
  const { data: dashboardData, isLoading } = useDashboardMetrics();
  const { formatCurrency, formatPercent } = useFormat();


  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-6 space-y-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-muted rounded"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="h-96 bg-muted rounded"></div>
            <div className="h-96 bg-muted rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "paid":
        return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case "pending":
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case "late":
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case "cancelled":
        return <Ban className="w-4 h-4 text-gray-500" />;
      case "sent":
        return <Mail className="w-4 h-4 text-blue-500" />;
      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      <h1 className="text-2xl font-bold font-dmSans">Tableau de bord</h1>

      {/* Métriques principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenu mensuel</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(dashboardData?.data?.monthlyRevenue || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Sur les 30 derniers jours
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Factures en attente</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
                {dashboardData?.data?.pendingInvoices || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Factures à traiter
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Devis du mois</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dashboardData?.data?.monthlyQuotes || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Sur les 30 derniers jours
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taux de conversion</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatPercent(dashboardData?.data?.quoteToInvoiceRatio || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Devis convertis en factures
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Distribution des statuts et Top clients */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Distribution des statuts de factures */}
        <Card>
          <CardHeader>
            <CardTitle>Distribution des factures</CardTitle>
            <CardDescription>
              Répartition par statut
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-right">Nombre</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dashboardData?.data?.invoiceStatusDistribution.map((status: InvoiceStatusCount) => (
                  <TableRow key={status.status}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(status.status)}
                        <span className="capitalize">{status.status}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">{status._count}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Top clients */}
        <Card>
          <CardHeader>
            <CardTitle>Top clients</CardTitle>
            <CardDescription>
              Clients les plus actifs
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Client</TableHead>
                  <TableHead className="text-right">Factures</TableHead>
                  <TableHead className="text-right">Montant total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dashboardData?.data?.topCustomers.map((customer: TopCustomer) => (
                  <TableRow 
                    key={customer.customer_id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => router.push(`/customers/${customer.customer_id}`)}
                  >
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {customer.type === "company" ? (
                          <Building2 className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <User className="h-4 w-4 text-muted-foreground" />
                        )}
                        <span>{customer.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">{customer._count.invoices}</TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(
                        customer.invoices.reduce(
                          (sum: number, invoice: { amount_including_tax: number }) => 
                            sum + invoice.amount_including_tax,
                          0
                        )
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 