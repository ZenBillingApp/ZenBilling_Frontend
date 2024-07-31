"use client";
import React from "react";
import { useRouter } from "next/navigation";

import { Invoice } from "@/types/Invoice";

import { useTranslations } from "next-intl";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import useFormattedAmount from "@/hooks/useFormattedAmount";
import useFormattedDate from "@/hooks/useFormattedDate";

type Props = {
    invoices: Invoice[] | undefined;
    search: string | null | undefined;
};

export default function TableInvoices({ invoices, search }: Props) {
    const t = useTranslations();
    const router = useRouter();
    const { formatAmount } = useFormattedAmount();
    const { formatDate } = useFormattedDate();
    const handleSelectInvoice = (invoiceId: number) => {
        router.push(`/dashboard/invoices/${invoiceId}`);
    };
    return (
        <Table>
            <TableHeader>
                <TableHead>
                    {t("invoices.invoice_table_header_invoice_number")}
                </TableHead>
                <TableHead>
                    {t("invoices.invoice_table_header_first_name")}
                </TableHead>
                <TableHead>
                    {t("invoices.invoice_table_header_last_name")}
                </TableHead>
                <TableHead>
                    {t("invoices.invoice_table_header_status")}
                </TableHead>
                <TableHead>
                    {t("invoices.invoice_table_header_items")}
                </TableHead>
                <TableHead>
                    {t("invoices.invoice_table_header_amount")}
                </TableHead>
                <TableHead>
                    {t("invoices.invoice_table_header_invoice_date")}
                </TableHead>
                <TableHead>
                    {t("invoices.invoice_table_header_due_date")}
                </TableHead>
            </TableHeader>
            <TableBody>
                {invoices?.length === 0 ? (
                    <TableRow>
                        <TableCell colSpan={8} className="text-center">
                            {search
                                ? t("invoices.invoice_table_no_invoices")
                                : t(
                                      "invoices.invoice_table_no_invoices_description"
                                  )}
                        </TableCell>
                    </TableRow>
                ) : (
                    invoices?.map((invoice) => (
                        <TableRow
                            key={invoice.invoice_id}
                            onClick={() =>
                                handleSelectInvoice(invoice.invoice_id)
                            }
                            className="cursor-pointer"
                        >
                            <TableCell>{invoice.invoice_id || "N/A"}</TableCell>
                            <TableCell>
                                {invoice.client.first_name || "N/A"}
                            </TableCell>
                            <TableCell>
                                {invoice.client.last_name || "N/A"}
                            </TableCell>
                            <TableCell>
                                <Badge
                                    className={cn(
                                        invoice.status === "paid"
                                            ? "bg-green-500 text-white hover:bg-green-600"
                                            : invoice.status === "pending"
                                            ? "bg-yellow-500 text-white hover:bg-yellow-600"
                                            : "bg-red-500 text-white hover:bg-red-600"
                                    )}
                                >
                                    {t(
                                        `invoices.invoice_table_status_${invoice.status}`
                                    ) || "N/A"}
                                </Badge>
                            </TableCell>
                            <TableCell>{invoice?.items?.length || 0}</TableCell>

                            <TableCell>
                                {formatAmount(invoice.total_amount, {
                                    currency: "EUR",
                                })}
                            </TableCell>
                            <TableCell>
                                {formatDate(invoice.invoice_date) || "N/A"}
                            </TableCell>
                            <TableCell>
                                {formatDate(invoice.due_date) || "N/A"}
                            </TableCell>
                        </TableRow>
                    ))
                )}
            </TableBody>
        </Table>
    );
}
