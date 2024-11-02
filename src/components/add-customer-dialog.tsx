import React, { useEffect } from "react";
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

import api from "@/lib/axios";

type Props = {
  trigger: React.ReactNode;
  onSave: (newCustomer: Customer) => void;
};

export default function AddCustomerDialog({ trigger, onSave }: Props) {
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<Customer>();

  const [open, setOpen] = React.useState<boolean>(false);
  const [loading, setLoading] = React.useState<boolean>(false);

  const handleOnAdd = async (data: Customer) => {
    try {
      setLoading(true);
      await api.post("/customers", data);
      onSave(data);
      toast({
        title: "Client ajouté",
        description: "Le client a été ajouté avec succès",
      });
      setOpen(false);
    } catch (err: any) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!open) {
      reset();
    }
  }, [open]);

  return (
    <Credenza open={open} onOpenChange={setOpen}>
      <CredenzaTrigger>{trigger}</CredenzaTrigger>
      <CredenzaContent>
        <ScrollArea className="w-full max-h-[80vh]">
          <form onSubmit={handleSubmit(handleOnAdd)}>
            <div className="flex flex-col w-full gap-4 p-2">
              <CredenzaHeader>
                <CredenzaTitle>{"Ajouter un client"}</CredenzaTitle>
                <CredenzaDescription>
                  {"Veuillez remplir les informations du client"}
                </CredenzaDescription>
              </CredenzaHeader>
              <CredenzaBody className="flex flex-col space-y-4">
                <div className="flex flex-col gap-2 sm:flex-row">
                  <div className="flex flex-col gap-1 sm:w-1/2">
                    <Label htmlFor="first_name">{"Prénom"}</Label>
                    <Input
                      {...register("first_name", { required: "Prénom requis" })}
                      id="first_name"
                      type="text"
                      placeholder={"Prénom"}
                    />
                    <p className="text-xs text-red-500 italic">
                      {errors.first_name?.message}
                    </p>
                  </div>
                  <div className="flex flex-col w-full gap-1 sm:w-1/2">
                    <Label htmlFor="last_name">{"Nom"}</Label>
                    <Input
                      {...register("last_name", { required: "Nom requis" })}
                      id="last_name"
                      type="text"
                      placeholder={"Nom"}
                    />
                    <p className="text-xs text-red-500 italic">
                      {errors.last_name?.message}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-1">
                  <Label htmlFor="address">{"Adresse"}</Label>
                  <Input
                    {...register("street_address", {
                      required: "Adresse requise",
                    })}
                    id="address"
                    type="text"
                    placeholder={"Adresse"}
                  />
                  <p className="text-xs text-red-500 italic">
                    {errors.street_address?.message}
                  </p>
                </div>
                <div className="flex flex-col gap-1 sm:flex-row">
                  <div className="flex flex-col gap-2 sm:w-1/2">
                    <Label htmlFor="city">{"Ville"}</Label>
                    <Input
                      {...register("city", { required: "Ville requise" })}
                      id="city"
                      type="text"
                      placeholder={"Ville"}
                    />
                    <p className="text-xs text-red-500 italic">
                      {errors.city?.message}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col gap-1 sm:flex-row">
                  <div className="flex flex-col gap-1 sm:w-1/2">
                    <Label htmlFor="postal_code">{"Code postal"}</Label>
                    <Input
                      {...register("postal_code", {
                        required: "Code postal requis",
                      })}
                      id="postal_code"
                      type="text"
                      placeholder={"Code postal"}
                    />
                    <p className="text-xs text-red-500 italic">
                      {errors.postal_code?.message}
                    </p>
                  </div>
                  <div className="flex flex-col gap-1 sm:w-1/2">
                    <Label htmlFor="country">{"Pays"}</Label>
                    <Input
                      {...register("country", { required: "Pays requis" })}
                      id="country"
                      type="text"
                      placeholder={"Pays"}
                    />
                    <p className="text-xs text-red-500 italic">
                      {errors.country?.message}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col w-full gap-1">
                  <Label htmlFor="email">{"Email"}</Label>
                  <Input
                    {...register("email", { required: "Email requis" })}
                    id="email"
                    type="email"
                    placeholder={"Email"}
                  />
                  <p className="text-xs text-red-500 italic">
                    {errors.email?.message}
                  </p>
                </div>
                <div className="flex flex-col w-full gap-1">
                  <Label htmlFor="phone">{"Téléphone"}</Label>
                  <FormPhoneInput
                    control={control}
                    name="phone"
                    rules={{ required: "Téléphone requis" }}
                    placeholder={"Téléphone"}
                  />
                  <p className="text-xs text-red-500 italic">
                    {errors.phone?.message}
                  </p>
                </div>
              </CredenzaBody>
              <CredenzaFooter>
                <CredenzaClose asChild>
                  <Button variant="outline" disabled={loading}>
                    {"Annuler"}
                  </Button>
                </CredenzaClose>
                <Button type="submit" disabled={loading}>
                  {loading ? "Ajout en cours..." : "Ajouter le client"}
                </Button>
              </CredenzaFooter>
            </div>
          </form>
        </ScrollArea>
      </CredenzaContent>
    </Credenza>
  );
}
