"use client";
import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { getCookie } from "cookies-next";

import useFormattedAmount from "@/hooks/useFormattedAmount";
import useFormattedDate from "@/hooks/useFormattedDate";
import useFetch from "@/hooks/useFetch";

import { Invoice } from "@/types/Invoice";
import { Customer } from "@/types/Customer";
import { Item } from "@/types/Item";

import SelectStatusInvoice from "@/components/selectStatusInvoice";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { ToastAction } from "@/components/ui/toast";
import { ContentLayout } from "@/components/admin-panel/content-layout";
import AlertDialog from "@/components/alert-dialog";
import DatePicker from "@/components/datePicker";
import SheetCustomers from "@/components/sheet-customers";
import TableItems from "@/components/table-items";
import EditTableItems from "@/components/edit-table-items";

import { ClipLoader } from "react-spinners";
import { ChevronDownIcon } from "lucide-react";
import { MdOutlineEdit, MdDeleteOutline, MdClose } from "react-icons/md";

type Props = {};

export default function Page({}: Props) {
    const { id } = useParams();
    const router = useRouter();
    const { toast } = useToast();
    const t = useTranslations();

    const { formatAmount } = useFormattedAmount();
    const { formatDate } = useFormattedDate();

    const [invoice, setInvoice] = useState<Invoice | null>(null);
    const [loading, setLoading] = useState(true);
    const [editOpen, setEditOpen] = useState(false);

    const handleChangeCustomer = async (customer: Customer) => {
        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/api/invoices/${id}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${getCookie("token")}`,
                    },
                    body: JSON.stringify({ client_id: customer.client_id }),
                }
            );

            if (!response.ok) {
                throw new Error("Failed to update customer");
            }

            toast({
                title: "Success",
                description: "Customer updated successfully",
            });
            setInvoice((prev) => (prev ? { ...prev, client: customer } : prev));
        } catch (error) {
            console.error(error);
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to update customer",
                action: (
                    <ToastAction
                        altText="Retry"
                        onClick={() => handleChangeCustomer(customer)}
                    >
                        Retry
                    </ToastAction>
                ),
            });
        }
    };

    useEffect(() => {
        const fetchInvoiceDetails = async () => {
            try {
                const response = await fetch(
                    `${process.env.NEXT_PUBLIC_API_URL}/api/invoices/${id}`,
                    {
                        method: "GET",
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${getCookie("token")}`,
                        },
                    }
                );
                if (!response.ok) {
                    throw new Error("Failed to fetch invoice");
                }

                const data = await response.json();
                setInvoice(data);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchInvoiceDetails();
    }, [id]);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-full w-full">
                <ClipLoader color="#009933" />
            </div>
        );
    }

    let totalAmountWithoutVAT = 0;
    let totalAmount = 0;

    if (invoice?.items) {
        for (let item of invoice.items) {
            const itemTotal = item.unit_price * item.quantity;
            const itemVAT = (item.vat_rate / 100) * itemTotal;
            totalAmountWithoutVAT += itemTotal;
            totalAmount += itemTotal + itemVAT;
        }
    }

    const handleDownload = async () => {
        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/api/invoices/${id}/pdf`,
                {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${getCookie("token")}`,
                    },
                }
            );

            if (!response.ok) {
                throw new Error("Failed to download invoice");
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `${invoice?.invoice_id}.pdf`;
            document.body.appendChild(a);
            a.click();
            a.remove();
        } catch (error) {
            console.error(error);
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to download invoice",
            });
        }
    };

    const handleChangeStatus = async (status: string) => {
        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/api/invoices/${id}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${getCookie("token")}`,
                    },
                    body: JSON.stringify({ status }),
                }
            );

            if (!response.ok) {
                throw new Error("Failed to update status");
            }

            toast({
                title: "Success",
                description: "Status updated successfully",
            });
            setInvoice((prev) => (prev ? { ...prev, status } : prev));
        } catch (error) {
            console.error(error);
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to update status of invoice",
                action: (
                    <ToastAction
                        altText="Retry"
                        onClick={() => handleChangeStatus(status)}
                    >
                        Retry
                    </ToastAction>
                ),
            });
        }
    };

    const handleSelectDueDate = async (date: Date) => {
        // Ajuster manuellement le décalage de fuseau horaire
        const localDate = new Date(
            date.getTime() - date.getTimezoneOffset() * 60000
        );
        const isoDate = localDate.toISOString().split("T")[0]; // Garde seulement la partie date sans l'heure

        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/api/invoices/${id}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${getCookie("token")}`,
                    },
                    body: JSON.stringify({ due_date: isoDate }),
                }
            );

            if (!response.ok) {
                throw new Error("Failed to update due date");
            }

            toast({
                title: "Success",
                description: "Due date updated successfully",
            });
            console.log(response);
            setInvoice((prev) =>
                prev ? { ...prev, due_date: isoDate as unknown as Date } : prev
            );
        } catch (error) {
            console.error(error);
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to update due date",
                action: (
                    <ToastAction
                        altText="Retry"
                        onClick={() => handleSelectDueDate(date)}
                    >
                        Retry
                    </ToastAction>
                ),
            });
        }
    };

    const handleSaveItems = async (items: Item[]) => {
        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/api/invoices/${id}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${getCookie("token")}`,
                    },
                    body: JSON.stringify({ items }),
                }
            );

            if (!response.ok) {
                throw new Error("Failed to update items");
            }

            const responseData = await response.json(); // Parse the response data

            toast({
                title: "Success",
                description: "Items updated successfully",
            });

            setInvoice((prev) =>
                prev ? { ...prev, items: responseData.items } : prev
            );

            setEditOpen(false);
        } catch (error) {
            console.error(error);
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to update items",
                action: (
                    <ToastAction
                        altText="Retry"
                        onClick={() => handleSaveItems(items)}
                    >
                        Retry
                    </ToastAction>
                ),
            });
        }
    };

    const HandleOnDelete = async () => {
        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/api/invoices/${id}`,
                {
                    method: "DELETE",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${getCookie("token")}`,
                    },
                }
            );

            if (!response.ok) {
                throw new Error("Failed to delete invoice");
            }

            router.push("/dashboard/invoices");
            toast({
                title: "Success",
                description: "Invoice deleted successfully",
            });
        } catch (error) {
            console.error(error);
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to delete invoice",
                action: (
                    <ToastAction altText="Retry" onClick={HandleOnDelete}>
                        Retry
                    </ToastAction>
                ),
            });
        }
    };

    return (
        <ContentLayout title={t("invoices.invoice_details")}>
            <div className="flex flex-col flex-1 gap-6">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    <h1 className="text-2xl font-semibold">
                        {" "}
                        {t("invoices.invoice") + " / " + id}
                    </h1>
                    <div className="flex gap-4">
                        <Button
                            variant="outline"
                            className="flex items-center gap-2"
                            onClick={handleDownload}
                        >
                            <Download size={16} />
                            {t("common.common_download_pdf")}
                        </Button>

                        <AlertDialog
                            trigger={
                                <Button
                                    variant="destructive"
                                    className="flex items-center gap-2"
                                >
                                    <MdDeleteOutline size={20} />
                                    {t("common.common_delete")}
                                </Button>
                            }
                            title={t("invoices.invoice_delete")}
                            description={t("invoices.invoice_delete_confirm")}
                            confirmText={t("common.common_delete")}
                            handleOnConfirm={HandleOnDelete}
                        />
                    </div>
                </div>
                <Card className="flex flex-col justify-between p-6 md:flex-row gap-4">
                    <div className="flex flex-col w-full gap-4 md:w-1/2">
                        <div className="flex items-center justify-between">
                            <h2 className="text-sm font-semibold">
                                {t("invoices.invoice_id")}
                            </h2>
                            <p className="flex text-sm text-right">
                                {invoice?.invoice_id}
                            </p>
                        </div>
                        <div className="flex items-center justify-between">
                            <h2 className="text-sm font-semibold">
                                {t("invoices.invoice_date")}
                            </h2>
                            <p className="flex text-sm text-right">
                                {invoice?.invoice_date
                                    ? formatDate(new Date(invoice.invoice_date))
                                    : ""}
                            </p>
                        </div>

                        <div className="flex items-center justify-between">
                            <h2 className="text-sm font-semibold">
                                {t("invoices.invoice_status")}
                            </h2>
                            <div className="flex">
                                <SelectStatusInvoice
                                    invoice={invoice}
                                    handleChangeStatus={handleChangeStatus}
                                />
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-col w-full gap-4 md:w-1/2">
                        <div className="flex items-center justify-between">
                            <h2 className="text-sm font-semibold">
                                {t("invoices.invoice_due_date")}
                            </h2>
                            <DatePicker
                                trigger={
                                    <Button
                                        variant="ghost"
                                        className="p-0 h-fit justify-start text-left font-normal hover:bg-transparent"
                                    >
                                        {formatDate(
                                            new Date(invoice?.due_date as Date)
                                        ) || "Select Due Date"}
                                        <ChevronDownIcon
                                            size={16}
                                            className="ml-2 opacity-50"
                                        />
                                    </Button>
                                }
                                value={invoice?.due_date}
                                onChange={handleSelectDueDate}
                            />
                        </div>
                    </div>
                </Card>
                <div className="flex flex-col gap-6 md:flex-row">
                    <Card className="flex flex-col w-full gap-2 p-6">
                        <h2 className="text-lg font-semibold">
                            {t("invoices.invoice_myCompany")}
                        </h2>
                        <div className="flex flex-col pl-2">
                            <h2 className="text-sm font-semibold">
                                {invoice?.company?.name}
                            </h2>
                            <p className="text-sm">
                                {invoice?.company?.street_address}
                            </p>
                            <p className="text-sm">
                                {invoice?.company?.city},{" "}
                                {invoice?.company?.state}{" "}
                                {invoice?.company?.postal_code}
                            </p>
                            <p className="text-sm">
                                {invoice?.company?.country}
                            </p>
                            <p className="text-sm">
                                <span className="font-semibold">
                                    {t("common.common_email")} :
                                </span>{" "}
                                {invoice?.company?.email}
                            </p>
                            <p className="text-sm">
                                <span className="font-semibold">
                                    {t("common.common_phone")} :
                                </span>{" "}
                                {invoice?.company?.phone}
                            </p>
                            <p className="text-sm">
                                <span className="font-semibold">
                                    {t("common.common_vat_number")} :
                                </span>{" "}
                                {invoice?.company?.vat_number}
                            </p>
                        </div>
                    </Card>
                    <Card className="relative flex flex-col w-full gap-2 p-6">
                        <SheetCustomers
                            trigger={
                                <MdOutlineEdit
                                    size={20}
                                    className="absolute top-2 right-2 cursor-pointer"
                                />
                            }
                            handleSelectCustomer={handleChangeCustomer}
                        />
                        <h2 className="text-lg font-semibold">
                            {t("invoices.invoice_billTo")} :
                        </h2>
                        <div className="flex flex-col pl-2">
                            <h2 className="text-sm font-semibold">
                                {invoice?.client?.first_name}{" "}
                                {invoice?.client?.last_name}
                            </h2>
                            <p className="text-sm">
                                {invoice?.client?.street_address}
                            </p>
                            <p className="text-sm">
                                {invoice?.client?.city},{" "}
                                {invoice?.client?.state}{" "}
                                {invoice?.client?.postal_code}
                            </p>
                            <p className="text-sm">
                                {invoice?.client?.country}
                            </p>
                            <p className="text-sm">
                                <span className="font-semibold">
                                    {t("common.common_email")} :
                                </span>{" "}
                                {invoice?.client?.email}
                            </p>
                            <p className="text-sm">
                                <span className="font-semibold">
                                    {t("common.common_phone")} :
                                </span>{" "}
                                {invoice?.client?.phone}
                            </p>
                        </div>
                    </Card>
                </div>
                <Card className="relative">
                    <CardHeader>
                        <CardTitle>{t("items.items")}</CardTitle>
                        {editOpen ? (
                            <MdClose
                                size={20}
                                className="absolute top-2 right-2 cursor-pointer"
                                onClick={() => setEditOpen((prev) => !prev)}
                            />
                        ) : (
                            <MdOutlineEdit
                                size={20}
                                className="absolute top-2 right-2 cursor-pointer"
                                onClick={() => setEditOpen((prev) => !prev)}
                            />
                        )}
                    </CardHeader>
                    <CardContent>
                        {editOpen ? (
                            <EditTableItems
                                items={invoice?.items || []}
                                handleOnSaveItems={handleSaveItems}
                            />
                        ) : (
                            <TableItems items={invoice?.items || []} />
                        )}
                    </CardContent>
                </Card>

                <div className="flex justify-end p-4">
                    <div className="w-full md:w-1/4">
                        <div className="flex justify-between">
                            <h2 className="text-sm font-semibold">
                                {t("invoices.invoice_subtotal")} :
                            </h2>
                            <p className="flex w-24 text-sm items-start text-right">
                                {formatAmount(totalAmountWithoutVAT, {
                                    currency: "EUR",
                                })}
                            </p>
                        </div>
                        <div className="flex justify-between">
                            <h2 className="text-sm font-semibold">
                                {t("invoices.invoice_vat")} :
                            </h2>
                            <p className="flex w-24 text-sm items-start text-right">
                                {formatAmount(
                                    totalAmount - totalAmountWithoutVAT,
                                    {
                                        currency: "EUR",
                                    }
                                )}
                            </p>
                        </div>
                        <div className="flex justify-between">
                            <h2 className="text-sm font-semibold">
                                {t("invoices.invoice_total")} :
                            </h2>
                            <p className="flex w-24 text-sm items-start text-right">
                                {formatAmount(totalAmount, {
                                    currency: "EUR",
                                })}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </ContentLayout>
    );
}
