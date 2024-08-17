"use client";
import React from "react";
import { useParams, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { getCookie } from "cookies-next";

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

type Props = {};

export default function Page({}: Props) {
    const { id } = useParams();
    const router = useRouter();

    const t = useTranslations();

    const [customer, setCustomer] = React.useState<Customer | null>(null);
    const [loading, setLoading] = React.useState<boolean>(true);
    const [monthlyInvoice, setMonthlyInvoice] = React.useState<
        Array<{ month: string; amount: number }>
    >([]);

    const onDelete = async () => {
        try {
            setLoading(true);
            const response = await fetch(
                process.env.NEXT_PUBLIC_API_URL + `/api/customers/${id}`,
                {
                    method: "DELETE",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${getCookie("token")}`,
                    },
                }
            );
            if (!response.ok) {
                throw new Error("Failed to delete customer");
            }

            router.push("/dashboard/customers");
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleOnEdit = async (editCustomer: Customer) => {
        try {
            setLoading(true);
            const response = await fetch(
                process.env.NEXT_PUBLIC_API_URL +
                    `/api/customers/${editCustomer.client_id}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${getCookie("token")}`,
                    },
                    body: JSON.stringify(editCustomer),
                }
            );
            if (!response.ok) {
                throw new Error("Failed to update customer");
            }

            const updatedCustomer = await response.json();
            setCustomer(updatedCustomer);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    React.useEffect(() => {
        const fetchMonthlyInvoice = async () => {
            try {
                const response = await fetch(
                    process.env.NEXT_PUBLIC_API_URL +
                        `/api/customers/${id}/monthly-revenue`,
                    {
                        method: "GET",
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${getCookie("token")}`,
                        },
                    }
                );
                if (!response.ok) {
                    throw new Error("Failed to fetch monthly invoice");
                }

                const data = await response.json();
                const formattedData = Object.entries(data.monthlyRevenue).map(
                    ([month, amount]) => ({
                        month,
                        amount,
                    })
                );
                setMonthlyInvoice(formattedData as any);
            } catch (error) {
                console.error(error);
            }
        };
        fetchMonthlyInvoice();
    }, [id]);

    React.useEffect(() => {
        const fetchCustomer = async () => {
            try {
                const response = await fetch(
                    process.env.NEXT_PUBLIC_API_URL + `/api/customers/${id}`,
                    {
                        method: "GET",
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${getCookie("token")}`,
                        },
                    }
                );
                if (!response.ok) {
                    throw new Error("Failed to fetch customer");
                }

                const data = await response.json();
                setCustomer(data);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchCustomer();
    }, [id]);

    React.useEffect(() => {
        const fetchCustomerInvoices = async () => {
            try {
                const response = await fetch(
                    process.env.NEXT_PUBLIC_API_URL +
                        `/api/customers/${id}/invoices`,
                    {
                        method: "GET",
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${getCookie("token")}`,
                        },
                    }
                );
                if (!response.ok) {
                    throw new Error("Failed to fetch customer invoices");
                }

                const data = await response.json();
                setCustomer(
                    (prev) =>
                        prev && {
                            ...prev,
                            invoices: data,
                        }
                );
            } catch (error) {
                console.error(error);
            }
        };
        fetchCustomerInvoices();
    }, [id]);

    return (
        <ContentLayout title={t("customers.customer_details")}>
            <div className="flex flex-col w-full gap-6">
                {loading ? (
                    <div className="flex w-full h-screen items-center justify-center">
                        <ClipLoader
                            color="#009933"
                            loading={loading}
                            size={50}
                        />
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
                                    onModify={handleOnEdit}
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
                                    handleOnConfirm={onDelete}
                                    title={t("customers.customer_delete")}
                                    description={t(
                                        "customers.customer_delete_confirm"
                                    )}
                                    confirmText={t("common.common_delete")}
                                />
                            </div>
                        </div>
                        <div className="flex flex-col w-full  sm:flex-row gap-6">
                            <div className="flex w-full sm:w-1/2 flex-col gap-6">
                                <Card className="flex flex-col justify-center  ">
                                    <CardHeader>
                                        <CardTitle>
                                            {t(
                                                "customers.customer_contact_info"
                                            )}
                                        </CardTitle>
                                        <CardDescription>
                                            {t(
                                                "customers.customer_contact_info_description"
                                            )}
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
                                        <CardTitle>
                                            {t("customers.customer_address")}
                                        </CardTitle>
                                        <CardDescription>
                                            {t(
                                                "customers.customer_address_description"
                                            )}
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
                                            {t(
                                                "customers.customer_monthly_revenue"
                                            )}
                                        </CardTitle>
                                        <CardDescription>
                                            {t(
                                                "customers.customer_monthly_revenue_description"
                                            )}
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        {monthlyInvoice.length === 0 ? (
                                            <Alert>
                                                <AlertTriangle className="w-5 h-5" />
                                                <AlertTitle>
                                                    {t(
                                                        "invoices.invoice_table_no_invoices"
                                                    )}
                                                </AlertTitle>
                                                <AlertDescription>
                                                    {t(
                                                        "invoices.invoice_table_no_invoices_description"
                                                    )}
                                                </AlertDescription>
                                            </Alert>
                                        ) : (
                                            <ResponsiveContainer
                                                width="100%"
                                                height={300}
                                            >
                                                <BarChart data={monthlyInvoice}>
                                                    <XAxis
                                                        dataKey="month"
                                                        name="Month"
                                                    />
                                                    <YAxis name="Amount" />
                                                    <Tooltip />
                                                    <Bar
                                                        dataKey="amount"
                                                        fill="#009933"
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
                                <CardTitle>{t("invoices.invoices")}</CardTitle>
                                <CardDescription>
                                    {t(
                                        "customers.customer_invoices_description"
                                    )}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <TableInvoices
                                    invoices={customer?.invoices}
                                    search={""}
                                />
                            </CardContent>
                        </Card>
                    </>
                )}
            </div>
        </ContentLayout>
    );
}
