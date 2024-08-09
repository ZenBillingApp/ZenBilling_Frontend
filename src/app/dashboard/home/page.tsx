"use client";
import React from "react";
import { useRouter } from "next/navigation";

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

import { ClipLoader } from "react-spinners";
import { getCookie } from "cookies-next";

import { LiaFileInvoiceDollarSolid } from "react-icons/lia";
import { PiUsersThree } from "react-icons/pi";

import { cn } from "@/lib/utils";
import Image from "next/image";
import TableInvoices from "@/components/tableInvoices";

import { useTranslations } from "next-intl";
import DashboardShorcut from "@/components/dashboard-shorcut";

type Props = {
    params: {
        locale: string;
    };
};

export default function Page({ params: { locale } }: Props) {
    const router = useRouter();
    const t = useTranslations();

    const [data, setData] = React.useState<Dashboard>({
        numberOfUnpaidInvoices: 0,
        numberOfLatePaymentInvoices: 0,
        numberOfInvoicesThisMonth: 0,
        numberOfClients: 0,
        latestInvoices: [],
        user: {
            first_name: "",
            last_name: "",
        },
    });
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState<Boolean>(false);

    const fetchData = async () => {
        setLoading(true);
        setError(false);
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL;

            if (!apiUrl) {
                throw new Error(
                    "API URL or API Key is not defined in environment variables"
                );
            }

            const response = await fetch(`${apiUrl}/api/dashboard`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${getCookie("token")}`,
                },
                cache: "no-cache",
            });

            if (!response.ok) {
                throw new Error("Error fetching data");
            }

            const data = await response.json();
            setData(data);
        } catch (error) {
            console.error("Error fetching data: ", error);
            setError(true);
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
        console.error("Error fetching data");
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
                        An error occurred while fetching data
                    </h1>
                    <Button onClick={fetchData}>Retry</Button>
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
                    <h1 className="text-2xl font-semibold">
                        {t("dashboard.dashboard")}
                    </h1>
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
                            <CardTitle>
                                {t("invoices.latest_invoices")}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="flex  w-full h-full ">
                            <TableInvoices
                                invoices={data?.latestInvoices || []}
                                search=""
                            />
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
