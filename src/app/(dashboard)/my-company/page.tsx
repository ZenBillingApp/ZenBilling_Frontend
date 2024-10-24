"use client";
import React from "react";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";

import { User } from "@/types/User";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ContentLayout } from "@/components/admin-panel/content-layout";
import { useToast } from "@/components/ui/use-toast";

import { ClipLoader } from "react-spinners";
import { MdOutlineEdit } from "react-icons/md";

import api from "@/lib/axios";
import { cn } from "@/lib/utils";
import EditCompanyDialog from "@/components/edit-company-dialog";
import ErrorScreen from "@/components/error-screen";

type Props = {};

export default function Page({}: Props) {
  const { id } = useParams();
  const t = useTranslations();
  const { toast } = useToast();

  const [user, setUser] = React.useState<User>({} as User);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [error, setError] = React.useState<string | null>(null);

  const fetchUser = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get(`/user`);
      setUser(response.data);
    } catch (err: any) {
      setError(err.response.data.message);
      toast({
        variant: "destructive",
        title: "Une Erreur s'est produite",
        description: t(`server.${err.response.data.message}`),
      });
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
                    company={user?.Company}
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
                        {user?.Company.name}
                      </div>
                      <div>
                        <span className="font-semibold">
                          Secteur d&apos;activité :
                        </span>{" "}
                        {user?.Company.industry}
                      </div>
                      <div>
                        <span className="font-semibold">Email :</span>{" "}
                        {user?.Company.email}
                      </div>
                      <div>
                        <span className="font-semibold">Téléphone :</span>{" "}
                        {user?.Company.phone}
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
                        {user?.Company.street_address}
                      </div>
                      <div>
                        <span className="font-semibold">Ville :</span>{" "}
                        {user?.Company.city}
                      </div>
                      <div>
                        <span className="font-semibold">Code postal :</span>{" "}
                        {user?.Company.postal_code}
                      </div>
                      <div>
                        <span className="font-semibold">Pays :</span>{" "}
                        {user?.Company.country}
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
                        <span className="font-semibold">N° de TVA :</span>{" "}
                        {user?.Company.vat_number}
                      </div>
                      <div>
                        <span className="font-semibold">N° de SIRET :</span>{" "}
                        {user?.Company.siret_number}
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
