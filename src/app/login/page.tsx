"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { setCookie } from "cookies-next";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { PasswordInput } from "@/components/ui/password-input";

import { AlertTriangle } from "lucide-react";
import { ArrowRightIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import api from "@/lib/axios";

export default function Login() {
  const router = useRouter();
  const t = useTranslations();

  const [email, setEmail] = React.useState<string>("");
  const [password, setPassword] = React.useState<string>("");
  const [loading, setLoading] = React.useState<boolean>(false);
  const [error, setError] = React.useState<
    | string
    | [
        {
          msg: string;
        }
      ]
    | null
  >(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      const response = await api.post("/auth/login", {
        email,
        password,
      });
      setCookie("token", response.data.token);
      router.push("/");
    } catch (error: any) {
      setError(
        error.response.data.message ||
          error.response.data.errors ||
          "Une erreur s'est produite"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="flex h-full w-full items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-2">
          <div className="text-center">
            <h2 className="text-3xl font-bold ">
              {t.rich("login.login_title", {
                b: (chunks) => <span className="text-primary">{chunks}</span>,
              })}
            </h2>
            <p className=" text-sm text-gray-600 dark:text-gray-400">
              {t("login.login_new_here")} &nbsp;
              <Button
                variant="linkHover2"
                onClick={() => router.push("/register")}
                className={cn("text-primary", "p-0 ")}
              >
                {t("login.login_create_account")}
              </Button>
            </p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertTriangle className="w-5 h-5" />
                <AlertTitle>{t("login.login_error")}</AlertTitle>
                <AlertDescription>
                  {Array.isArray(error) ? (
                    error.map((e) => <p key={e.msg}>{e.msg}</p>)
                  ) : (
                    <p>{error}</p>
                  )}
                </AlertDescription>
              </Alert>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">{t("login.email")}</Label>
              <Input
                id="email"
                placeholder="name@example.com"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">{t("login.password")}</Label>
              </div>
              <PasswordInput
                id="password"
                placeholder="********"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <Button
              variant="expandIcon"
              Icon={ArrowRightIcon}
              iconPlacement="right"
              type="submit"
              disabled={loading}
              className="w-full"
            >
              {loading
                ? t("login.login_button_loading")
                : t("login.login_button")}
            </Button>
          </form>
        </div>
      </div>
    </>
  );
}
