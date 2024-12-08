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
                <div className="flex">
                  <div className="flex justify-center items-center p-2 rounded-full bg-primary w-16 h-16">
                    <span className="text-2xl font-bold text-white">
                      {company.name.charAt(0)}
                    </span>
                  </div>
                  <div className="flex flex-col ml-4 justify-center">
                    <h1 className="text-xl font-semibold">{company.name}</h1>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {company.email}
                    </p>
                  </div>
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
              <div className="container mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Informations</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col gap-2">
                      <div className="flex flex-col gap-1">
                        <span className="text-sm">Nom</span>
                        <span className="text-md font-semibold">
                          {company.name ? company.name : "N/A"}
                        </span>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-sm">Activité</span>
                        <span className="text-md font-semibold">
                          {company.activity ? company.activity : "N/A"}
                        </span>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-sm">Email</span>
                        <span className="text-md font-semibold">
                          {company.email ? company.email : "N/A"}
                        </span>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-sm">Téléphone</span>
                        <span className="text-md font-semibold">
                          {company.phone ? company.phone : "N/A"}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Adresse</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col gap-2">
                      <div className="flex flex-col gap-1">
                        <span className="text-sm">Adresse</span>
                        <span className="text-md font-semibold">
                          {company.street_address
                            ? company.street_address
                            : "N/A"}
                        </span>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-sm">Ville</span>
                        <span className="text-md font-semibold">
                          {company.city ? company.city : "N/A"}
                        </span>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-sm">Code Postal</span>
                        <span className="text-md font-semibold">
                          {company.postal_code ? company.postal_code : "N/A"}
                        </span>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-sm">Pays</span>
                        <span className="text-md font-semibold">
                          {company.country ? company.country : "N/A"}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Informations Légales</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col gap-2">
                      <div className="flex flex-col gap-1">
                        <span className="text-sm">SIRET</span>
                        <span className="text-md font-semibold">
                          {company.siret_number ? company.siret_number : "N/A"}
                        </span>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-sm">SIREN</span>
                        <span className="text-md font-semibold">
                          {company.siren_number ? company.siren_number : "N/A"}
                        </span>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-sm">TVA</span>
                        <span className="text-md font-semibold">
                          {company.vat_number ? company.vat_number : "N/A"}
                        </span>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-sm">Type d&apos;entreprise</span>
                        <span className="text-md font-semibold">
                          {company.category ? company.category : "N/A"}
                        </span>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-sm">Date de création</span>
                        <span className="text-md font-semibold">
                          {company.date_creation
                            ? new Date(
                                company.date_creation
                              ).toLocaleDateString()
                            : "N/A"}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </div>
      </ContentLayout>
    </>
  );
}
