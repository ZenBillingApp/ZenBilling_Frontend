import React from "react";
import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";

import { Customer } from "@/types/Customer";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Credenza,
    CredenzaContent,
    CredenzaTrigger,
    CredenzaHeader,
    CredenzaTitle,
    CredenzaDescription,
    CredenzaFooter,
    CredenzaClose,
    CredenzaBody,
} from "@/components/ui/credenza";
import { PhoneInput } from "@/components/ui/phone-input";
import { ScrollArea } from "./ui/scroll-area";
const SearchAddress = dynamic(() => import("@/components/ui/search-address"), {
    ssr: false,
});

type Props = {
    trigger: React.ReactNode;
    onAdd: (newCustomer: Customer) => Promise<void>;
};

export default function AddCustomerDialog({ trigger, onAdd }: Props) {
    const [open, setOpen] = React.useState<boolean>(false);
    const [newCustomer, setNewCustomer] = React.useState<Customer>(
        {} as Customer
    );
    const [loading, setLoading] = React.useState<boolean>(false);
    const t = useTranslations();

    const handleOnAdd = async () => {
        try {
            setLoading(true);
            await onAdd(newCustomer);
            setLoading(false);
            setOpen(false);
        } catch (error) {
            console.error(error);
            setLoading(false);
        }
    };

    return (
        <Credenza open={open} onOpenChange={setOpen}>
            <CredenzaTrigger>{trigger}</CredenzaTrigger>
            <CredenzaContent className="w-full max-w-lg">
                <ScrollArea className="w-full max-h-[80vh] overflow-y-auto">
                    <CredenzaHeader>
                        <CredenzaTitle>
                            {t("customers.customer_add")}
                        </CredenzaTitle>
                        <CredenzaDescription>
                            {t("customers.customer_add_description")}
                        </CredenzaDescription>
                    </CredenzaHeader>
                    <CredenzaBody className="flex flex-col space-y-4">
                        <div className="flex flex-col gap-2 sm:flex-row">
                            <div className="flex flex-col gap-2 sm:w-1/2">
                                <Label htmlFor="first_name">
                                    {t("customers.customer_first_name")}
                                </Label>
                                <Input
                                    id="first_name"
                                    type="text"
                                    placeholder={t(
                                        "customers.customer_first_name_placeholder"
                                    )}
                                    value={newCustomer.first_name}
                                    onChange={(e) =>
                                        setNewCustomer({
                                            ...newCustomer,
                                            first_name: e.target.value,
                                        })
                                    }
                                />
                            </div>
                            <div className="flex flex-col w-full gap-2 sm:w-1/2">
                                <Label htmlFor="last_name">
                                    {t("customers.customer_last_name")}
                                </Label>
                                <Input
                                    id="last_name"
                                    type="text"
                                    placeholder={t(
                                        "customers.customer_last_name_placeholder"
                                    )}
                                    value={newCustomer.last_name}
                                    onChange={(e) =>
                                        setNewCustomer({
                                            ...newCustomer,
                                            last_name: e.target.value,
                                        })
                                    }
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-1 gap-2">
                            <Label htmlFor="address">
                                {t("customers.customer_address")}
                            </Label>
                            <SearchAddress
                                onSelectLocation={(location) => {
                                    setNewCustomer({
                                        ...newCustomer,
                                        street_address:
                                            location?.raw.address.house_number +
                                                " " +
                                                location?.raw.address.road ||
                                            "",
                                        city:
                                            location?.raw.address.town ||
                                            location?.raw.address
                                                .municipality ||
                                            "",
                                        state:
                                            location?.raw.address.state || "",
                                        postal_code:
                                            location?.raw.address.postcode ||
                                            "",
                                        country:
                                            location?.raw.address.country || "",
                                    });
                                }}
                            />
                        </div>
                        <div className="flex flex-col w-full gap-2">
                            <Label htmlFor="email">
                                {t("customers.customer_email")}
                            </Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder={t(
                                    "customers.customer_email_placeholder"
                                )}
                                value={newCustomer.email}
                                onChange={(e) =>
                                    setNewCustomer({
                                        ...newCustomer,
                                        email: e.target.value,
                                    })
                                }
                            />
                        </div>
                        <div className="flex flex-col w-full gap-2">
                            <Label htmlFor="phone">
                                {t("customers.customer_phone")}
                            </Label>
                            <PhoneInput
                                required
                                id="company.phone"
                                name="company.phone"
                                placeholder={t(
                                    "customers.customer_phone_placeholder"
                                )}
                                value={newCustomer.phone}
                                defaultCountry="FR"
                                onChange={(phone) =>
                                    setNewCustomer({
                                        ...newCustomer,
                                        phone,
                                    })
                                }
                            />
                        </div>
                    </CredenzaBody>
                    <CredenzaFooter>
                        <CredenzaClose asChild>
                            <Button variant="outline" disabled={loading}>
                                {t("common.common_cancel")}
                            </Button>
                        </CredenzaClose>
                        <Button
                            onClick={handleOnAdd}
                            disabled={
                                !newCustomer.first_name ||
                                !newCustomer.last_name ||
                                !newCustomer.street_address ||
                                !newCustomer.city ||
                                !newCustomer.state ||
                                !newCustomer.postal_code ||
                                !newCustomer.country ||
                                !newCustomer.email ||
                                !newCustomer.phone ||
                                loading
                            }
                        >
                            {loading
                                ? t("customers.customer_add_loading")
                                : t("customers.customer_add")}
                        </Button>
                    </CredenzaFooter>
                </ScrollArea>
            </CredenzaContent>
        </Credenza>
    );
}
