"use client";
import React from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

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
import DashboardShorcut from "@/components/dashboard-shorcut";
import TableInvoices from "@/components/tableInvoices";

import { PiUsersThree } from "react-icons/pi";
import { ClipLoader } from "react-spinners";

import { FilePlus, FileClock } from "lucide-react";

import { cn } from "@/lib/utils";
import api from "@/lib/axios";
import ErrorScreen from "@/components/error-screen";

type Props = {};

export default function Page({}: Props) {
  const router = useRouter();

  const [data, setData] = React.useState<Dashboard>({} as Dashboard);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get("/dashboard");
      setData(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || "Une erreur s'est produite");
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchData();
  }, []);

  return (
    <>
      <ContentLayout title={"Tableau de bord"}>
        {loading ? (
          <div className={cn("flex justify-center items-center w-full h-full")}>
            <ClipLoader color={cn("text-primary")} />
          </div>
        ) : error ? (
          <div
            className={cn(
              "flex flex-col w-full justify-center items-center gap-4"
            )}
          >
            <ErrorScreen handleRetry={fetchData} />
          </div>
        ) : (
          <>
            <div className={cn("flex flex-col w-full h-full gap-6")}>
              <div className="flex flex-col w-full gap-6">
                <div className="flex w-full justify-between">
                  <h1 className="text-s font-light">
                    <span className={cn("text-xl", "text-primary")}>
                      Bonjour !
                    </span>{" "}
                    Vous avez {data?.numberOfUnpaidInvoices || 0} factures en
                    attente de paiement.
                  </h1>
                </div>
                <h1 className="text-2xl font-semibold">Tableau de bord</h1>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <DashboardShorcut
                  icon={<FileClock size={32} />}
                  title={"Factures en attente de paiement"}
                  value={data?.numberOfUnpaidInvoices || 0}
                />
                <DashboardShorcut
                  icon={<PiUsersThree size={32} />}
                  title={"Nombre de clients"}
                  value={data?.numberOfClients || 0}
                />
                <DashboardShorcut
                  icon={<FilePlus size={32} />}
                  title={"Nombre de factures ce mois-ci"}
                  value={data?.numberOfInvoicesThisMonth || 0}
                />
              </div>
              <div className="flex w-full gap-6">
                <Card className="flex flex-col w-full p-4">
                  <CardHeader>
                    <CardTitle>{"Dernières factures"}</CardTitle>
                  </CardHeader>
                  <CardContent className="flex w-full h-full">
                    <TableInvoices
                      invoices={data?.latestInvoices || []}
                      search=""
                    />
                  </CardContent>
                  <CardFooter>
                    <Button
                      onClick={() => {
                        router.push("/invoices");
                      }}
                      className="w-full"
                    >
                      Voir toutes les factures
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            </div>
          </>
        )}
      </ContentLayout>
    </>
  );
}
