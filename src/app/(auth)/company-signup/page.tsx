"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { useTranslations } from "next-intl";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { FormPhoneInput } from "@/components/ui/phone-input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/components/ui/use-toast";

import { AlertTriangle, ArrowRightIcon } from "lucide-react";

import api from "@/lib/axios";

interface CompanyFormData {
  name: string;
  street_address: string;
  city: string;
  postal_code: string;
  country: string;
  email: string;
  phone: string;
  vat_number: string;
  siret_number: string;
  siren_number: string;
  category: string;
}

export default function CompanySignupPage() {
  const router = useRouter();
  const t = useTranslations();
  const { toast } = useToast();

  const [isLoading, setIsLoading] = React.useState(false);
  const [apiError, setApiError] = React.useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors },
    getValues,
  } = useForm<CompanyFormData>({
    defaultValues: {
      name: "",
      street_address: "",
      city: "",
      postal_code: "",
      country: "",
      email: "",
      phone: "",
      vat_number: "",
      siret_number: "",
      siren_number: "",
      category: "",
    },
  });

  const searchCompany = async () => {
    const siretNumber = getValues("siret_number");

    if (!siretNumber || siretNumber.length !== 14) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Le numéro SIRET doit contenir 14 chiffres",
      });
      return;
    }

    try {
      setIsLoading(true);
      setApiError(null);

      const response = await api.get(`/company/${siretNumber}`);
      const companyData = response.data;

      // Pré-remplir le formulaire avec les données de l'entreprise
      setValue("name", companyData.etablissement.unite_legale.denomination);
      setValue(
        "street_address",
        (companyData?.etablissement?.numero_voie !== null
          ? companyData?.etablissement?.numero_voie + " "
          : "") +
          (companyData?.etablissement?.type_voie !== null
            ? companyData?.etablissement?.type_voie + " "
            : "") +
          (companyData?.etablissement?.libelle_voie !== null &&
            companyData?.etablissement?.libelle_voie)
      );
      setValue("city", companyData.etablissement.libelle_commune);
      setValue("postal_code", companyData.etablissement.code_postal);
      setValue("country", companyData.etablissement.country || "France");
      setValue("siren_number", companyData.etablissement.siren);
      setValue(
        "category",
        companyData.etablissement.unite_legale.categorie_entreprise
      );

      toast({
        title: "Entreprise trouvée",
        description: "Les informations ont été pré-remplies",
      });
    } catch (error: any) {
      setApiError(
        error?.response?.data?.message || "Erreur lors de la recherche"
      );
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de trouver l'entreprise",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data: CompanyFormData) => {
    try {
      setIsLoading(true);
      setApiError(null);

      await api.post("/company", data);

      toast({
        title: "Succès",
        description: "Votre entreprise a été enregistrée",
      });

      router.push("/dashboard");
    } catch (error: any) {
      setApiError(
        error?.response?.data?.message || "Erreur lors de l'inscription"
      );
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de créer l'entreprise",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container max-w-4xl py-8">
      <div className="space-y-6">
        {apiError && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Erreur</AlertTitle>
            <AlertDescription>
              {t(`errors.${apiError}`) || apiError}
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-2">
          <h1 className="text-2xl font-bold">
            Information de l&apos;entreprise
          </h1>
          <p className="text-muted-foreground">
            Veuillez entrer le numéro de SIRET de votre entreprise pour
            continuer
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Section SIRET */}
          <div className="space-y-2">
            <Label htmlFor="siret_number">Numéro de SIRET</Label>
            <div className="flex space-x-2">
              <Input
                {...register("siret_number", {
                  required: "Le numéro SIRET est requis",
                  pattern: {
                    value: /^[0-9]{14}$/,
                    message: "Le numéro SIRET doit contenir 14 chiffres",
                  },
                })}
                placeholder="12345678901234"
                className="flex-1"
              />
              <Button
                type="button"
                onClick={searchCompany}
                disabled={isLoading}
              >
                Rechercher
              </Button>
            </div>
            {errors.siret_number && (
              <p className="text-sm text-red-500">
                {errors.siret_number.message}
              </p>
            )}
          </div>

          {/* Informations de l'entreprise */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {/* Nom de l'entreprise */}
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="name">Nom de l&apos;entreprise</Label>
              <Input
                {...register("name", {
                  required: "Le nom de l'entreprise est requis",
                })}
                placeholder="Nom de l'entreprise"
              />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name.message}</p>
              )}
            </div>

            {/* Adresse */}
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="street_address">Adresse</Label>
              <Input
                {...register("street_address", {
                  required: "L'adresse est requise",
                })}
                placeholder="Adresse"
              />
              {errors.street_address && (
                <p className="text-sm text-red-500">
                  {errors.street_address.message}
                </p>
              )}
            </div>

            {/* Ville */}
            <div className="space-y-2">
              <Label htmlFor="city">Ville</Label>
              <Input
                {...register("city", {
                  required: "La ville est requise",
                })}
                placeholder="Ville"
              />
              {errors.city && (
                <p className="text-sm text-red-500">{errors.city.message}</p>
              )}
            </div>

            {/* Code postal et Pays */}
            <div className="space-y-2">
              <Label htmlFor="postal_code">Code postal</Label>
              <Input
                {...register("postal_code", {
                  required: "Le code postal est requis",
                })}
                placeholder="Code postal"
              />
              {errors.postal_code && (
                <p className="text-sm text-red-500">
                  {errors.postal_code.message}
                </p>
              )}
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="country">Pays</Label>
              <Input
                {...register("country", {
                  required: "Le pays est requis",
                })}
                placeholder="Pays"
                defaultValue="France"
              />
              {errors.country && (
                <p className="text-sm text-red-500">{errors.country.message}</p>
              )}
            </div>

            {/* Email */}
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="email">Email</Label>
              <Input
                {...register("email", {
                  required: "L'email est requis",
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "Email invalide",
                  },
                })}
                placeholder="Email"
                type="email"
              />
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email.message}</p>
              )}
            </div>

            {/* Téléphone */}
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="phone">Téléphone</Label>
              <Controller
                name="phone"
                control={control}
                rules={{ required: "Le numéro de téléphone est requis" }}
                render={({ field }) => (
                  <FormPhoneInput control={control} name="phone" />
                )}
              />
              {errors.phone && (
                <p className="text-sm text-red-500">{errors.phone.message}</p>
              )}
            </div>

            {/* TVA */}
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="vat_number">Numéro de TVA</Label>
              <Input
                {...register("vat_number", {
                  required: "Le numéro de TVA est requis",
                })}
                placeholder="Numéro de TVA"
              />
              {errors.vat_number && (
                <p className="text-sm text-red-500">
                  {errors.vat_number.message}
                </p>
              )}
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Chargement..." : "Créer l'entreprise"}
            <ArrowRightIcon className="ml-2 h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}
