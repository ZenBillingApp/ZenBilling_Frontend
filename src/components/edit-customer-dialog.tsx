import React, { useEffect } from "react";
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
import { useToast } from "@/components/ui/use-toast";

import api from "@/lib/axios";

type Props = {
  trigger: React.ReactNode;
  customer: Customer | null;
};

export default function EditCustomerDialog({ trigger, customer }: Props) {
  const [open, setOpen] = React.useState<boolean>(false);
  const [newCustomer, setNewCustomer] = React.useState<Customer>(
    customer || ({} as Customer)
  );
  const [loading, setLoading] = React.useState<boolean>(false);

  const t = useTranslations();
  const { toast } = useToast();

  const handleOnEdit = async () => {
    try {
      setLoading(true);
      const response = await api.put(`/customers/${newCustomer.client_id}`, {
        ...newCustomer,
      });
      toast({
        title: "Client modifié",
        description: "Le client a été modifié avec succès",
      });
      setOpen(false);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Une erreur s'est produite",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!open) {
      setNewCustomer(customer || ({} as Customer));
    }
  }, [open]);

  return (
    <Credenza open={open} onOpenChange={setOpen}>
      <CredenzaTrigger>{trigger}</CredenzaTrigger>
      <CredenzaContent>
        <ScrollArea className="flex w-full max-h-[80vh] overflow-y-auto">
          <div className="flex flex-col w-full gap-4 p-2">
            <CredenzaHeader>
              <CredenzaTitle>{t("customers.customer_add")}</CredenzaTitle>
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
                    required
                    id="first_name"
                    type="text"
                    placeholder={t("customers.customer_first_name_placeholder")}
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
                    required
                    id="last_name"
                    type="text"
                    placeholder={t("customers.customer_last_name_placeholder")}
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
                <Input
                  required
                  id="address"
                  type="text"
                  placeholder={t("customers.customer_address_placeholder")}
                  value={newCustomer.street_address}
                  onChange={(e) =>
                    setNewCustomer({
                      ...newCustomer,
                      street_address: e.target.value,
                    })
                  }
                />
              </div>
              <div className="flex flex-col gap-2 sm:flex-row">
                <div className="flex flex-col gap-2 sm:w-1/2">
                  <Label htmlFor="city">{t("customers.customer_city")}</Label>
                  <Input
                    required
                    id="city"
                    type="text"
                    placeholder={t("customers.customer_city_placeholder")}
                    value={newCustomer.city}
                    onChange={(e) =>
                      setNewCustomer({
                        ...newCustomer,
                        city: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="flex flex-col w-full gap-2 sm:w-1/2">
                  <Label htmlFor="state">{t("customers.customer_state")}</Label>
                  <Input
                    required
                    id="state"
                    type="text"
                    placeholder={t("customers.customer_state_placeholder")}
                    value={newCustomer.state}
                    onChange={(e) =>
                      setNewCustomer({
                        ...newCustomer,
                        state: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row">
                <div className="flex flex-col gap-2 sm:w-1/2">
                  <Label htmlFor="postal_code">
                    {t("customers.customer_postal_code")}
                  </Label>
                  <Input
                    required
                    id="postal_code"
                    type="text"
                    placeholder={t(
                      "customers.customer_postal_code_placeholder"
                    )}
                    value={newCustomer.postal_code}
                    onChange={(e) =>
                      setNewCustomer({
                        ...newCustomer,
                        postal_code: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="flex flex-col w-full gap-2 sm:w-1/2">
                  <Label htmlFor="country">
                    {t("customers.customer_country")}
                  </Label>
                  <Input
                    required
                    id="country"
                    type="text"
                    placeholder={t("customers.customer_country_placeholder")}
                    value={newCustomer.country}
                    onChange={(e) =>
                      setNewCustomer({
                        ...newCustomer,
                        country: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
              <div className="flex flex-col w-full gap-2">
                <Label htmlFor="email">{t("customers.customer_email")}</Label>
                <Input
                  required
                  id="email"
                  type="email"
                  placeholder={t("customers.customer_email_placeholder")}
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
                <Label htmlFor="phone">{t("customers.customer_phone")}</Label>
                <PhoneInput
                  required
                  id="company.phone"
                  name="company.phone"
                  placeholder={t("customers.customer_phone_placeholder")}
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
              <Button onClick={handleOnEdit} disabled={loading}>
                {loading
                  ? t("customers.customer_update_loading")
                  : t("customers.customer_update")}
              </Button>
            </CredenzaFooter>
          </div>
        </ScrollArea>
      </CredenzaContent>
    </Credenza>
  );
}
