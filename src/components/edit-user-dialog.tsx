import React, { useEffect } from "react";
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
import { ScrollArea } from "./ui/scroll-area";
import { FormPhoneInput } from "./ui/phone-input";
import { ToastAction } from "@/components/ui/toast";
import { useToast } from "@/components/ui/use-toast";

import { AlertTriangle } from "lucide-react";

import api from "@/lib/axios";

type Props = {
  trigger: React.ReactNode;
  user: User;
  onSave: (updatedUser: User) => void;
};

export default function EditUserDialog({ trigger, user, onSave }: Props) {
  const t = useTranslations();
  const { toast } = useToast();

  const [open, setOpen] = React.useState(false);
  const [newUser, setNewUser] = React.useState<User>(user);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<
    | string
    | [
        {
          msg: string;
        }
      ]
    | null
  >(null);

  useEffect(() => {
    if (open) {
      setNewUser(user);
      setError(null);
    }
  }, [open, user]);

  const handleSave = async (newUser: User) => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.put(`/user`, newUser);
      onSave(response.data);
      toast({
        title: "Mise à jour de l'utilisateur",
        description:
          "Les informations de l'utilisateur ont été mises à jour avec succès.",
      });
      setOpen(false);
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          err.response?.data?.errors ||
          "Une erreur s'est produite"
      );
      toast({
        variant: "destructive",
        title: "Échec de la mise à jour de l'utilisateur",
        description:
          err.response?.data?.message ||
          err.response?.data?.errors
            .map((error: { msg: string }) => error.msg)
            .join(", ") ||
          "Une erreur s'est produite",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Credenza open={open} onOpenChange={setOpen}>
      <CredenzaTrigger>{trigger}</CredenzaTrigger>
      <CredenzaContent>
        <ScrollArea className="flex w-full max-h-[80vh]  overflow-y-auto">
          <div className="flex flex-col w-full gap-4 p-2">
            <CredenzaHeader>
              <CredenzaTitle>{t("profile.profile_dialog_title")}</CredenzaTitle>
              <CredenzaDescription>
                {t("profile.profile_dialog_description")}
              </CredenzaDescription>
            </CredenzaHeader>

            <CredenzaBody className="flex flex-col gap-4">
              {error && (
                <Alert variant="destructive">
                  <AlertTriangle className="w-5 h-5" />
                  <AlertTitle>
                    Une erreur s&apos;est produite lors de la sauvegarde
                  </AlertTitle>
                  <AlertDescription>
                    {Array.isArray(error)
                      ? error.map((e) => e.msg).join(", ")
                      : error}
                  </AlertDescription>
                </Alert>
              )}
              <div className="flex gap-2">
                <div className="flex flex-col w-1/2 gap-2">
                  <Label>{t("customers.customer_first_name")}</Label>
                  <Input
                    type="text"
                    placeholder={t("customers.customer_first_name_placeholder")}
                    value={newUser?.first_name || ""}
                    onChange={(e) =>
                      setNewUser(
                        (prev) =>
                          prev && {
                            ...prev,
                            first_name: e.target.value,
                          }
                      )
                    }
                  />
                </div>
                <div className="flex flex-col w-1/2 gap-2">
                  <Label>{t("customers.customer_last_name")}</Label>
                  <Input
                    type="text"
                    placeholder={t("customers.customer_last_name_placeholder")}
                    value={newUser?.last_name || ""}
                    onChange={(e) =>
                      setNewUser(
                        (prev) =>
                          prev && {
                            ...prev,
                            last_name: e.target.value,
                          }
                      )
                    }
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 gap-2">
                <Label htmlFor="address">{t("profile.profile_address")}</Label>
                <Input
                  type="text"
                  placeholder={t("profile.profile_address_placeholder")}
                  value={newUser?.street_address || ""}
                  onChange={(e) =>
                    setNewUser(
                      (prev) =>
                        prev && {
                          ...prev,
                          street_address: e.target.value,
                        }
                    )
                  }
                />
              </div>
              <div className="flex gap-2">
                <div className="flex flex-col w-full gap-2">
                  <Label>{t("profile.profile_city")}</Label>
                  <Input
                    type="text"
                    placeholder={t("profile.profile_city_placeholder")}
                    value={newUser?.city || ""}
                    onChange={(e) =>
                      setNewUser(
                        (prev) =>
                          prev && {
                            ...prev,
                            city: e.target.value,
                          }
                      )
                    }
                  />
                </div>
                <div className="flex flex-col w-full gap-2">
                  <Label>{t("profile.profile_state")}</Label>
                  <Input
                    type="text"
                    placeholder={t("profile.profile_state_placeholder")}
                    value={newUser?.state || ""}
                    onChange={(e) =>
                      setNewUser(
                        (prev) =>
                          prev && {
                            ...prev,
                            state: e.target.value,
                          }
                      )
                    }
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <div className="flex flex-col w-full gap-2">
                  <Label>{t("profile.profile_postal_code")}</Label>
                  <Input
                    type="text"
                    placeholder={t("profile.profile_postal_code_placeholder")}
                    value={newUser?.postal_code || ""}
                    onChange={(e) =>
                      setNewUser(
                        (prev) =>
                          prev && {
                            ...prev,
                            postal_code: e.target.value,
                          }
                      )
                    }
                  />
                </div>
                <div className="flex flex-col w-full gap-2">
                  <Label>{t("profile.profile_country")}</Label>
                  <Input
                    type="text"
                    placeholder={t("profile.profile_country_placeholder")}
                    value={newUser?.country || ""}
                    onChange={(e) =>
                      setNewUser(
                        (prev) =>
                          prev && {
                            ...prev,
                            country: e.target.value,
                          }
                      )
                    }
                  />
                </div>
              </div>
              <div className="flex flex-col w-full gap-2">
                <Label>{t("profile.profile_email")}</Label>
                <Input
                  type="email"
                  placeholder={t("profile.profile_email_placeholder")}
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
                {/* <FormPhoneInput
                  required
                  id="company.phone"
                  name="company.phone"
                  placeholder={t("customers.customer_phone_placeholder")}

                  value={newUser?.phone || ""}
                /> */}
              </div>

              <CredenzaFooter>
                <CredenzaClose asChild>
                  <Button variant="outline" onClick={() => setOpen(false)}>
                    {t("common.common_cancel")}
                  </Button>
                </CredenzaClose>
                <Button
                  disabled={
                    !newUser?.first_name ||
                    !newUser?.last_name ||
                    !newUser?.email ||
                    !newUser?.phone ||
                    loading
                  }
                  onClick={() => {
                    handleSave(newUser);
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
