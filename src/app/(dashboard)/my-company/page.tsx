"use client";
import React from "react";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";

import { Company } from "@/types/Company";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ContentLayout } from "@/components/admin-panel/content-layout";
import EditCompanyDialog from "@/components/edit-company-dialog";
import ErrorScreen from "@/components/error-screen";

import { ClipLoader } from "react-spinners";
import { MdOutlineEdit } from "react-icons/md";

import api from "@/lib/axios";
import { cn } from "@/lib/utils";

type Props = {};

export default function Page({}: Props) {
  const { id } = useParams();
  const t = useTranslations();

  const [company, setCompany] = React.useState<Company>({} as Company);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [error, setError] = React.useState<string | null>(null);

  const fetchUser = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get(`/company`);
      setCompany(response.data);
    } catch (err: any) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchUser();
  }, [id]);

  return (
    <>
      <ContentLayout title="Mon Entreprise">
        <div className="flex flex-col w-full gap-6">
          {loading ? (
            <div className="flex w-full h-screen items-center justify-center">
              <ClipLoader color={cn("text-primary")} />
            </div>
          ) : error ? (
            <div className="flex w-full h-screen items-center justify-center">
              <ErrorScreen handleRetry={() => fetchUser()} />
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <div className="flex flex-col items-start gap-2">
                  <h1 className="text-3xl font-semibold">Mon Entreprise</h1>
                  <p className="text-sm text-gray-600 dark:text-gray-400"></p>
                </div>
                <div className="flex items-center gap-2">
                  <EditCompanyDialog
                    trigger={
                      <Button variant="default">
                        <MdOutlineEdit size={20} />
                        Modifier
                      </Button>
                    }
                    company={company}
                    onSave={() => fetchUser()}
                  />
                </div>
              </div>
              <div className="flex  w-full gap-6">
                <div className="flex w-full flex-col justify-center gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Informations de l&apos;entreprise</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div>
                        <span className="font-semibold">Nom :</span>{" "}
                        {company.name}
                      </div>
                      <div>
                        <span className="font-semibold">Email :</span>{" "}
                        {company.email}
                      </div>
                      <div>
                        <span className="font-semibold">Téléphone :</span>{" "}
                        {company.phone}
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle>Adresse de l&apos;entreprise</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div>
                        <span className="font-semibold">Adresse :</span>{" "}
                        {company.street_address}
                      </div>
                      <div>
                        <span className="font-semibold">Ville :</span>{" "}
                        {company.city}
                      </div>
                      <div>
                        <span className="font-semibold">Code postal :</span>{" "}
                        {company.postal_code}
                      </div>
                      <div>
                        <span className="font-semibold">Pays :</span>{" "}
                        {company.country}
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle>
                        Informations légales de l&apos;entreprise
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div>
                        <span className="font-semibold">
                          TVA intracommunautaire :
                        </span>{" "}
                        {company.vat_number}
                      </div>
                      <div>
                        <span className="font-semibold">N° de SIRET :</span>{" "}
                        {company.siret_number}
                      </div>
                      <div>
                        <span className="font-semibold">N° de SIREN :</span>{" "}
                        {company.siren_number}
                      </div>
                      <div>
                        <span className="font-semibold">
                          Type d&apos;entreprise :
                        </span>{" "}
                        {company.category}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </>
          )}
        </div>
      </ContentLayout>
    </>
  );
}
