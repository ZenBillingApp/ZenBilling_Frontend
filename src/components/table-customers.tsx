import React from "react";
import { useTranslations } from "next-intl";

import { Customer } from "@/types/Customer";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

type Props = {
    customers: Customer[];
    handleSelectCustomer: (clientId: number) => void;
};

export default function TableCustomers({
    customers,
    handleSelectCustomer,
}: Props) {
    const t = useTranslations();
    return (
        <Table>
            <TableHeader>
                <TableHead>{t("customers.customer_table_header_id")}</TableHead>
                <TableHead>
                    {t("customers.customer_table_header_first_name")}
                </TableHead>
                <TableHead>
                    {t("customers.customer_table_header_last_name")}
                </TableHead>
                <TableHead>
                    {t("customers.customer_table_header_email")}
                </TableHead>
                <TableHead>
                    {t("customers.customer_table_header_phone")}
                </TableHead>
                <TableHead>
                    {t("customers.customer_table_header_country")}
                </TableHead>
                <TableHead>
                    {t("customers.customer_table_header_invoice_count")}
                </TableHead>
            </TableHeader>
            <TableBody>
                {customers?.length === 0 ? (
                    <TableRow>
                        <TableCell colSpan={8} className="text-center">
                            {t("customers.customer_table_no_customers")}
                        </TableCell>
                    </TableRow>
                ) : (
                    customers?.map((customer) => (
                        <TableRow
                            key={customer.client_id}
                            onClick={() =>
                                handleSelectCustomer(customer.client_id)
                            }
                            className="cursor-pointer"
                        >
                            <TableCell>{customer.client_id}</TableCell>
                            <TableCell>{customer.first_name}</TableCell>
                            <TableCell>{customer.last_name}</TableCell>
                            <TableCell>{customer.email}</TableCell>
                            <TableCell>{customer.phone}</TableCell>
                            <TableCell>{customer.country}</TableCell>
                            <TableCell>{customer.invoice_count}</TableCell>
                        </TableRow>
                    ))
                )}
            </TableBody>
        </Table>
    );
}
