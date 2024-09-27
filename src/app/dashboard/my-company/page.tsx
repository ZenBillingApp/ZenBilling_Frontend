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
import { AlertTriangle } from "lucide-react";

import { ClipLoader } from "react-spinners";
import { getCookie } from "cookies-next";

import { MdOutlineEdit, MdDeleteOutline } from "react-icons/md";
import { ContentLayout } from "@/components/admin-panel/content-layout";

type Props = {};

const EditCompanyDialog = ({
    company,
    onClose,
    onSave,
}: {
    company: Company | null;
    onClose: () => void;
    onSave: (updatedCompany: Company) => void;
}) => {
    const [editCompany, setEditCompany] = useState<Company | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [open, setOpen] = useState<boolean>(false);
    const [error, setError] = useState<boolean>(false);

    useEffect(() => {
        setError(false);
        setEditCompany(company);
    }, [open, company]);

    const handleSave = async () => {
        try {
            if (editCompany) {
                setLoading(true);
                setError(false);
                const response = await fetch(
                    process.env.NEXT_PUBLIC_API_URL + `/api/company`,
                    {
                        method: "PUT",
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${getCookie("token")}`,
                        },
                        body: JSON.stringify(editCompany),
                    }
                );
                if (!response.ok) {
                    throw new Error("Failed to update company");
                }

                const updatedCompany = await response.json();
                onSave(updatedCompany);
                setOpen(false);
            }
        } catch (error) {
            console.error(error);
            setError(true);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Credenza open={open} onOpenChange={setOpen}>
            <CredenzaTrigger>
                <Button
                    className="flex items-center gap-2"
                    onClick={() => setOpen(true)}
                >
                    <MdOutlineEdit size={20} />
                    Modify
                </Button>
            </CredenzaTrigger>
            <CredenzaContent className="h-[80vh] overflow-auto">
                <CredenzaHeader>
                    <CredenzaTitle>Modify Company Profile</CredenzaTitle>
                </CredenzaHeader>
                <CredenzaDescription>
                    <p>Change your company information</p>
                </CredenzaDescription>
                {error && (
                    <Alert variant="destructive">
                        <AlertTriangle className="w-5 h-5" />
                        <AlertTitle>Failed to update company</AlertTitle>
                        <AlertDescription>
                            Please check your information and try again.
                        </AlertDescription>
                    </Alert>
                )}
                <div className="flex flex-col w-full gap-2">
                    <Label>Company Name</Label>
                    <Input
                        type="text"
                        value={editCompany?.name || ""}
                        onChange={(e) =>
                            setEditCompany(
                                (prev) =>
                                    prev && {
                                        ...prev,
                                        name: e.target.value,
                                    }
                            )
                        }
                    />
                </div>
                <div className="flex flex-col w-full gap-2">
                    <Label>Industry</Label>
                    <Input
                        type="text"
                        value={editCompany?.industry || ""}
                        onChange={(e) =>
                            setEditCompany(
                                (prev) =>
                                    prev && {
                                        ...prev,
                                        industry: e.target.value,
                                    }
                            )
                        }
                    />
                </div>
                <div className="flex flex-col w-full gap-2">
                    <Label>Street Address</Label>
                    <Input
                        type="text"
                        value={editCompany?.street_address || ""}
                        onChange={(e) =>
                            setEditCompany(
                                (prev) =>
                                    prev && {
                                        ...prev,
                                        street_address: e.target.value,
                                    }
                            )
                        }
                    />
                </div>
                <div className="flex gap-2">
                    <div className="flex flex-col w-1/2 gap-2">
                        <Label>City</Label>
                        <Input
                            type="text"
                            value={editCompany?.city || ""}
                            onChange={(e) =>
                                setEditCompany(
                                    (prev) =>
                                        prev && {
                                            ...prev,
                                            city: e.target.value,
                                        }
                                )
                            }
                        />
                    </div>
                    <div className="flex flex-col w-1/2 gap-2">
                        <Label>State</Label>
                        <Input
                            type="text"
                            value={editCompany?.state || ""}
                            onChange={(e) =>
                                setEditCompany(
                                    (prev) =>
                                        prev && {
                                            ...prev,
                                            state: e.target.value,
                                        }
                                )
                            }
                        />
                    </div>
                </div>
                <div className="flex gap-2">
                    <div className="flex flex-col w-1/2 gap-2">
                        <Label>Postal Code</Label>
                        <Input
                            type="text"
                            value={editCompany?.postal_code || ""}
                            onChange={(e) =>
                                setEditCompany(
                                    (prev) =>
                                        prev && {
                                            ...prev,
                                            postal_code: e.target.value,
                                        }
                                )
                            }
                        />
                    </div>
                    <div className="flex flex-col w-1/2 gap-2">
                        <Label>Country</Label>
                        <Input
                            type="text"
                            value={editCompany?.country || ""}
                            onChange={(e) =>
                                setEditCompany(
                                    (prev) =>
                                        prev && {
                                            ...prev,
                                            country: e.target.value,
                                        }
                                )
                            }
                        />
                    </div>
                </div>
                <div className="flex flex-col w-full gap-2">
                    <Label>Email</Label>
                    <Input
                        type="email"
                        value={editCompany?.email || ""}
                        onChange={(e) =>
                            setEditCompany(
                                (prev) =>
                                    prev && {
                                        ...prev,
                                        email: e.target.value,
                                    }
                            )
                        }
                    />
                </div>
                <div className="flex flex-col w-full gap-2">
                    <Label>Phone</Label>
                    <Input
                        type="tel"
                        value={editCompany?.phone || ""}
                        onChange={(e) =>
                            setEditCompany(
                                (prev) =>
                                    prev && {
                                        ...prev,
                                        phone: e.target.value,
                                    }
                            )
                        }
                    />
                </div>
                <div className="flex flex-col w-full gap-2">
                    <div className="flex flex-col gap-2">
                        <Label>VAT Number</Label>
                        <Input
                            type="text"
                            value={editCompany?.vat_number || ""}
                            onChange={(e) =>
                                setEditCompany(
                                    (prev) =>
                                        prev && {
                                            ...prev,
                                            vat_number: e.target.value,
                                        }
                                )
                            }
                        />
                    </div>
                    <div className="flex flex-col gap-2">
                        <Label>SIRET Number</Label>
                        <Input
                            type="text"
                            value={editCompany?.siret_number || ""}
                            onChange={(e) =>
                                setEditCompany(
                                    (prev) =>
                                        prev && {
                                            ...prev,
                                            siret_number: e.target.value,
                                        }
                                )
                            }
                        />
                    </div>
                </div>

                <CredenzaFooter>
                    <Button
                        disabled={
                            !editCompany?.name ||
                            !editCompany?.industry ||
                            !editCompany?.email ||
                            !editCompany?.phone ||
                            !editCompany?.street_address ||
                            !editCompany?.city ||
                            !editCompany?.state ||
                            !editCompany?.postal_code ||
                            !editCompany?.country ||
                            !editCompany?.vat_number ||
                            loading
                        }
                        onClick={handleSave}
                    >
                        {loading ? "Saving..." : "Save"}
                    </Button>

                    <CredenzaClose asChild>
                        <Button variant="outline" onClick={onClose}>
                            Cancel
                        </Button>
                    </CredenzaClose>
                </CredenzaFooter>
            </CredenzaContent>
        </Credenza>
    );
};

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
                        <ClipLoader
                            color="#009933"
                            loading={loading}
                            size={50}
                        />
                    </div>
                ) : (
                    <>
                        <div className="flex items-center justify-between">
                            <div className="flex flex-col items-start gap-2">
                                <h1 className="text-3xl font-semibold">
                                    My Company
                                </h1>
                                <p className="text-gray-500">
                                    Manage your company information
                                </p>
                            </div>
                            <div className="flex items-center gap-2">
                                <EditCompanyDialog
                                    company={company}
                                    onClose={() => {}}
                                    onSave={handleUpdateCompany}
                                />
                            </div>
                        </div>
                        <div className="flex  w-full gap-6">
                            <div className="flex w-full flex-col justify-center p-4 gap-6">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>
                                            Company Information
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="flex flex-col gap-2">
                                            <div>
                                                <span className="font-semibold">
                                                    Name:{" "}
                                                </span>
                                                {company?.name}
                                            </div>
                                            <div>
                                                <span className="font-semibold">
                                                    Industry:{" "}
                                                </span>{" "}
                                                {company?.industry}
                                            </div>
                                            <div>
                                                <span className="font-semibold">
                                                    Email:{" "}
                                                </span>{" "}
                                                {company?.email}
                                            </div>
                                            <div>
                                                <span className="font-semibold">
                                                    Phone:{" "}
                                                </span>{" "}
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
                                                <span className="font-semibold">
                                                    Street Address:
                                                </span>{" "}
                                                {company?.street_address}
                                            </div>
                                            <div>
                                                <span className="font-semibold">
                                                    City:
                                                </span>{" "}
                                                {company?.city}
                                            </div>
                                            <div>
                                                <span className="font-semibold">
                                                    State:
                                                </span>{" "}
                                                {company?.state}
                                            </div>
                                            <div>
                                                <span className="font-semibold">
                                                    Postal Code:
                                                </span>{" "}
                                                {company?.postal_code}
                                            </div>
                                            <div>
                                                <span className="font-semibold">
                                                    Country:
                                                </span>{" "}
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
                                                <span className="font-semibold">
                                                    VAT Number:
                                                </span>{" "}
                                                {company?.vat_number}
                                            </div>
                                            <div>
                                                <span className="font-semibold">
                                                    SIRET Number:
                                                </span>{" "}
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
