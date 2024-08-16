"use client";
import React, { use, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { Customer } from "@/types/Customer";

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
import { PhoneInput } from "@/components/ui/phone-input";

const SearchAddress = dynamic(() => import("@/components/ui/search-address"), {
    ssr: false,
});

type Props = {};

const AlertDeleteCustomer = ({}) => {
    const [open, setOpen] = React.useState<boolean>(false);
    const { id } = useParams();
    const router = useRouter();

    const [loading, setLoading] = React.useState<boolean>(false);

    const onDelete = async () => {
        try {
            setLoading(true);
            const response = await fetch(
                process.env.NEXT_PUBLIC_API_URL + `/api/customers/${id}`,
                {
                    method: "DELETE",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${getCookie("token")}`,
                    },
                }
            );
            if (!response.ok) {
                throw new Error("Failed to delete customer");
            }

            router.push("/dashboard/customers");
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Credenza open={open} onOpenChange={setOpen}>
            <CredenzaTrigger>
                <Button
                    variant={"destructive"}
                    className="flex items-center gap-2"
                >
                    <MdDeleteOutline size={20} />
                    Delete
                </Button>
            </CredenzaTrigger>
            <CredenzaContent>
                <CredenzaHeader>
                    <CredenzaTitle>Delete customer</CredenzaTitle>
                    <CredenzaDescription>
                        <p>Are you sure you want to delete this customer?</p>
                    </CredenzaDescription>
                </CredenzaHeader>

                <CredenzaFooter>
                    <Button
                        disabled={loading}
                        variant={"destructive"}
                        onClick={onDelete}
                    >
                        {loading ? "Deleting..." : "Yes"}
                    </Button>
                    <CredenzaClose asChild>
                        <Button variant="outline">No</Button>
                    </CredenzaClose>
                </CredenzaFooter>
            </CredenzaContent>
        </Credenza>
    );
};

const EditCustomerDialog = ({
    customer,
    onClose,
    onSave,
}: {
    customer: Customer | null;
    onClose: () => void;
    onSave: (updatedCustomer: Customer) => void;
}) => {
    const [editCustomer, setEditCustomer] = React.useState<Customer | null>(
        customer
    );
    const [loading, setLoading] = React.useState<boolean>(false);
    const [open, setOpen] = React.useState<boolean>(false);
    const [error, setError] = React.useState<boolean>(false);

    React.useEffect(() => {
        setError(false);
        setEditCustomer(customer);
    }, [customer, open]);

    const handleSave = async () => {
        try {
            if (editCustomer) {
                setLoading(true);
                setError(false);
                const response = await fetch(
                    process.env.NEXT_PUBLIC_API_URL +
                        `/api/customers/${editCustomer.client_id}`,
                    {
                        method: "PUT",
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${getCookie("token")}`,
                        },
                        body: JSON.stringify(editCustomer),
                    }
                );
                if (!response.ok) {
                    throw new Error("Failed to update customer");
                }

                const updatedCustomer = await response.json();
                onSave(updatedCustomer);
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
            <CredenzaContent>
                <CredenzaHeader>
                    <CredenzaTitle>Modify customer information</CredenzaTitle>
                    <CredenzaDescription>
                        <p>change the customer information here</p>
                    </CredenzaDescription>
                </CredenzaHeader>

                {error && (
                    <Alert variant="destructive">
                        <AlertTriangle className="w-5 h-5" />
                        <AlertTitle>Failed to update customer</AlertTitle>
                        <AlertDescription>
                            Please check your information and try again.
                        </AlertDescription>
                    </Alert>
                )}
                <form className="flex flex-col w-full gap-2 p-4">
                    <div className="flex flex-col w-full gap-2 sm:flex-row">
                        <div className="flex flex-col w-full gap-2 sm:w-1/2">
                            <Label>First name</Label>
                            <Input
                                type="text"
                                value={editCustomer?.first_name || ""}
                                onChange={(e) =>
                                    setEditCustomer(
                                        (prev) =>
                                            prev && {
                                                ...prev,
                                                first_name: e.target.value,
                                            }
                                    )
                                }
                            />
                        </div>
                        <div className="flex flex-col w-full gap-2 sm:w-1/2">
                            <Label>Last name</Label>
                            <Input
                                type="text"
                                value={editCustomer?.last_name || ""}
                                onChange={(e) =>
                                    setEditCustomer(
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
                        <SearchAddress
                            location={
                                editCustomer?.street_address +
                                    " " +
                                    editCustomer?.city +
                                    " " +
                                    editCustomer?.state +
                                    " " +
                                    editCustomer?.postal_code +
                                    " " +
                                    editCustomer?.country || ""
                            }
                            onSelectLocation={(location) => {
                                setEditCustomer(
                                    (prev) =>
                                        prev && {
                                            ...prev,
                                            street_address:
                                                location?.raw.address
                                                    .house_number +
                                                    " " +
                                                    location?.raw.address
                                                        .road || "",
                                            city:
                                                location?.raw.address.town ||
                                                location?.raw.address
                                                    .municipality ||
                                                "",
                                            state:
                                                location?.raw.address.state ||
                                                "",
                                            postal_code:
                                                location?.raw.address
                                                    .postcode || "",
                                            country:
                                                location?.raw.address.country ||
                                                "",
                                        }
                                );
                            }}
                        />
                    </div>
                    <div className="flex flex-col w-full gap-2">
                        <Label>Email</Label>
                        <Input
                            type="email"
                            value={editCustomer?.email || ""}
                            onChange={(e) =>
                                setEditCustomer(
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
                        <PhoneInput
                            required
                            id="company.phone"
                            name="company.phone"
                            placeholder="Phone"
                            value={editCustomer?.phone || ""}
                            defaultCountry="FR"
                            onChange={(phone) =>
                                setEditCustomer(
                                    (prev) =>
                                        prev && {
                                            ...prev,
                                            phone,
                                        }
                                )
                            }
                        />
                    </div>
                </form>

                <CredenzaFooter>
                    <Button
                        disabled={
                            !editCustomer?.first_name ||
                            !editCustomer?.last_name ||
                            !editCustomer?.street_address ||
                            !editCustomer?.city ||
                            !editCustomer?.state ||
                            !editCustomer?.postal_code ||
                            !editCustomer?.country ||
                            !editCustomer?.email ||
                            !editCustomer?.phone ||
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

    const [customer, setCustomer] = React.useState<Customer | null>(null);
    const [loading, setLoading] = React.useState<boolean>(true);
    const [monthlyInvoice, setMonthlyInvoice] = React.useState<
        Array<{ month: string; amount: number }>
    >([]);

    React.useEffect(() => {
        const fetchMonthlyInvoice = async () => {
            try {
                const response = await fetch(
                    process.env.NEXT_PUBLIC_API_URL +
                        `/api/customers/${id}/monthly-revenue`,
                    {
                        method: "GET",
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${getCookie("token")}`,
                        },
                    }
                );
                if (!response.ok) {
                    throw new Error("Failed to fetch monthly invoice");
                }

                const data = await response.json();
                const formattedData = Object.entries(data.monthlyRevenue).map(
                    ([month, amount]) => ({
                        month,
                        amount,
                    })
                );
                setMonthlyInvoice(formattedData as any);
            } catch (error) {
                console.error(error);
            }
        };
        fetchMonthlyInvoice();
    }, [id]);

    React.useEffect(() => {
        const fetchCustomer = async () => {
            try {
                const response = await fetch(
                    process.env.NEXT_PUBLIC_API_URL + `/api/customers/${id}`,
                    {
                        method: "GET",
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${getCookie("token")}`,
                        },
                    }
                );
                if (!response.ok) {
                    throw new Error("Failed to fetch customer");
                }

                const data = await response.json();
                setCustomer(data);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchCustomer();
    }, [id]);

    React.useEffect(() => {
        const fetchCustomerInvoices = async () => {
            try {
                const response = await fetch(
                    process.env.NEXT_PUBLIC_API_URL +
                        `/api/customers/${id}/invoices`,
                    {
                        method: "GET",
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${getCookie("token")}`,
                        },
                    }
                );
                if (!response.ok) {
                    throw new Error("Failed to fetch customer invoices");
                }

                const data = await response.json();
                setCustomer(
                    (prev) =>
                        prev && {
                            ...prev,
                            invoices: data,
                        }
                );
            } catch (error) {
                console.error(error);
            }
        };
        fetchCustomerInvoices();
    }, [id]);

    const handleUpdateCustomer = (updatedCustomer: Customer) => {
        setCustomer(updatedCustomer);
    };

    return (
        <ContentLayout title="Customer details">
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
                        <div className="flex flex-col w-full items-center justify-between sm:flex-row sm:items-center sm:justify-between gap-6">
                            <h1 className="text-3xl font-semibold">
                                {customer
                                    ? `${customer.first_name} ${customer.last_name}`
                                    : ""}
                            </h1>
                            <div className="flex items-center gap-2">
                                <EditCustomerDialog
                                    customer={customer}
                                    onClose={() => {}}
                                    onSave={handleUpdateCustomer}
                                />
                                <AlertDeleteCustomer />
                            </div>
                        </div>
                        <div className="flex flex-col w-full  sm:flex-row gap-6">
                            <div className="flex w-full sm:w-1/2 flex-col gap-6">
                                <Card className="flex flex-col justify-center  ">
                                    <CardHeader>
                                        <CardTitle>
                                            Contact information
                                        </CardTitle>
                                        <CardDescription>
                                            Basic customer information
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="flex gap-2">
                                            <span className="font-semibold">
                                                Email :{" "}
                                            </span>{" "}
                                            {customer?.email}
                                        </div>
                                        <div className="flex gap-2">
                                            <span className="font-semibold">
                                                Phone :{" "}
                                            </span>{" "}
                                            {customer?.phone}
                                        </div>
                                    </CardContent>
                                </Card>
                                <Card className="flex flex-col ">
                                    <CardHeader>
                                        <CardTitle>Address</CardTitle>
                                        <CardDescription>
                                            Customer address
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="flex gap-2 break-word">
                                            <span className="font-semibold">
                                                Street address:
                                            </span>{" "}
                                            {customer?.street_address}
                                        </div>
                                        <div className="flex gap-2">
                                            <span className="font-semibold">
                                                City:
                                            </span>{" "}
                                            {customer?.city}
                                        </div>
                                        <div className="flex gap-2">
                                            <span className="font-semibold">
                                                State:
                                            </span>{" "}
                                            {customer?.state}
                                        </div>
                                        <div className="flex gap-2">
                                            <span className="font-semibold">
                                                Postal code:
                                            </span>{" "}
                                            {customer?.postal_code}
                                        </div>
                                        <div className="flex gap-2">
                                            <span className="font-semibold">
                                                Country:
                                            </span>{" "}
                                            {customer?.country}
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                            <div className="flex w-full sm:w-1/2">
                                <Card className="w-full">
                                    <CardHeader>
                                        <CardTitle>Invoices</CardTitle>
                                        <CardDescription>
                                            Monthly revenue
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        {monthlyInvoice.length === 0 ? (
                                            <Alert>
                                                <AlertTriangle className="w-5 h-5" />
                                                <AlertTitle>
                                                    No invoices found
                                                </AlertTitle>
                                                <AlertDescription>
                                                    There are no invoices paid
                                                    by this customer.
                                                </AlertDescription>
                                            </Alert>
                                        ) : (
                                            <ResponsiveContainer
                                                width="100%"
                                                height={300}
                                            >
                                                <BarChart data={monthlyInvoice}>
                                                    <XAxis
                                                        dataKey="month"
                                                        name="Month"
                                                    />
                                                    <YAxis name="Amount" />
                                                    <Tooltip />
                                                    <Bar
                                                        dataKey="amount"
                                                        fill="#009933"
                                                    />
                                                </BarChart>
                                            </ResponsiveContainer>
                                        )}
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                        <Card>
                            <CardHeader>
                                <CardTitle>Invoices</CardTitle>
                                <CardDescription>
                                    Invoices paid by this customer
                                </CardDescription>
                            </CardHeader>
                            <TableInvoices
                                invoices={customer?.invoices}
                                search={""}
                            />
                        </Card>
                    </>
                )}
            </div>
        </ContentLayout>
    );
}
