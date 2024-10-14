"use client";
import React, { useEffect, useState } from "react";

import { Company } from "@/types/Company";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ContentLayout } from "@/components/admin-panel/content-layout";
import EditCompanyDialog from "@/components/edit-company-dialog";

import { ClipLoader } from "react-spinners";

import api from "@/lib/axios";

type Props = {};

export default function MyCompanyPage({}: Props) {
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchCompany = async () => {
      try {
        const response = await api.get(`/company`);
        setCompany(response.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchCompany();
  }, []);

  const handleUpdateCompany = (updatedCompany: Company) => {
    setCompany(updatedCompany);
  };

  return (
    <ContentLayout title="My Company">
      <div className="flex flex-col w-full gap-4">
        {loading ? (
          <div className="flex w-full h-screen items-center justify-center">
            <ClipLoader color="#009933" loading={loading} size={50} />
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <div className="flex flex-col items-start gap-2">
                <h1 className="text-3xl font-semibold">Mon entreprise</h1>
                <p className="text-gray-500">
                  Informations sur votre entreprise
                </p>
              </div>
              <div className="flex items-center gap-2">
                <EditCompanyDialog
                  company={company}
                  onSave={handleUpdateCompany}
                />
              </div>
            </div>
            <div className="flex  w-full gap-6">
              <div className="flex w-full flex-col justify-center p-4 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Informations de l'entreprise</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col gap-2">
                      <div>
                        <span className="font-semibold">
                          Nom de l'entreprise:&nbsp;
                        </span>
                        {company?.name}
                      </div>
                      <div>
                        <span className="font-semibold">
                          Secteur d'activité:&nbsp;
                        </span>
                        {company?.industry}
                      </div>
                      <div>
                        <span className="font-semibold">Email:&nbsp;</span>
                        {company?.email}
                      </div>
                      <div>
                        <span className="font-semibold">
                          Numéro de téléphone:&nbsp;
                        </span>
                        {company?.phone}
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Adresse de l'entreprise</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col gap-2">
                      <div>
                        <span className="font-semibold">Adresse:&nbsp;</span>
                        {company?.street_address}
                      </div>
                      <div>
                        <span className="font-semibold">Ville:&nbsp;</span>
                        {company?.city}
                      </div>
                      <div>
                        <span className="font-semibold">
                          État/Région:&nbsp;
                        </span>
                        {company?.state}
                      </div>
                      <div>
                        <span className="font-semibold">
                          Code postal:&nbsp;
                        </span>
                        {company?.postal_code}
                      </div>
                      <div>
                        <span className="font-semibold">Pays:&nbsp;</span>
                        {company?.country}
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>
                      Informations sur la société (SIRET, TVA)
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col gap-2">
                      <div>
                        <span className="font-semibold">
                          Numéro de TVA:&nbsp;
                        </span>
                        {company?.vat_number}
                      </div>
                      <div>
                        <span className="font-semibold">
                          Numéro de SIRET:&nbsp;
                        </span>
                        {company?.siret_number}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </>
        )}
      </div>
    </ContentLayout>
  );
}
