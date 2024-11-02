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
import { useToast } from "./ui/use-toast";
import { FormPhoneInput } from "./ui/phone-input";

import api from "@/lib/axios";

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

  useEffect(() => {
    if (!open) {
      reset();
    }
  }, [open]);

  const handleSave = async (data: Company) => {
    try {
      setLoading(true);
      const response = await api.put(`/company`, data);
      onSave(data);
      toast({
        title: "Entreprise mise à jour",
        description:
          "Les informations de votre entreprise ont été mises à jour avec succès.",
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
        <form onSubmit={handleSubmit(handleSave)}>
          <ScrollArea className="flex w-full max-h-[80vh] overflow-y-auto">
            <div className="flex flex-col w-full gap-4 ">
              <CredenzaHeader>
                <CredenzaTitle>
                  Modifier les informations de contact de votre entreprise
                </CredenzaTitle>
                <CredenzaDescription>
                  Ces informations seront utilisées pour vous contacter
                </CredenzaDescription>
              </CredenzaHeader>
              <CredenzaBody className="flex flex-col gap-2">
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
