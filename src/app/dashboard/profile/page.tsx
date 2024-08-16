"use client";
import React, { use, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

import { User } from "@/types/User";

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

import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
} from "recharts";

import { MdOutlineEdit, MdDeleteOutline } from "react-icons/md";
import { cn } from "@/lib/utils";
import TableInvoices from "@/components/tableInvoices";
import { ContentLayout } from "@/components/admin-panel/content-layout";

type Props = {};

const EditUserDialog = ({
    user,
    onClose,
    onSave,
}: {
    user: User | null;
    onClose: () => void;
    onSave: (updateduser: User) => void;
}) => {
    const [editUser, setEditUser] = React.useState<User | null>(null);
    const [loading, setLoading] = React.useState<boolean>(false);
    const [open, setOpen] = React.useState<boolean>(false);
    const [error, setError] = React.useState<boolean>(false);

    React.useEffect(() => {
        setError(false);
        setEditUser(user);
    }, [open, user]);

    const handleSave = async () => {
        try {
            if (editUser) {
                setLoading(true);
                setError(false);
                const response = await fetch(
                    process.env.NEXT_PUBLIC_API_URL + `/api/auth/profile`,
                    {
                        method: "PUT",
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${getCookie("token")}`,
                        },
                        body: JSON.stringify(editUser),
                    }
                );
                if (!response.ok) {
                    throw new Error("Failed to update user");
                }

                const updatedUser = await response.json();
                onSave(updatedUser);
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
            <CredenzaContent className="overflow-auto h-[80vh]">
                <CredenzaHeader>
                    <CredenzaTitle>Modify my profile</CredenzaTitle>
                </CredenzaHeader>
                <CredenzaDescription>
                    <p>change your information</p>
                </CredenzaDescription>
                {error && (
                    <Alert variant="destructive">
                        <AlertTriangle className="w-5 h-5" />
                        <AlertTitle>Failed to update user</AlertTitle>
                        <AlertDescription>
                            Please check your information and try again.
                        </AlertDescription>
                    </Alert>
                )}
                <div className="flex gap-2">
                    <div className="flex flex-col w-1/2 gap-2">
                        <Label>First name</Label>
                        <Input
                            type="text"
                            value={editUser?.first_name || ""}
                            onChange={(e) =>
                                setEditUser(
                                    (prev) =>
                                        prev && {
                                            ...prev,
                                            first_name: e.target.value,
                                        }
                                )
                            }
                        />
                    </div>
                    <div className="flex flex-col w-1/2 gap-2">
                        <Label>Last name</Label>
                        <Input
                            type="text"
                            value={editUser?.last_name || ""}
                            onChange={(e) =>
                                setEditUser(
                                    (prev) =>
                                        prev && {
                                            ...prev,
                                            last_name: e.target.value,
                                        }
                                )
                            }
                        />
                    </div>
                </div>
                <div className="flex flex-col w-full gap-2">
                    <Label>Street address</Label>
                    <Input
                        type="text"
                        value={editUser?.street_address || ""}
                        onChange={(e) =>
                            setEditUser(
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
                            value={editUser?.city || ""}
                            onChange={(e) =>
                                setEditUser(
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
                            value={editUser?.state || ""}
                            onChange={(e) =>
                                setEditUser(
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
                        <Label>Postal code</Label>
                        <Input
                            type="text"
                            value={editUser?.postal_code || ""}
                            onChange={(e) =>
                                setEditUser(
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
                            value={editUser?.country || ""}
                            onChange={(e) =>
                                setEditUser(
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
                        value={editUser?.email || ""}
                        onChange={(e) =>
                            setEditUser(
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
                        value={editUser?.phone || ""}
                        onChange={(e) =>
                            setEditUser(
                                (prev) =>
                                    prev && {
                                        ...prev,
                                        phone: e.target.value,
                                    }
                            )
                        }
                    />
                </div>

                <CredenzaFooter>
                    <Button
                        disabled={
                            !editUser?.first_name ||
                            !editUser?.last_name ||
                            !editUser?.email ||
                            !editUser?.phone ||
                            !editUser?.street_address ||
                            !editUser?.city ||
                            !editUser?.state ||
                            !editUser?.postal_code ||
                            !editUser?.country ||
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

export default function Page({}: Props) {
    const { id } = useParams();
    const router = useRouter();

    const [user, setUser] = React.useState<User | null>(null);
    const [loading, setLoading] = React.useState<boolean>(true);

    React.useEffect(() => {
        const fetchUser = async () => {
            try {
                const response = await fetch(
                    process.env.NEXT_PUBLIC_API_URL + `/api/auth/profile`,
                    {
                        method: "GET",
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${getCookie("token")}`,
                        },
                    }
                );
                if (!response.ok) {
                    throw new Error("Failed to fetch user");
                }

                const data = await response.json();
                setUser(data);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchUser();
    }, [id]);

    const handleUpdateuser = (updatedUser: User) => {
        setUser(updatedUser);
    };

    return (
        <ContentLayout title="My profile">
            <div className="flex flex-col w-full gap-6">
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
                                    My profile
                                </h1>
                                <p className=" text-gray-500">
                                    Manage your profile
                                </p>
                            </div>
                            <div className="flex items-center gap-2">
                                <EditUserDialog
                                    user={user}
                                    onClose={() => {}}
                                    onSave={handleUpdateuser}
                                />
                            </div>
                        </div>
                        <div className="flex  w-full gap-6">
                            <div className="flex w-full flex-col justify-center p-4 gap-6">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>
                                            Personal information
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div>
                                            <span className="font-semibold">
                                                First name :{" "}
                                            </span>{" "}
                                            {user?.first_name}
                                        </div>
                                        <div>
                                            <span className="font-semibold">
                                                Last name :{" "}
                                            </span>{" "}
                                            {user?.last_name}
                                        </div>

                                        <div>
                                            <span className="font-semibold">
                                                Email :{" "}
                                            </span>{" "}
                                            {user?.email}
                                        </div>
                                        <div>
                                            <span className="font-semibold">
                                                Phone :{" "}
                                            </span>{" "}
                                            {user?.phone}
                                        </div>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Address</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div>
                                            <span className="font-semibold">
                                                Street address:
                                            </span>{" "}
                                            {user?.street_address}
                                        </div>
                                        <div>
                                            <span className="font-semibold">
                                                City:
                                            </span>{" "}
                                            {user?.city}
                                        </div>
                                        <div>
                                            <span className="font-semibold">
                                                State:
                                            </span>{" "}
                                            {user?.state}
                                        </div>
                                        <div>
                                            <span className="font-semibold">
                                                Postal code:
                                            </span>{" "}
                                            {user?.postal_code}
                                        </div>
                                        <div>
                                            <span className="font-semibold">
                                                Country:
                                            </span>{" "}
                                            {user?.country}
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
