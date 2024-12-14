import React from "react";
import { useForm } from "react-hook-form";
import { Customer } from "@/types/Customer";

import { useToast } from "./ui/use-toast";
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
import { FormPhoneInput } from "@/components/ui/phone-input";
import { ScrollArea } from "./ui/scroll-area";
import { Separator } from "@/components/ui/separator";

import {
  BuildingIcon,
  Loader2Icon,
  XCircleIcon,
  User2Icon,
  MapPinIcon,
  PhoneIcon,
  MailIcon,
  Building2Icon,
  SaveIcon,
} from "lucide-react";

import api from "@/lib/axios";

type Props = {
  trigger: React.ReactNode;
  customer: Customer | null;
  onSave: (updatedCustomer: Customer) => void;
};

export default function EditCustomerDialog({
  trigger,
  customer,
  onSave,
}: Props) {
  const { toast } = useToast();
  const [open, setOpen] = React.useState<boolean>(false);
  const [loading, setLoading] = React.useState<boolean>(false);

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    formState: { errors, isDirty },
  } = useForm<Customer>({
    defaultValues: {
      ...customer,
      email: customer?.email || undefined,
      phone: customer?.phone || undefined,
    },
  });

  const customerType = watch("type");
  const isCompany = customerType === "company";

  React.useEffect(() => {
    if (!open) {
      if (customer) {
        reset({
          ...customer,
          email: customer.email || undefined,
          phone: customer.phone || undefined,
        });
      }
    }
  }, [customer, reset, open]);

  const handleOnEdit = async (data: Customer) => {
    if (!customer?.client_id) return;

    try {
      setLoading(true);
      const formData = Object.entries(data).reduce((acc, [key, value]) => {
        if (value !== "" && value !== null && value !== undefined) {
          acc[key as keyof Customer] = value;
        }
        return acc;
      }, {} as Partial<Customer>);

      const response = await api.put(
        `/customers/${customer.client_id}`,
        formData
      );
      onSave(response.data);
      toast({
        title: "Client modifié",
        description: "Le client a été modifié avec succès",
      });
      setOpen(false);
    } catch (error) {
      console.error("Erreur lors de la modification:", error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description:
          "Une erreur est survenue lors de la modification du client",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Credenza open={open} onOpenChange={setOpen}>
      <CredenzaTrigger>{trigger}</CredenzaTrigger>
      <CredenzaContent className="max-w-3xl">
        <ScrollArea className="flex w-full max-h-[80vh] overflow-y-auto">
          <form onSubmit={handleSubmit(handleOnEdit)}>
            <div className="flex flex-col w-full p-6 gap-6">
              <CredenzaHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-primary/10">
                    {isCompany ? (
                      <Building2Icon className="w-6 h-6 text-primary" />
                    ) : (
                      <User2Icon className="w-6 h-6 text-primary" />
                    )}
                  </div>
                  <div className="flex flex-col gap-1">
                    <CredenzaTitle>Modifier le client</CredenzaTitle>
                    <CredenzaDescription>
                      {isCompany
                        ? customer?.name
                        : `${customer?.first_name} ${customer?.last_name}`}
                    </CredenzaDescription>
                  </div>
                </div>
              </CredenzaHeader>

              <Separator />

              <CredenzaBody className="flex flex-col space-y-6 p-0">
                <div className="space-y-6">
                  <div className="flex items-center gap-2">
                    <User2Icon className="w-4 h-4 text-muted-foreground" />
                    <h3 className="font-medium">Informations principales</h3>
                  </div>

                  {isCompany ? (
                    <div className="grid gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Nom de l&apos;entreprise</Label>
                        <Input
                          {...register("name", {
                            required: "Nom de l'entreprise requis",
                          })}
                          placeholder="Nom de l'entreprise"
                        />
                        {errors.name?.message && (
                          <p className="text-xs text-destructive">
                            {errors.name.message}
                          </p>
                        )}
                      </div>

                      <div className="grid gap-4 sm:grid-cols-3">
                        <div className="space-y-2">
                          <Label htmlFor="siret_number">SIRET</Label>
                          <Input
                            {...register("siret_number")}
                            placeholder="123 456 789 00012"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="siren_number">SIREN</Label>
                          <Input
                            {...register("siren_number")}
                            placeholder="123 456 789"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="vat_number">N° TVA</Label>
                          <Input
                            {...register("vat_number")}
                            placeholder="FR 12 123456789"
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="first_name">Prénom</Label>
                        <Input
                          {...register("first_name", {
                            required: "Prénom requis",
                          })}
                          placeholder="Prénom"
                        />
                        {errors.first_name?.message && (
                          <p className="text-xs text-destructive">
                            {errors.first_name.message}
                          </p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="last_name">Nom</Label>
                        <Input
                          {...register("last_name", { required: "Nom requis" })}
                          placeholder="Nom"
                        />
                        {errors.last_name?.message && (
                          <p className="text-xs text-destructive">
                            {errors.last_name.message}
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-6">
                  <div className="flex items-center gap-2">
                    <MapPinIcon className="w-4 h-4 text-muted-foreground" />
                    <h3 className="font-medium">Adresse</h3>
                  </div>

                  <div className="grid gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="street_address">Rue</Label>
                      <Input
                        {...register("street_address")}
                        placeholder="Numéro et nom de rue"
                      />
                      {errors.street_address?.message && (
                        <p className="text-xs text-destructive">
                          {errors.street_address.message}
                        </p>
                      )}
                    </div>

                    <div className="grid gap-4 sm:grid-cols-3">
                      <div className="space-y-2">
                        <Label htmlFor="postal_code">Code postal</Label>
                        <Input
                          {...register("postal_code")}
                          placeholder="75001"
                        />
                        {errors.postal_code?.message && (
                          <p className="text-xs text-destructive">
                            {errors.postal_code.message}
                          </p>
                        )}
                      </div>
                      <div className="space-y-2 sm:col-span-2">
                        <Label htmlFor="city">Ville</Label>
                        <Input {...register("city")} placeholder="Paris" />
                        {errors.city?.message && (
                          <p className="text-xs text-destructive">
                            {errors.city.message}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="country">Pays</Label>
                      <Input {...register("country")} defaultValue="France" />
                      {errors.country?.message && (
                        <p className="text-xs text-destructive">
                          {errors.country.message}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="flex items-center gap-2">
                    <PhoneIcon className="w-4 h-4 text-muted-foreground" />
                    <h3 className="font-medium">Contact</h3>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="email">
                        <div className="flex items-center gap-2">
                          <MailIcon className="w-4 h-4" />
                          <span>Email</span>
                        </div>
                      </Label>
                      <Input
                        {...register("email")}
                        type="email"
                        placeholder="email@exemple.fr"
                      />
                      {errors.email?.message && (
                        <p className="text-xs text-destructive">
                          {errors.email.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">
                        <div className="flex items-center gap-2">
                          <PhoneIcon className="w-4 h-4" />
                          <span>Téléphone</span>
                        </div>
                      </Label>
                      <FormPhoneInput
                        control={control}
                        name="phone"
                        placeholder="06 12 34 56 78"
                      />
                      {errors.phone?.message && (
                        <p className="text-xs text-destructive">
                          {errors.phone.message}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </CredenzaBody>

              <Separator />

              <CredenzaFooter>
                <CredenzaClose asChild>
                  <Button
                    variant="outline"
                    disabled={loading}
                    className="gap-2"
                  >
                    <XCircleIcon className="w-4 h-4" />
                    Annuler
                  </Button>
                </CredenzaClose>
                <Button
                  type="submit"
                  disabled={loading || !isDirty}
                  className="gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2Icon className="w-4 h-4 animate-spin" />
                      Modification en cours...
                    </>
                  ) : (
                    <>
                      <SaveIcon className="w-4 h-4" />
                      Enregistrer les modifications
                    </>
                  )}
                </Button>
              </CredenzaFooter>
            </div>
          </form>
        </ScrollArea>
      </CredenzaContent>
    </Credenza>
  );
}
