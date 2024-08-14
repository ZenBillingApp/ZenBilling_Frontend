import React from "react";
import { useTranslations } from "next-intl";

import { Customer } from "@/types/Customer";

import useFetch from "@/hooks/useFetch";

import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
    SheetTrigger,
} from "@/components/ui/sheet";
import { ClipLoader } from "react-spinners";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

type Props = {
    trigger: React.ReactNode;
    handleSelectCustomer: (customer: Customer) => void;
};

export default function SheetCustomers({
    handleSelectCustomer,
    trigger,
}: Props) {
    const t = useTranslations();
    const [open, setOpen] = React.useState(false);
    const [search, setSearch] = React.useState("");
    const [selectedCustomer, setSelectedCustomer] =
        React.useState<Customer | null>(null);
    const {
        data: customers,
        loading: loading,
        error: error,
    } = useFetch<Customer[]>(
        `${process.env.NEXT_PUBLIC_API_URL}/api/customers?${
            search ? `search=${search}` : ""
        }`
    );

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>{trigger}</SheetTrigger>
            <SheetContent className="p-10">
                <SheetHeader>
                    <SheetTitle>
                        <h1 className="text-2xl font-semibold">
                            {t("customers.customer_select")}
                        </h1>
                    </SheetTitle>
                    <SheetDescription>
                        <Input
                            placeholder={t(
                                "customers.customer_placeholder_search"
                            )}
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </SheetDescription>
                </SheetHeader>
                <div className="flex flex-col gap-2 mt-6">
                    {loading && (
                        <div className="flex justify-center items-center">
                            <ClipLoader color="#009933" size={20} />
                        </div>
                    )}
                    {error && <p>{t("customers.customer_failed_search")}</p>}
                    {customers && customers.length === 0 && !loading && (
                        <p>{t("customers.customer_no_results")}</p>
                    )}
                    {customers &&
                        customers.map((customer) => (
                            <Button
                                variant="secondary"
                                key={customer.client_id}
                                onClick={() => {
                                    setSelectedCustomer(customer);
                                    setOpen(false);
                                    handleSelectCustomer(customer);
                                }}
                            >
                                {customer.first_name} {customer.last_name}
                            </Button>
                        ))}
                </div>
            </SheetContent>
        </Sheet>
    );
}
