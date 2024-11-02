"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { setCookie } from "cookies-next";
import { useForm } from "react-hook-form";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Button } from "@/components/ui/button";

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
  } = useForm<{
    first_name: string;
    last_name: string;
    email: string;
    password: string;
    confirmPassword: string;
  }>();

  const [loading, setLoading] = React.useState<boolean>(false);

  const onSubmit = async (data: {
    first_name: string;
    last_name: string;
    email: string;
    password: string;
    confirmPassword: string;
  }) => {
    try {
      setLoading(true);
      const response = await api.post("/auth/register", data);
      setCookie("token", response.data.token, {
        maxAge: 60 * 60 * 24 * 7,
      });
      router.push("/company-signup");
    } catch (err) {
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
            </div>
            <Button
              variant="expandIcon"
              Icon={ArrowRightIcon}
              iconPlacement="right"
              type="submit"
              disabled={loading}
              className="w-full"
            >
              {loading ? "Chargement..." : "Continuer"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
