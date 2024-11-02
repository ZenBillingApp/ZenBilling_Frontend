"use client";
import React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { setCookie } from "cookies-next";
import { useForm } from "react-hook-form";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PasswordInput } from "@/components/ui/password-input";

import { ArrowRightIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import api from "@/lib/axios";

export default function Login() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<{ email: string; password: string }>();

  const [loading, setLoading] = React.useState(false);

  const onSubmit = async (data: { email: string; password: string }) => {
    try {
      setLoading(true);
      const response = await api.post("/auth/login", data);
      setCookie("token", response.data.token, {
        maxAge: 60 * 60 * 24 * 7,
      });
      router.push(searchParams.get("callbackUrl") || "/dashboard");
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-full w-full items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-2">
        <div className="flex flex-col w-full ">
          <h2 className="text-3xl font-bold">Se connecter</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Pas de compte ?{" "}
            <Button
              variant="linkHover2"
              onClick={() => router.push("/register")}
              className={cn("text-primary", "p-0")}
            >
              Créer un compte
            </Button>
          </p>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
              placeholder="exemple@exemple.com"
            />
            <p className="text-red-500 text-xs italic">
              {errors.email?.message}
            </p>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Mot de passe</Label>
            </div>
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
          <Button
            variant="expandIcon"
            Icon={ArrowRightIcon}
            iconPlacement="right"
            type="submit"
            disabled={loading}
            className="w-full"
          >
            {loading ? "Chargement..." : "Se connecter"}
          </Button>
        </form>
      </div>
    </div>
  );
}
