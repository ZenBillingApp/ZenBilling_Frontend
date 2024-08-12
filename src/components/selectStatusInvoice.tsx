import React from "react";
import { useTranslations } from "next-intl";

import { Invoice } from "@/types/Invoice";

import {
    Select,
    SelectTrigger,
    SelectContent,
    SelectItem,
    SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

type Props = {
    invoice: Invoice | null;
    handleChangeStatus: (status: string) => void;
};

const SelectStatusInvoice = ({ invoice, handleChangeStatus }: Props) => {
    const t = useTranslations();
    return (
        <Select
            defaultValue={invoice?.status}
            value={invoice?.status}
            onValueChange={handleChangeStatus}
        >
            <SelectTrigger className="border-0 p-0 h-fit gap-2 bg-transparent focus:outline-none focus:ring-0 focus:ring-offset-0">
                <SelectValue />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="paid">
                    <Badge className="bg-green-500 text-white">
                        {t("invoices.invoice_table_filter_paid")}
                    </Badge>
                </SelectItem>
                <SelectItem value="pending">
                    <Badge className="bg-yellow-500 text-white hover:bg-yellow-600">
                        {t("invoices.invoice_table_filter_pending")}
                    </Badge>
                </SelectItem>
                <SelectItem value="cancelled">
                    <Badge className="bg-red-500 text-white hover:bg-red-600">
                        {t("invoices.invoice_table_filter_cancelled")}
                    </Badge>
                </SelectItem>
            </SelectContent>
        </Select>
    );
};

export default SelectStatusInvoice;
