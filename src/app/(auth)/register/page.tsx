"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { setCookie } from "cookies-next";
import { useForm } from "react-hook-form";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { FormPhoneInput } from "@/components/ui/phone-input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

import { AlertTriangle } from "lucide-react";
import { ArrowRightIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import api from "@/lib/axios";

export default function SignupPage() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    control,
  } = useForm<{
    first_name: string;
    last_name: string;
    email: string;
    password: string;
    confirmPassword: string;
    company: {
      name: string;
      industry: string;
      street_address: string;
      city: string;
      state: string;
      postal_code: string;
      country: string;
      email: string;
      phone: string;
      vat_number: string;
      siret_number: string;
    };
  }>();
  const methods = useForm();

  const [loading, setLoading] = React.useState<boolean>(false);
  const [error, setError] = React.useState<string | [{ msg: string }] | null>(
    null
  );

  const onSubmit = async (data: {
    first_name: string;
    last_name: string;
    email: string;
    password: string;
    confirmPassword: string;
    company: {
      name: string;
      industry: string;
      street_address: string;
      city: string;
      state: string;
      postal_code: string;
      country: string;
      email: string;
      phone: string;
      vat_number: string;
      siret_number: string;
    };
  }) => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.post("/auth/register", data);
      setCookie("token", response.data.token, {
        maxAge: 60 * 60 * 24 * 7,
      });
      router.push("/dashboard");
    } catch (err) {
      const errorMsg =
        (err as any).response?.data?.message || "Erreur lors de l'inscription";
      setError(errorMsg);
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex w-full justify-center p-6 sm:px-6 lg:px-8">
      <div className="w-full max-w-4xl space-y-2">
        <div className="flex flex-col w-full">
          <h2 className="text-3xl font-bold">Nous rejoindre</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Déjà inscrit ?{" "}
            <Button
              variant="linkHover2"
              onClick={() => router.push("/login")}
              className={cn("text-primary", "p-0")}
            >
              Se connecter
            </Button>
          </p>
        </div>
        <form className="w-full space-y-4" onSubmit={handleSubmit(onSubmit)}>
          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="w-5 h-5" />
              <AlertTitle>
                Une erreur s'est produite lors de l'inscription
              </AlertTitle>
              <AlertDescription>
                {typeof error === "string" ? error : error.map((e) => e.msg)}
              </AlertDescription>
            </Alert>
          )}

          <div className="flex flex-col space-y-4">
            <div className="w-full space-y-4">
              <div>
                <h1 className="text-2xl">Information personnelle</h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Veuillez remplir les champs suivants pour créer votre compte
                </p>
              </div>
              <div className="space-y-4">
                <div className="flex flex-col w-full space-y-2 lg:flex-row lg:space-x-4 lg:space-y-0">
                  <div className="w-full space-y-2">
                    <Label htmlFor="first_name">Prénom</Label>
                    <Input
                      {...register("first_name", {
                        required: "Veuillez entrer votre prénom",
                      })}
                      id="first_name"
                      placeholder="Prénom"
                      type="text"
                    />
                    <p className="text-red-500 text-xs italic">
                      {errors.first_name?.message}
                    </p>
                  </div>
                  <div className="w-full space-y-2">
                    <Label htmlFor="last_name">Nom de famille</Label>
                    <Input
                      {...register("last_name", {
                        required: "Veuillez entrer votre nom de famille",
                      })}
                      id="last_name"
                      placeholder="Nom de famille"
                      type="text"
                    />
                    <p className="text-red-500 text-xs italic">
                      {errors.last_name?.message}
                    </p>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    {...register("email", {
                      required: "Veuillez entrer votre email",
                      pattern: {
                        value: /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$/,
                        message: "Veuillez entrer un email valide",
                      },
                    })}
                    id="email"
                    placeholder="Email"
                  />
                  <p className="text-red-500 text-xs italic">
                    {errors.email?.message}
                  </p>
                </div>
                <div className="flex flex-col w-full space-y-2 lg:flex-row lg:space-x-4 lg:space-y-0">
                  <div className="w-full space-y-2">
                    <Label htmlFor="password">Mot de passe</Label>
                    <PasswordInput
                      {...register("password", {
                        required: "Veuillez entrer votre mot de passe",
                      })}
                      id="password"
                      placeholder="********"
                    />
                    <p className="text-red-500 text-xs italic">
                      {errors.password?.message}
                    </p>
                  </div>
                  <div className="w-full space-y-2">
                    <Label htmlFor="confirmPassword">
                      Confirmer le mot de passe
                    </Label>
                    <PasswordInput
                      {...register("confirmPassword", {
                        required: "Veuillez confirmer votre mot de passe",
                        validate: (value) =>
                          value === watch("password") ||
                          "Les mots de passe ne correspondent pas",
                      })}
                      id="confirmPassword"
                      placeholder="********"
                    />
                    <p className="text-red-500 text-xs italic">
                      {errors.confirmPassword?.message}
                    </p>
                  </div>
                </div>
              </div>

              <div className="w-full space-y-4">
                <div>
                  <h1 className="text-2xl">Information sur l'entreprise</h1>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Veuillez remplir les champs suivants pour créer votre compte
                    entreprise
                  </p>
                </div>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="company.name">Nom de l'entreprise</Label>
                    <Input
                      {...register("company.name", {
                        required: "Veuillez entrer le nom de votre entreprise",
                      })}
                      id="company.name"
                      placeholder="Nom de l'entreprise"
                      type="text"
                    />
                    <p className="text-red-500 text-xs italic">
                      {errors.company?.name?.message}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="company.industry">Secteur d'activité</Label>
                    <Input
                      {...register("company.industry", {
                        required:
                          "Veuillez entrer le secteur d'activité de votre entreprise",
                      })}
                      id="company.industry"
                      placeholder="Secteur d'activité"
                      type="text"
                    />
                    <p className="text-red-500 text-xs italic">
                      {errors.company?.industry?.message}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="company.street_address">
                      Adresse de l'entreprise
                    </Label>
                    <Input
                      {...register("company.street_address", {
                        required:
                          "Veuillez entrer l'adresse de votre entreprise",
                      })}
                      id="company.street_address"
                      placeholder="Adresse de l'entreprise"
                      type="text"
                    />
                    <p className="text-red-500 text-xs italic">
                      {errors.company?.street_address?.message}
                    </p>
                  </div>
                  <div className="flex flex-col w-full space-y-2 lg:flex-row lg:space-x-4 lg:space-y-0">
                    <div className="w-full space-y-2">
                      <Label htmlFor="company.city">Ville</Label>
                      <Input
                        {...register("company.city", {
                          required:
                            "Veuillez entrer la ville de votre entreprise",
                        })}
                        id="company.city"
                        placeholder="Ville"
                        type="text"
                      />
                      <p className="text-red-500 text-xs italic">
                        {errors.company?.city?.message}
                      </p>
                    </div>
                    <div className="w-full space-y-2">
                      <Label htmlFor="company.state">Département/Région</Label>
                      <Input
                        {...register("company.state", {
                          required:
                            "Veuillez entrer le département/région de votre entreprise",
                        })}
                        id="company.state"
                        placeholder="Département/Région"
                        type="text"
                      />
                      <p className="text-red-500 text-xs italic">
                        {errors.company?.state?.message}
                      </p>
                    </div>
                  </div>
                  <div className="w-full space-y-2">
                    <Label htmlFor="company.postal_code">Code postal</Label>
                    <Input
                      {...register("company.postal_code", {
                        required:
                          "Veuillez entrer le code postal de votre entreprise",
                      })}
                      id="company.postal_code"
                      placeholder="Code postal"
                      type="text"
                    />
                    <p className="text-red-500 text-xs italic">
                      {errors.company?.postal_code?.message}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="company.country">Pays</Label>
                    <Input
                      {...register("company.country", {
                        required: "Veuillez entrer le pays de votre entreprise",
                      })}
                      id="company.country"
                      placeholder="Pays"
                      type="text"
                    />
                    <p className="text-red-500 text-xs italic">
                      {errors.company?.country?.message}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="company.email">Email de l'entreprise</Label>
                    <Input
                      {...register("company.email", {
                        required: "Veuillez entrer l'email de votre entreprise",
                        pattern: {
                          value: /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$/,
                          message: "Veuillez entrer un email valide",
                        },
                      })}
                      id="company.email"
                      placeholder="Email de l'entreprise"
                      type="text"
                    />
                    <p className="text-red-500 text-xs italic">
                      {errors.company?.email?.message}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="company.phone">
                      Téléphone de l'entreprise
                    </Label>
                    <FormPhoneInput
                      name="company.phone"
                      control={control}
                      rules={{
                        required: "Veuillez entrer le numéro de téléphone",
                        validate: (value) => {
                          if (!value)
                            return "Veuillez entrer le numéro de téléphone";
                          return true;
                        },
                      }}
                    />
                    <p className="text-red-500 text-xs italic">
                      {errors.company?.phone?.message}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="company.vat_number">Numéro de TVA</Label>
                    <Input
                      {...register("company.vat_number", {
                        required:
                          "Veuillez entrer le numéro de TVA de votre entreprise",
                      })}
                      id="company.vat_number"
                      placeholder="Numéro de TVA"
                      type="text"
                    />
                    <p className="text-red-500 text-xs italic">
                      {errors.company?.vat_number?.message}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="company.siret_number">
                      Numéro de SIRET
                    </Label>
                    <Input
                      {...register("company.siret_number", {
                        required:
                          "Veuillez entrer le numéro de SIRET de votre entreprise",
                      })}
                      id="company.siret_number"
                      placeholder="Numéro de SIRET"
                      type="text"
                    />
                    <p className="text-red-500 text-xs italic">
                      {errors.company?.siret_number?.message}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <Button
              variant="expandIcon"
              Icon={ArrowRightIcon}
              iconPlacement="right"
              type="submit"
              disabled={loading}
              className="w-full"
            >
              {loading ? "Chargement..." : "Créer un compte"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
