"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import { Dashboard } from "@/types/Dashboard";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ContentLayout } from "@/components/admin-panel/content-layout";
import DashboardShortcut from "@/components/dashboard-shorcut";
import TableInvoices from "@/components/tableInvoices";
import ErrorScreen from "@/components/error-screen";

import { FilePlus, FileClock, Users } from "lucide-react";
import { ClipLoader } from "react-spinners";

import api from "@/lib/axios";
import { cn } from "@/lib/utils";

interface DashboardState {
  data: Dashboard | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: DashboardState = {
  data: null,
  isLoading: true,
  error: null,
};

const DashboardMetrics = [
  {
    id: "unpaid-invoices",
    icon: <FileClock className="w-8 h-8" />,
    title: "Factures en attente de paiement",
    getValue: (data: Dashboard) => data.numberOfUnpaidInvoices ?? 0,
  },
  {
    id: "total-clients",
    icon: <Users className="w-8 h-8" />,
    title: "Nombre de clients",
    getValue: (data: Dashboard) => data.numberOfClients ?? 0,
  },
  {
    id: "monthly-invoices",
    icon: <FilePlus className="w-8 h-8" />,
    title: "Nombre de factures ce mois-ci",
    getValue: (data: Dashboard) => data.numberOfInvoicesThisMonth ?? 0,
  },
];

export default function DashboardPage() {
  const router = useRouter();
  const [{ data, isLoading, error }, setState] =
    useState<DashboardState>(initialState);

  const fetchData = useCallback(async () => {
    try {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));
      const response = await api.get("/dashboard");
      setState((prev) => ({ ...prev, data: response.data, isLoading: false }));
    } catch (err) {
      console.error("Failed to fetch dashboard data:", err);
      setState((prev) => ({
        ...prev,
        error: "Impossible de charger les données du tableau de bord",
        isLoading: false,
      }));
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (isLoading) {
    return (
      <ContentLayout title="Tableau de bord">
        <div className="flex justify-center items-center w-full h-full">
          <ClipLoader color={cn("text-primary")} />
        </div>
      </ContentLayout>
    );
  }

  if (error) {
    return (
      <ContentLayout title="Tableau de bord">
        <div className="flex flex-col w-full justify-center items-center gap-4">
          <ErrorScreen handleRetry={fetchData} />
        </div>
      </ContentLayout>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <ContentLayout title="Tableau de bord">
      <div className="flex flex-col  gap-6">
        <header className="flex flex-col w-full gap-6">
          <div className="flex w-full justify-between">
            <h1 className="text-s font-light">
              <span className="text-xl text-primary">Bonjour !</span> Vous avez{" "}
              {data.numberOfUnpaidInvoices ?? 0} factures en attente de
              paiement.
            </h1>
          </div>
          <h1 className="text-2xl font-semibold">Tableau de bord</h1>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {DashboardMetrics.map((metric) => (
            <DashboardShortcut
              key={metric.id}
              icon={metric.icon}
              title={metric.title}
              value={metric.getValue(data)}
            />
          ))}
        </section>

        <section className="flex w-full gap-6">
          <Card className="flex flex-col w-full p-4">
            <CardHeader>
              <CardTitle>Dernières factures</CardTitle>
            </CardHeader>
            <CardContent className="flex w-full h-full">
              <TableInvoices invoices={data.latestInvoices ?? []} search="" />
            </CardContent>
            <CardFooter>
              <Button
                onClick={() => router.push("/invoices")}
                className="w-full"
              >
                Voir toutes les factures
              </Button>
            </CardFooter>
          </Card>
        </section>
      </div>
    </ContentLayout>
  );
}
