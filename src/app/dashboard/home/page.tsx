"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
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

import { LiaFileInvoiceDollarSolid } from "react-icons/lia";
import { PiUsersThree } from "react-icons/pi";
import { ClipLoader } from "react-spinners";

import { cn } from "@/lib/utils";
import api from "@/lib/axios";

type Props = {
  params: {
    locale: string;
  };
};

export default function Page({ params: { locale } }: Props) {
  const router = useRouter();
  const t = useTranslations();

  const [data, setData] = React.useState<Dashboard>({} as Dashboard);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<
    | string
    | [
        {
          msg: string;
        }
      ]
    | null
  >(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
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

  if (loading) {
    return (
      <ContentLayout title={t("dashboard.dashboard")}>
        <div className="flex w-full h-full justify-center items-center">
          <ClipLoader color="#009933" size={50} />
        </div>
      </ContentLayout>
    );
  }

  if (error) {
    return (
      <ContentLayout title={t("dashboard.dashboard")}>
        <div className="flex flex-col w-full h-full justify-center items-center gap-6">
          <Image
            src={"/assets/illustrations/illu_error.svg"}
            width={200}
            height={200}
            alt="Error"
          />
          <h1 className="text-2xl font-semibold">
            Une erreur s&apos;est produite lors du chargement des données
          </h1>
          <Button onClick={fetchData}>Réessayer</Button>
        </div>
      </ContentLayout>
    );
  }

  return (
    <ContentLayout title={t("dashboard.dashboard")}>
      <div className={cn("flex flex-col w-full h-full gap-6")}>
        <div className="flex flex-col w-full gap-6">
          <div className="flex w-full justify-between ">
            <h1 className="text-s font-light">
              <span className={cn("text-xl", "text-primary")}>
                {t("dashboard.welcome")}
              </span>{" "}
              {t("dashboard.dashboard_invoice_late_message", {
                count: data?.numberOfLatePaymentInvoices || 0,
              })}
            </h1>
          </div>
          <h1 className="text-2xl font-semibold">{t("dashboard.dashboard")}</h1>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <DashboardShorcut
            icon={<LiaFileInvoiceDollarSolid size={32} />}
            title={t("dashboard.dashboard_pending_invoice")}
            value={data?.numberOfUnpaidInvoices || 0}
          />
          <DashboardShorcut
            icon={<PiUsersThree size={32} />}
            title={t("dashboard.dashboard_section_customers")}
            value={data?.numberOfClients || 0}
          />
          <DashboardShorcut
            icon={<PiUsersThree size={32} />}
            title={t("dashboard.dashboard_section_invoice_month")}
            value={data?.numberOfInvoicesThisMonth || 0}
          />
        </div>
        <div className="flex w-full  gap-6 ">
          <Card className="flex flex-col  w-full   p-4 ">
            <CardHeader>
              <CardTitle>{t("invoices.latest_invoices")}</CardTitle>
            </CardHeader>
            <CardContent className="flex  w-full h-full ">
              <TableInvoices invoices={data?.latestInvoices || []} search="" />
            </CardContent>
            <CardFooter>
              <Button
                onClick={() => {
                  router.push("/dashboard/invoices");
                }}
                className="w-full "
              >
                {t("invoices.invoice_view_all")}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </ContentLayout>
  );
}
