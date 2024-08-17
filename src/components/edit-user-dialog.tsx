import React from "react";
import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";

import { User } from "@/types/User";

import {
    Credenza,
    CredenzaContent,
    CredenzaFooter,
    CredenzaHeader,
    CredenzaTitle,
    CredenzaTrigger,
    CredenzaClose,
    CredenzaDescription,
    CredenzaBody,
} from "@/components/ui/credenza";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";
import { ScrollArea } from "./ui/scroll-area";
import { PhoneInput } from "./ui/phone-input";
const SearchAddress = dynamic(() => import("@/components/ui/search-address"), {
    ssr: false,
});

type Props = {
    trigger: React.ReactNode;
    user: User;
    onSave: (updatedUser: User) => void;
};

export default function EditUserDialog({ trigger, user, onSave }: Props) {
    const t = useTranslations();

    const [open, setOpen] = React.useState(false);
    const [newUser, setNewUser] = React.useState<User>(user);
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState(false);

    return (
        <Credenza open={open} onOpenChange={setOpen}>
            <CredenzaTrigger>{trigger}</CredenzaTrigger>
            <CredenzaContent>
                <ScrollArea className="flex w-full max-h-[80vh]  overflow-y-auto">
                    <div className="flex flex-col w-full gap-4 p-2">
                        <CredenzaHeader>
                            <CredenzaTitle>
                                {t("profile.profile_dialog_title")}
                            </CredenzaTitle>
                            <CredenzaDescription>
                                {t("profile.profile_dialog_description")}
                            </CredenzaDescription>
                        </CredenzaHeader>

                        <CredenzaBody className="flex flex-col gap-4">
                            {error && (
                                <Alert variant="destructive">
                                    <AlertTriangle className="w-5 h-5" />
                                    <AlertTitle>
                                        Failed to update user
                                    </AlertTitle>
                                    <AlertDescription>
                                        Please check your information and try
                                        again.
                                    </AlertDescription>
                                </Alert>
                            )}
                            <div className="flex gap-2">
                                <div className="flex flex-col w-1/2 gap-2">
                                    <Label>
                                        {t("customers.customer_first_name")}
                                    </Label>
                                    <Input
                                        type="text"
                                        placeholder={t(
                                            "customers.customer_first_name_placeholder"
                                        )}
                                        value={newUser?.first_name || ""}
                                        onChange={(e) =>
                                            setNewUser(
                                                (prev) =>
                                                    prev && {
                                                        ...prev,
                                                        first_name:
                                                            e.target.value,
                                                    }
                                            )
                                        }
                                    />
                                </div>
                                <div className="flex flex-col w-1/2 gap-2">
                                    <Label>
                                        {t("customers.customer_last_name")}
                                    </Label>
                                    <Input
                                        type="text"
                                        placeholder={t(
                                            "customers.customer_last_name_placeholder"
                                        )}
                                        value={newUser?.last_name || ""}
                                        onChange={(e) =>
                                            setNewUser(
                                                (prev) =>
                                                    prev && {
                                                        ...prev,
                                                        last_name:
                                                            e.target.value,
                                                    }
                                            )
                                        }
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 gap-2">
                                <Label htmlFor="address">
                                    {t("profile.profile_address")}
                                </Label>
                                <SearchAddress
                                    location={
                                        newUser?.street_address +
                                        " " +
                                        newUser?.city +
                                        " " +
                                        newUser?.state +
                                        " " +
                                        newUser?.postal_code +
                                        " " +
                                        newUser?.country
                                    }
                                    onSelectLocation={(location) => {
                                        setNewUser({
                                            ...newUser,
                                            street_address:
                                                location?.raw.address
                                                    .house_number +
                                                    " " +
                                                    location?.raw.address
                                                        .road || "",
                                            city:
                                                location?.raw.address.town ||
                                                location?.raw.address
                                                    .municipality ||
                                                "",
                                            state:
                                                location?.raw.address.state ||
                                                "",
                                            postal_code:
                                                location?.raw.address
                                                    .postcode || "",
                                            country:
                                                location?.raw.address.country ||
                                                "",
                                        });
                                    }}
                                />
                            </div>
                            <div className="flex flex-col w-full gap-2">
                                <Label>{t("profile.profile_email")}</Label>
                                <Input
                                    type="email"
                                    placeholder={t(
                                        "profile.profile_email_placeholder"
                                    )}
                                    value={newUser?.email || ""}
                                    onChange={(e) =>
                                        setNewUser(
                                            (prev) =>
                                                prev && {
                                                    ...prev,
                                                    email: e.target.value,
                                                }
                                        )
                                    }
                                />
                            </div>
                            <div className="flex flex-col w-full gap-2">
                                <Label>{t("profile.profile_phone")}</Label>
                                <PhoneInput
                                    required
                                    id="company.phone"
                                    name="company.phone"
                                    placeholder={t(
                                        "customers.customer_phone_placeholder"
                                    )}
                                    value={newUser.phone}
                                    defaultCountry="FR"
                                    onChange={(phone) =>
                                        setNewUser({
                                            ...newUser,
                                            phone,
                                        })
                                    }
                                />
                            </div>

                            <CredenzaFooter>
                                <CredenzaClose asChild>
                                    <Button
                                        variant="outline"
                                        onClick={() => setOpen(false)}
                                    >
                                        {t("common.common_cancel")}
                                    </Button>
                                </CredenzaClose>
                                <Button
                                    disabled={
                                        !newUser?.first_name ||
                                        !newUser?.last_name ||
                                        !newUser?.email ||
                                        !newUser?.phone ||
                                        !newUser?.street_address ||
                                        !newUser?.city ||
                                        !newUser?.state ||
                                        !newUser?.postal_code ||
                                        !newUser?.country ||
                                        loading
                                    }
                                    onClick={() => {
                                        setLoading(true);
                                        onSave(newUser);
                                    }}
                                >
                                    {loading
                                        ? t("profile.profile_update_loading")
                                        : t("profile.profile_update")}
                                </Button>
                            </CredenzaFooter>
                        </CredenzaBody>
                    </div>
                </ScrollArea>
            </CredenzaContent>
        </Credenza>
    );
}
