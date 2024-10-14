"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

import { ArrowRightIcon } from "lucide-react";

import { User } from "@/types/User";

import { useToast } from "@/components/ui/use-toast";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { PhoneInput } from "@/components/ui/phone-input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";
import { setCookie } from "cookies-next";

import { cn } from "@/lib/utils";

import api from "@/lib/axios";

export default function SignupPage() {
  const router = useRouter();
  const [confirmPassword, setConfirmPassword] = React.useState<string>("");
  const t = useTranslations();

  const [user, setUser] = React.useState<User>({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    phone: "",
    street_address: "",
    city: "",
    state: "",
    postal_code: "",
    country: "",
    company: {
      name: "",
      industry: "",
      street_address: "",
      city: "",
      state: "",
      postal_code: "",
      country: "",
      email: "",
      phone: "",
      vat_number: "",
      siret_number: "",
    },
  });

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

  const { toast } = useToast();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name.startsWith("company.")) {
      setUser((prevUser) => ({
        ...prevUser,
        company: {
          ...prevUser.company,
          [name.replace("company.", "")]: value,
        },
      }));
    } else {
      setUser((prevUser) => ({
        ...prevUser,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (user.password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await api.post("/auth/register", user);
      setCookie("token", response.data.token, {
        maxAge: 30 * 24 * 60 * 60,
      });
      toast({
        title: "Inscription réussie",
        description: "Inscription réussie avec succès",
      });
      router.push("/dashboard");
    } catch (err: any) {
      setError(
        err.response.data.message ||
          err.response.data.errors ||
          "Une erreur s'est produite"
      );
      toast({
        variant: "destructive",
        title: "Une erreur s'est produite",
        description: Array.isArray(error) ? error.map((e) => e.msg) : error,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex w-full justify-center p-6 sm:px-6 lg:px-8">
      <div className="w-full max-w-4xl space-y-2">
        <div className="text-center">
          <h2 className="text-3xl font-bo ld ">
            {t.rich("register.register_title", {
              b: (chunks) => <span className="text-primary">{chunks}</span>,
            })}
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {t("register.register_already_account")} &nbsp;
            <Button
              variant="linkHover2"
              onClick={() => router.push("/login")}
              className={cn("text-primary", "p-0")}
            >
              {t("register.register_login")}
            </Button>
          </p>
        </div>

        <form className="w-full space-y-4" onSubmit={handleSubmit}>
          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="w-5 h-5" />
              <AlertTitle>{t("register.register_error")}</AlertTitle>
              <AlertDescription>
                {Array.isArray(error)
                  ? error.map((e) => <p key={e.msg}>{e.msg}</p>)
                  : error}
              </AlertDescription>
            </Alert>
          )}

          <div className="flex flex-col space-y-4">
            <div className="w-full space-y-4">
              <div>
                <h1 className="text-2xl">
                  {t.rich("register.register_personal_info", {
                    b: (chunks) => (
                      <span className="text-primary">{chunks}</span>
                    ),
                  })}
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {t("register.register_personal_info_message")}
                </p>
              </div>
              <div className="space-y-4">
                <div className="flex flex-col w-full space-y-2 lg:flex-row lg:space-x-4 lg:space-y-0">
                  <div className="w-full space-y-2">
                    <Label htmlFor="first_name">
                      {t("register.first_name")}
                    </Label>
                    <Input
                      required
                      id="first_name"
                      name="first_name"
                      placeholder={t("register.first_name_placeholder")}
                      type="text"
                      value={user.first_name}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="w-full space-y-2">
                    <Label htmlFor="last_name">{t("register.last_name")}</Label>
                    <Input
                      required
                      id="last_name"
                      name="last_name"
                      placeholder={t("register.last_name_placeholder")}
                      type="text"
                      value={user.last_name}
                      onChange={handleChange}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">{t("register.email")}</Label>
                  <Input
                    required
                    id="email"
                    name="email"
                    placeholder="name@example.com"
                    type="email"
                    value={user.email}
                    onChange={handleChange}
                  />
                </div>
                <div className="flex flex-col w-full space-y-2 lg:flex-row lg:space-x-4 lg:space-y-0">
                  <div className="w-full space-y-2">
                    <Label htmlFor="password">{t("register.password")}</Label>
                    <PasswordInput
                      required
                      id="password"
                      placeholder="********"
                      value={user.password}
                      autoComplete="new-password"
                      onChange={(e) =>
                        setUser((prevUser) => ({
                          ...prevUser,
                          password: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div className="w-full space-y-2">
                    <Label htmlFor="confirmPassword">
                      {t("register.confirm_password")}
                    </Label>
                    <PasswordInput
                      required
                      id="confirmPassword"
                      placeholder="********"
                      value={confirmPassword}
                      autoComplete="new-password"
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">{t("register.phone")}</Label>
                  <PhoneInput
                    required
                    value={user.phone}
                    defaultCountry="FR"
                    onChange={(phone) =>
                      setUser((prevUser) => ({
                        ...prevUser,
                        phone,
                      }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="street_address">
                    {t("register.address")}
                  </Label>
                  <Input
                    required
                    id="street_address"
                    name="street_address"
                    placeholder={t("register.address_placeholder")}
                    type="text"
                    value={user.street_address}
                    onChange={handleChange}
                  />
                </div>
                <div className="flex flex-col w-full space-y-2 lg:flex-row lg:space-x-4 lg:space-y-0">
                  <div className="w-full space-y-2">
                    <Label htmlFor="city">{t("register.city")}</Label>
                    <Input
                      required
                      id="city"
                      name="city"
                      placeholder={t("register.city_placeholder")}
                      type="text"
                      value={user.city}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="w-full space-y-2">
                    <Label htmlFor="state">{t("register.state")}</Label>
                    <Input
                      required
                      id="state"
                      name="state"
                      placeholder={t("register.state_placeholder")}
                      type="text"
                      value={user.state}
                      onChange={handleChange}
                    />
                  </div>
                </div>
                <div className="w-full space-y-2">
                  <Label htmlFor="postal_code">
                    {t("register.postal_code")}
                  </Label>
                  <Input
                    required
                    id="postal_code"
                    name="postal_code"
                    placeholder={t("register.postal_code_placeholder")}
                    type="text"
                    value={user.postal_code}
                    onChange={handleChange}
                  />
                </div>
                <div className="w-full space-y-2">
                  <Label htmlFor="country">{t("register.country")}</Label>
                  <Input
                    required
                    id="country"
                    name="country"
                    placeholder={t("register.country_placeholder")}
                    type="text"
                    value={user.country}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            <div className="w-full  space-y-4">
              <div>
                <h1 className="text-2xl">
                  {t.rich("register.register_company_info", {
                    b: (chunks) => (
                      <span className="text-primary">{chunks}</span>
                    ),
                  })}
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {t("register.register_company_info_message")}
                </p>
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="company.name">
                    {t("register.company_name")}
                  </Label>
                  <Input
                    required
                    id="company.name"
                    name="company.name"
                    placeholder={t("register.company_name_placeholder")}
                    type="text"
                    value={user.company.name}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company.industry">
                    {t("register.company_industry")}
                  </Label>
                  <Input
                    required
                    id="company.industry"
                    name="company.industry"
                    placeholder={t("register.company_industry_placeholder")}
                    type="text"
                    value={user.company.industry}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company.street_address">
                    {t("register.company_address")}
                  </Label>
                  <Input
                    required
                    id="company.street_address"
                    name="company.street_address"
                    placeholder={t("register.company_address_placeholder")}
                    type="text"
                    value={user.company.street_address}
                    onChange={handleChange}
                  />
                </div>
                <div className="flex flex-col w-full space-y-2 lg:flex-row lg:space-x-4 lg:space-y-0">
                  <div className="w-full space-y-2">
                    <Label htmlFor="company.city">
                      {t("register.company_city")}
                    </Label>
                    <Input
                      required
                      id="company.city"
                      name="company.city"
                      placeholder={t("register.company_city_placeholder")}
                      type="text"
                      value={user.company.city}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="w-full space-y-2">
                    <Label htmlFor="company.state">
                      {t("register.company_state")}
                    </Label>
                    <Input
                      required
                      id="company.state"
                      name="company.state"
                      placeholder={t("register.company_state_placeholder")}
                      type="text"
                      value={user.company.state}
                      onChange={handleChange}
                    />
                  </div>
                </div>
                <div className="w-full space-y-2">
                  <Label htmlFor="company.postal_code">
                    {t("register.company_postal_code")}
                  </Label>
                  <Input
                    required
                    id="company.postal_code"
                    name="company.postal_code"
                    placeholder={t("register.company_postal_code_placeholder")}
                    type="text"
                    value={user.company.postal_code}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company.country">
                    {t("register.company_country")}
                  </Label>
                  <Input
                    required
                    id="company.country"
                    name="company.country"
                    placeholder={t("register.company_country_placeholder")}
                    type="text"
                    value={user.company.country}
                    onChange={handleChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="company.email">
                    {t("register.company_email")}
                  </Label>
                  <Input
                    required
                    id="company.email"
                    name="company.email"
                    placeholder="example@company.com"
                    type="email"
                    value={user.company.email}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company.phone">
                    {t("register.company_phone")}
                  </Label>
                  <PhoneInput
                    required
                    id="company.phone"
                    name="company.phone"
                    placeholder={t("register.company_phone_placeholder")}
                    type="text"
                    value={user.company.phone}
                    defaultCountry="FR"
                    onChange={(phone) =>
                      setUser((prevUser) => ({
                        ...prevUser,
                        company: {
                          ...prevUser.company,
                          phone,
                        },
                      }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company.vat_number">
                    {t("register.company_vat_number")}
                  </Label>
                  <Input
                    required
                    id="company.vat_number"
                    name="company.vat_number"
                    placeholder={t("register.company_vat_number_placeholder")}
                    type="text"
                    value={user.company.vat_number}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company.siret_number">
                    {t("register.company_siret_number")}
                  </Label>
                  <Input
                    required
                    id="company.siret_number"
                    name="company.siret_number"
                    placeholder={t("register.company_siret_number_placeholder")}
                    type="text"
                    value={user.company.siret_number}
                    onChange={handleChange}
                  />
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
            {loading
              ? t("register.register_button_loading")
              : t("register.register_button")}
          </Button>
        </form>
      </div>
    </div>
  );
}
