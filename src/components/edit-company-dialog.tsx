import React, { useEffect } from "react";
import { useForm } from "react-hook-form";

import { Company } from "@/types/Company";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { ScrollArea } from "@/components/ui/scroll-area";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "./ui/use-toast";

import { AlertTriangle } from "lucide-react";

import api from "@/lib/axios";
import { FormPhoneInput } from "./ui/phone-input";

type Props = {
  company: Company | null;
  trigger: React.ReactNode;
  onSave: (updatedCompany: Company) => void;
};

const EditCompanyDialog: React.FC<Props> = ({ company, onSave, trigger }) => {
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
    reset,
  } = useForm<Company>({
    defaultValues: company || undefined,
  });

  const [loading, setLoading] = React.useState<boolean>(false);
  const [open, setOpen] = React.useState<boolean>(false);
  const [error, setError] = React.useState<string | [{ msg: string }] | null>(
    null
  );

  useEffect(() => {
    if (!open) {
      reset();
      setError(null);
    }
  }, [open]);

  const handleSave = async (data: Company) => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.put(`/company`, data);
      onSave(data);
      toast({
        title: "Entreprise mise à jour",
        description:
          "Les informations de votre entreprise ont été mises à jour avec succès.",
      });
      setOpen(false);
    } catch (err: any) {
      setError(err.response?.data.message);
      toast({
        variant: "destructive",
        title: "Erreur lors de la sauvegarde",
        description:
          "Impossible de mettre à jour les informations de l'entreprise.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Credenza open={open} onOpenChange={setOpen}>
      <CredenzaTrigger>{trigger}</CredenzaTrigger>
      <CredenzaContent>
        <form onSubmit={handleSubmit(handleSave)}>
          <ScrollArea className="flex w-full max-h-[80vh] overflow-y-auto">
            <div className="flex flex-col w-full gap-4 p-2">
              <CredenzaHeader>
                <CredenzaTitle>
                  Modifier les informations de votre entreprise
                </CredenzaTitle>
              </CredenzaHeader>
              <CredenzaDescription>
                <p>
                  Les informations de votre entreprise sont utilisées pour
                  générer des documents tels que les factures et les devis.
                </p>
              </CredenzaDescription>

              <CredenzaBody className="flex flex-col gap-2">
                {error && (
                  <Alert variant="destructive">
                    <AlertTriangle className="w-5 h-5" />
                    <AlertTitle>
                      Une erreur s&apos;est produite lors de la sauvegarde
                    </AlertTitle>
                    <AlertDescription>
                      {typeof error === "string"
                        ? error
                        : error.map((e) => e.msg)}
                    </AlertDescription>
                  </Alert>
                )}

                <div className="flex flex-col w-full gap-2">
                  <Label>Nom de l&apos;entreprise</Label>
                  <Input
                    {...register("name", {
                      required: "Veuillez entrer un nom",
                    })}
                    type="text"
                  />
                  <p className="text-sm text-red-500 italic">
                    {errors.name?.message}
                  </p>
                </div>
                <div className="flex flex-col w-full gap-2">
                  <Label>Secteur d&apos;activité</Label>
                  <Input
                    {...register("industry", {
                      required: "Veuillez entrer un secteur d'activité",
                    })}
                    type="text"
                  />
                  <p className="text-sm text-red-500 italic">
                    {errors.industry?.message}
                  </p>
                </div>
                <div className="flex flex-col w-full gap-2">
                  <Label>Adresse</Label>
                  <Input
                    type="text"
                    {...register("street_address", {
                      required: "Veuillez entrer une adresse",
                    })}
                  />
                  <p className="text-sm text-red-500 italic">
                    {errors.street_address?.message}
                  </p>
                </div>
                <div className="flex gap-2">
                  <div className="flex flex-col w-1/2 gap-2">
                    <Label>Ville</Label>
                    <Input
                      type="text"
                      {...register("city", {
                        required: "Veuillez entrer une ville",
                      })}
                    />
                    <p className="text-sm text-red-500 italic">
                      {errors.city?.message}
                    </p>
                  </div>
                  <div className="flex flex-col w-1/2 gap-2">
                    <Label>Département/Région</Label>
                    <Input
                      type="text"
                      {...register("state", {
                        required:
                          "Veuillez entrer un département ou une région",
                      })}
                    />
                    <p className="text-sm text-red-500 italic">
                      {errors.state?.message}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <div className="flex flex-col w-1/2 gap-2">
                    <Label>Code postal</Label>
                    <Input
                      type="text"
                      {...register("postal_code", {
                        required: "Veuillez entrer un code postal",
                      })}
                    />
                    <p className="text-sm text-red-500 italic">
                      {errors.postal_code?.message}
                    </p>
                  </div>
                  <div className="flex flex-col w-1/2 gap-2">
                    <Label>Pays</Label>
                    <Input
                      type="text"
                      {...register("country", {
                        required: "Veuillez entrer un pays",
                      })}
                    />
                    <p className="text-sm text-red-500 italic">
                      {errors.country?.message}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col w-full gap-2">
                  <Label>Email</Label>
                  <Input
                    type="email"
                    {...register("email", {
                      required: "Veuillez entrer un email",
                    })}
                  />
                  <p className="text-sm text-red-500 italic">
                    {errors.email?.message}
                  </p>
                </div>
                <div className="flex flex-col w-full gap-2">
                  <Label>Téléphone</Label>
                  <FormPhoneInput
                    control={control}
                    name="phone"
                    rules={{
                      required: "Veuillez entrer un numéro de téléphone",
                    }}
                  />
                  <p className="text-sm text-red-500 italic">
                    {errors.phone?.message}
                  </p>
                </div>
                <div className="flex flex-col w-full gap-2">
                  <div className="flex flex-col gap-2">
                    <Label>Numéro de TVA</Label>
                    <Input
                      type="text"
                      {...register("vat_number", {
                        required: "Veuillez entrer un numéro de TVA",
                      })}
                    />
                    <p className="text-sm text-red-500 italic">
                      {errors.vat_number?.message}
                    </p>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label>Numéro SIRET</Label>
                    <Input
                      type="text"
                      {...register("siret_number", {
                        required: "Veuillez entrer un numéro de SIRET",
                      })}
                    />
                    <p className="text-sm text-red-500 italic">
                      {errors.siret_number?.message}
                    </p>
                  </div>
                </div>
              </CredenzaBody>
              <CredenzaFooter>
                <Button disabled={loading} type="submit">
                  {loading ? "Enregistrement..." : "Enregistrer"}
                </Button>
                <CredenzaClose asChild>
                  <Button variant="outline" onClick={() => setOpen(false)}>
                    Annuler
                  </Button>
                </CredenzaClose>
              </CredenzaFooter>
            </div>
          </ScrollArea>
        </form>
      </CredenzaContent>
    </Credenza>
  );
};

export default EditCompanyDialog;
