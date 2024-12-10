"use client";
import React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { User } from "@/types/User";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ContentLayout } from "@/components/admin-panel/content-layout";
import ErrorScreen from "@/components/error-screen";

import { ClipLoader } from "react-spinners";

import api from "@/lib/axios";
import { cn } from "@/lib/utils";

type Props = {};

const schema = z.object({
  old_password: z
    .string()
    .min(8, "Le mot de passe doit contenir au moins 8 caractères"),
  new_password: z
    .string()
    .min(8, "Le mot de passe doit contenir au moins 8 caractères"),
  password_confirmation: z
    .string()
    .min(8, "Le mot de passe doit contenir au moins 8 caractères"),
});

export default function Page({}: Props) {
  const [user, setUser] = React.useState<User>({} as User);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [error, setError] = React.useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      old_password: "",
      new_password: "",
      password_confirmation: "",
    },
    resolver: zodResolver(schema),
  });

  const fetchChangePassword = async (data: any) => {
    try {
      await schema.parseAsync(data);
      await api.post("/user/password-update", data);
      fetchUserData();
      console.log("Password changed");
    } catch (err: any) {
      console.log(err);
    }
  };

  const fetchUserData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get(`/user`);
      setUser(response.data);
    } catch (err: any) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchUserData();
  }, []);

  return (
    <>
      <ContentLayout title="Mon Compte">
        <div className="flex flex-col w-full gap-6">
          {loading ? (
            <div className="flex w-full h-screen items-center justify-center">
              <ClipLoader color={cn("text-primary")} />
            </div>
          ) : error ? (
            <div className="flex w-full h-screen items-center justify-center">
              <ErrorScreen handleRetry={() => fetchUserData()} />
            </div>
          ) : (
            <>
              <div className="flex">
                <div className="flex justify-center items-center p-2 rounded-full bg-primary w-16 h-16">
                  <span className="text-2xl font-bold text-white">
                    {user.first_name.charAt(0).toUpperCase() +
                      user.last_name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex flex-col ml-4 justify-center">
                  <h1 className="text-xl font-semibold">
                    {user.first_name} {user.last_name}
                  </h1>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {user.email}
                  </p>
                </div>
              </div>
              <Card>
                <CardHeader>
                  <CardTitle>Informations</CardTitle>
                  <CardDescription>
                    Informations de votre compte
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm ">Nom</span>
                      <span className="text-sm font-semibold">
                        {user.first_name}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm ">Prénom</span>
                      <span className="text-sm font-semibold">
                        {user.last_name}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm ">Email</span>
                      <span className="text-sm font-semibold">
                        {user.email}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <div className="flex flex-col gap-4 max-w-md">
                <div className="flex flex-col">
                  <h3 className="text-2xl font-bold">Mots de passe</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Modifier votre mot de passe
                  </p>
                </div>
                <form
                  onSubmit={handleSubmit(fetchChangePassword)}
                  className="flex flex-col gap-4"
                >
                  <div className="flex flex-col gap-2">
                    <Label>Ancien mot de passe</Label>
                    <PasswordInput
                      placeholder="Ancien mot de passe"
                      {...register("old_password", { required: true })}
                    />
                    {errors.old_password && (
                      <span className="text-red-500 text-xs italic">
                        {errors.old_password.message}
                      </span>
                    )}
                  </div>

                  <div className="flex flex-col gap-2">
                    <Label>Nouveau mot de passe</Label>
                    <PasswordInput
                      placeholder="Nouveau mot de passe"
                      {...register("new_password", { required: true })}
                    />
                    {errors.new_password && (
                      <span className="text-red-500 text-xs italic">
                        {errors.new_password.message}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label>Confirmation du mot de passe</Label>
                    <PasswordInput
                      placeholder="Confirmation du mot de passe"
                      {...register("password_confirmation", { required: true })}
                    />
                    {errors.password_confirmation && (
                      <span className="text-red-500 text-xs italic">
                        {errors.password_confirmation.message}
                      </span>
                    )}
                  </div>
                  <Button type="submit">Changer le mot de passe</Button>
                </form>
              </div>
            </>
          )}
        </div>
      </ContentLayout>
    </>
  );
}
