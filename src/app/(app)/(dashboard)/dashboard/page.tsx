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
import { getInvoiceStatusLabel } from "@/utils/invoiceStatus";

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
      <h1 className="text-2xl font-bold font-dmSans flex items-center gap-2">
        <TrendingUp className="h-6 w-6 text-primary" />
        Tableau de bord
      </h1>

      {/* Métriques principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="overflow-hidden border shadow-sm hover:shadow-md transition-shadow group">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-muted/50">
            <CardTitle className="text-sm font-medium">Revenu mensuel</CardTitle>
            <div className="p-2 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors">
              <TrendingUp className="h-4 w-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold">
              {formatCurrency(dashboardData?.data?.monthlyRevenue || 0)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Sur les 30 derniers jours
            </p>
          </CardContent>
        </Card>

        <Card className="overflow-hidden border shadow-sm hover:shadow-md transition-shadow group">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-muted/50">
            <CardTitle className="text-sm font-medium">Factures en attente</CardTitle>
            <div className="p-2 rounded-full bg-amber-100 group-hover:bg-amber-200 transition-colors">
              <Clock className="h-4 w-4 text-amber-600" />
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold">
                {dashboardData?.data?.pendingInvoices || 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Factures à traiter
            </p>
          </CardContent>
        </Card>

        <Card className="overflow-hidden border shadow-sm hover:shadow-md transition-shadow group">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-muted/50">
            <CardTitle className="text-sm font-medium">Devis du mois</CardTitle>
            <div className="p-2 rounded-full bg-blue-100 group-hover:bg-blue-200 transition-colors">
              <FileText className="h-4 w-4 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold">
              {dashboardData?.data?.monthlyQuotes || 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Sur les 30 derniers jours
            </p>
          </CardContent>
        </Card>

        <Card className="overflow-hidden border shadow-sm hover:shadow-md transition-shadow group">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-muted/50">
            <CardTitle className="text-sm font-medium">Taux de conversion</CardTitle>
            <div className="p-2 rounded-full bg-green-100 group-hover:bg-green-200 transition-colors">
              <ShoppingCart className="h-4 w-4 text-green-600" />
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold">
              {formatPercent(dashboardData?.data?.quoteToInvoiceRatio || 0)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Devis convertis en factures
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Distribution des statuts et Top clients */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Distribution des statuts de factures */}
        <Card className="overflow-hidden border shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="bg-muted/50">
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Distribution des factures
            </CardTitle>
            <CardDescription>
              Répartition par statut
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
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
                        <span className="capitalize">{getInvoiceStatusLabel(status.status)}</span>
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
        <Card className="overflow-hidden border shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="bg-muted/50">
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-primary" />
              Top clients
            </CardTitle>
            <CardDescription>
              Clients les plus actifs
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
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