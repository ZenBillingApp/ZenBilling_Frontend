import React from "react";
import { useForm } from "react-hook-form";

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
import { FormPhoneInput } from "@/components/ui/phone-input";
import { ScrollArea } from "./ui/scroll-area";
import { useToast } from "@/components/ui/use-toast";

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
    formState: { errors },
  } = useForm<Customer>({
    defaultValues: customer || undefined,
  });

  // Reset form when customer changes
  React.useEffect(() => {
    if (customer) {
      reset(customer);
    }
  }, [customer, reset, open]);

  const handleOnEdit = async (data: Customer) => {
    if (!customer?.client_id) return;

    try {
      setLoading(true);
      const response = await api.put(`/customers/${customer.client_id}`, data);
      onSave(response.data);
      toast({
        title: "Client modifié",
        description: "Le client a été modifié avec succès",
      });
      setOpen(false);
    } catch (err: any) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Credenza open={open} onOpenChange={setOpen}>
      <CredenzaTrigger>{trigger}</CredenzaTrigger>
      <CredenzaContent>
        <ScrollArea className="flex w-full max-h-[80vh] overflow-y-auto">
          <form onSubmit={handleSubmit(handleOnEdit)}>
            <div className="flex flex-col w-full gap-4">
              <CredenzaHeader>
                <CredenzaTitle>Modifier le client</CredenzaTitle>
                <CredenzaDescription>
                  Modifiez les informations du client
                </CredenzaDescription>
              </CredenzaHeader>
              <CredenzaBody className="flex flex-col space-y-4">
                <div className="flex flex-col gap-2 sm:flex-row">
                  <div className="flex flex-col gap-1 sm:w-1/2">
                    <Label htmlFor="first_name">Prénom</Label>
                    <Input
                      {...register("first_name", { required: "Prénom requis" })}
                      id="first_name"
                      type="text"
                      placeholder="Prénom"
                    />
                    <p className="text-xs text-red-500 italic">
                      {errors.first_name?.message}
                    </p>
                  </div>
                  <div className="flex flex-col w-full gap-1 sm:w-1/2">
                    <Label htmlFor="last_name">Nom</Label>
                    <Input
                      {...register("last_name", { required: "Nom requis" })}
                      id="last_name"
                      type="text"
                      placeholder="Nom"
                    />
                    <p className="text-xs text-red-500 italic">
                      {errors.last_name?.message}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-1">
                  <Label htmlFor="street_address">Adresse</Label>
                  <Input
                    {...register("street_address", {
                      required: "Adresse requise",
                    })}
                    id="street_address"
                    type="text"
                    placeholder="Adresse"
                  />
                  <p className="text-xs text-red-500 italic">
                    {errors.street_address?.message}
                  </p>
                </div>
                <div className="flex flex-col gap-1 sm:flex-row">
                  <div className="flex flex-col gap-1 sm:w-1/2">
                    <Label htmlFor="city">Ville</Label>
                    <Input
                      {...register("city", { required: "Ville requise" })}
                      id="city"
                      type="text"
                      placeholder="Ville"
                    />
                    <p className="text-xs text-red-500 italic">
                      {errors.city?.message}
                    </p>
                  </div>
                  <div className="flex flex-col gap-1 sm:w-1/2">
                    <Label htmlFor="postal_code">Code postal</Label>
                    <Input
                      {...register("postal_code", {
                        required: "Code postal requis",
                      })}
                      id="postal_code"
                      type="text"
                      placeholder="Code postal"
                    />
                    <p className="text-xs text-red-500 italic">
                      {errors.postal_code?.message}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col w-full gap-1 ">
                  <Label htmlFor="country">Pays</Label>
                  <Input
                    {...register("country", { required: "Pays requis" })}
                    id="country"
                    type="text"
                    placeholder="Pays"
                  />
                  <p className="text-xs text-red-500 italic">
                    {errors.country?.message}
                  </p>
                </div>

                <div className="flex flex-col w-full gap-1">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    {...register("email", { required: "Email requis" })}
                    id="email"
                    type="email"
                    placeholder="Email"
                  />
                  <p className="text-xs text-red-500 italic">
                    {errors.email?.message}
                  </p>
                </div>
                <div className="flex flex-col w-full gap-1">
                  <Label htmlFor="phone">Téléphone</Label>
                  <FormPhoneInput
                    name="phone"
                    control={control}
                    rules={{
                      required: "Veuillez entrer le numéro de téléphone",
                    }}
                  />
                  <p className="text-xs text-red-500 italic">
                    {errors.phone?.message}
                  </p>
                </div>
              </CredenzaBody>
              <CredenzaFooter>
                <CredenzaClose asChild>
                  <Button variant="outline" disabled={loading}>
                    Annuler
                  </Button>
                </CredenzaClose>
                <Button disabled={loading} type="submit">
                  {loading ? "Chargement..." : "Enregistrer"}
                </Button>
              </CredenzaFooter>
            </div>
          </form>
        </ScrollArea>
      </CredenzaContent>
    </Credenza>
  );
}
