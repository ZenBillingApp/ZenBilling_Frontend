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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

import { AlertTriangle } from "lucide-react";

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
  const [error, setError] = React.useState<string | [{ msg: string }] | null>(
    null
  );

  const handleOnAdd = async (data: Customer) => {
    try {
      setLoading(true);
      setError(null);
      await api.post("/customers", data);
      onSave(data);
      toast({
        title: "Client ajouté",
        description: "Le client a été ajouté avec succès",
      });
      setOpen(false);
    } catch (err: any) {
      setError(
        err.response?.data?.message || err.message || "une erreur est survenue"
      );
      toast({
        variant: "destructive",
        title: "Une erreur s'est produite",
        description: "Impossible d'ajouter le client",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!open) {
      setError(null);
      reset();
    }
  }, [open]);

  return (
    <Credenza open={open} onOpenChange={setOpen}>
      <CredenzaTrigger>{trigger}</CredenzaTrigger>
      <CredenzaContent>
        <form onSubmit={handleSubmit(handleOnAdd)}>
          <ScrollArea className="flex w-full max-h-[80vh] overflow-y-auto">
            <div className="flex flex-col w-full gap-4 p-2">
              <CredenzaHeader>
                <CredenzaTitle>{"Ajouter un client"}</CredenzaTitle>
                <CredenzaDescription>
                  {"Veuillez remplir les informations du client"}
                </CredenzaDescription>
              </CredenzaHeader>
              <CredenzaBody className="flex flex-col space-y-4">
                {error && (
                  <Alert variant="destructive">
                    <AlertTriangle className="w-5 h-5" />
                    <AlertTitle>
                      Une erreur s&apos;est produite lors de l&apos;inscription
                    </AlertTitle>
                    <AlertDescription>
                      {typeof error === "string"
                        ? error
                        : error.map((e) => e.msg)}
                    </AlertDescription>
                  </Alert>
                )}
                <div className="flex flex-col gap-2 sm:flex-row">
                  <div className="flex flex-col gap-2 sm:w-1/2">
                    <Label htmlFor="first_name">{"Prénom"}</Label>
                    <Input
                      {...register("first_name", { required: "Prénom requis" })}
                      id="first_name"
                      type="text"
                      placeholder={"Prénom"}
                    />
                    <p className="text-xs text-red-500">
                      {errors.first_name?.message}
                    </p>
                  </div>
                  <div className="flex flex-col w-full gap-2 sm:w-1/2">
                    <Label htmlFor="last_name">{"Nom"}</Label>
                    <Input
                      {...register("last_name", { required: "Nom requis" })}
                      id="last_name"
                      type="text"
                      placeholder={"Nom"}
                    />
                    <p className="text-xs text-red-500">
                      {errors.last_name?.message}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-2">
                  <Label htmlFor="address">{"Adresse"}</Label>
                  <Input
                    {...register("street_address", {
                      required: "Adresse requise",
                    })}
                    id="address"
                    type="text"
                    placeholder={"Adresse"}
                  />
                  <p className="text-xs text-red-500">
                    {errors.street_address?.message}
                  </p>
                </div>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <div className="flex flex-col gap-2 sm:w-1/2">
                    <Label htmlFor="city">{"Ville"}</Label>
                    <Input
                      {...register("city", { required: "Ville requise" })}
                      id="city"
                      type="text"
                      placeholder={"Ville"}
                    />
                    <p className="text-xs text-red-500">
                      {errors.city?.message}
                    </p>
                  </div>
                  <div className="flex flex-col gap-2 sm:w-1/2">
                    <Label htmlFor="state">{"Département/Région"}</Label>
                    <Input
                      {...register("state", {
                        required: "Département/Région requis",
                      })}
                      id="state"
                      type="text"
                      placeholder={"Département/Région"}
                    />
                    <p className="text-xs text-red-500">
                      {errors.state?.message}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <div className="flex flex-col gap-2 sm:w-1/2">
                    <Label htmlFor="postal_code">{"Code postal"}</Label>
                    <Input
                      {...register("postal_code", {
                        required: "Code postal requis",
                      })}
                      id="postal_code"
                      type="text"
                      placeholder={"Code postal"}
                    />
                    <p className="text-xs text-red-500">
                      {errors.postal_code?.message}
                    </p>
                  </div>
                  <div className="flex flex-col gap-2 sm:w-1/2">
                    <Label htmlFor="country">{"Pays"}</Label>
                    <Input
                      {...register("country", { required: "Pays requis" })}
                      id="country"
                      type="text"
                      placeholder={"Pays"}
                    />
                    <p className="text-xs text-red-500">
                      {errors.country?.message}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col w-full gap-2">
                  <Label htmlFor="email">{"Email"}</Label>
                  <Input
                    {...register("email", { required: "Email requis" })}
                    id="email"
                    type="email"
                    placeholder={"Email"}
                  />
                  <p className="text-xs text-red-500">
                    {errors.email?.message}
                  </p>
                </div>
                <div className="flex flex-col w-full gap-2">
                  <Label htmlFor="phone">{"Téléphone"}</Label>
                  <FormPhoneInput
                    control={control}
                    name="phone"
                    rules={{ required: "Téléphone requis" }}
                    placeholder={"Téléphone"}
                  />
                  <p className="text-xs text-red-500">
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
          </ScrollArea>
        </form>
      </CredenzaContent>
    </Credenza>
  );
}
