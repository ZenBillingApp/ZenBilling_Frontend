"use client";
import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import { Company } from "@/types/Company";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Credenza,
  CredenzaBody,
  CredenzaClose,
  CredenzaContent,
  CredenzaDescription,
  CredenzaFooter,
  CredenzaHeader,
  CredenzaTitle,
  CredenzaTrigger,
} from "@/components/ui/credenza";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ContentLayout } from "@/components/admin-panel/content-layout";

import { AlertTriangle } from "lucide-react";
import { ClipLoader } from "react-spinners";
import { getCookie } from "cookies-next";
import { MdOutlineEdit, MdDeleteOutline } from "react-icons/md";

import api from "@/lib/axios";
import EditCompanyDialog from "@/components/edit-company-dialog";

type Props = {};

export default function MyCompanyPage({}: Props) {
  const { id } = useParams();
  const router = useRouter();

  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchCompany = async () => {
      try {
        const response = await fetch(
          process.env.NEXT_PUBLIC_API_URL + `/api/company`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${getCookie("token")}`,
            },
          }
        );
        if (!response.ok) {
          throw new Error("Failed to fetch company");
        }

        const data = await response.json();
        setCompany(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchCompany();
  }, [id]);

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
                <h1 className="text-3xl font-semibold">My Company</h1>
                <p className="text-gray-500">Manage your company information</p>
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
                    <CardTitle>Company Information</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col gap-2">
                      <div>
                        <span className="font-semibold">Name: </span>
                        {company?.name}
                      </div>
                      <div>
                        <span className="font-semibold">Industry: </span>{" "}
                        {company?.industry}
                      </div>
                      <div>
                        <span className="font-semibold">Email: </span>{" "}
                        {company?.email}
                      </div>
                      <div>
                        <span className="font-semibold">Phone: </span>{" "}
                        {company?.phone}
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Address</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col gap-2">
                      <div>
                        <span className="font-semibold">Street Address:</span>{" "}
                        {company?.street_address}
                      </div>
                      <div>
                        <span className="font-semibold">City:</span>{" "}
                        {company?.city}
                      </div>
                      <div>
                        <span className="font-semibold">State:</span>{" "}
                        {company?.state}
                      </div>
                      <div>
                        <span className="font-semibold">Postal Code:</span>{" "}
                        {company?.postal_code}
                      </div>
                      <div>
                        <span className="font-semibold">Country:</span>{" "}
                        {company?.country}
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>VAT Information</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col gap-2">
                      <div>
                        <span className="font-semibold">VAT Number:</span>{" "}
                        {company?.vat_number}
                      </div>
                      <div>
                        <span className="font-semibold">SIRET Number:</span>{" "}
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
