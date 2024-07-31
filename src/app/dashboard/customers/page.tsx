"use client";
import React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import dynamic from "next/dynamic";

import { Customer } from "@/types/Customer";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
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
import { ClipLoader } from "react-spinners";
import { getCookie } from "cookies-next";

import { PiPlus } from "react-icons/pi";
import { ContentLayout } from "@/components/admin-panel/content-layout";
const SearchAddress = dynamic(() => import("@/components/ui/search-address"), {
    ssr: false,
});
import { PhoneInput } from "@/components/ui/phone-input";

type Props = {};

const AddCustomerDialog = ({
    onSave,
}: {
    onSave: (newCustomer: Customer) => void;
}) => {
    const searchParams = useSearchParams();
    const [newCustomer, setNewCustomer] = React.useState<Customer>(
        {} as Customer
    );
    const [loading, setLoading] = React.useState<boolean>(false);
    const [open, setOpen] = React.useState<boolean>(
        searchParams.get("add") === "true" ? true : false
    );

    const handleAdd = async (event: React.FormEvent) => {
        event.preventDefault();
        try {
            setLoading(true);
            const response = await fetch(
                process.env.NEXT_PUBLIC_API_URL + "/api/customers",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${getCookie("token")}`,
                    },
                    body: JSON.stringify(newCustomer),
                }
            );
            if (!response.ok) {
                throw new Error("Failed to add customer");
            }

            const data = await response.json();
            onSave(data);
            setOpen(false);
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
                    className="flex items-center gap-2"
                    onClick={() => setOpen(true)}
                >
                    <PiPlus size={20} />
                    Add customer
                </Button>
            </CredenzaTrigger>
            <CredenzaContent>
                <CredenzaHeader>
                    <CredenzaTitle>Add customer</CredenzaTitle>
                    <CredenzaDescription>
                        <p>Fill the form below to add a new customer</p>
                    </CredenzaDescription>
                </CredenzaHeader>

                <form
                    className="flex flex-col w-full gap-6 p-3"
                    onSubmit={handleAdd}
                >
                    <div className="flex flex-col gap-2 sm:flex-row">
                        <div className="flex flex-col w-full gap-2 sm:w-1/2">
                            <Label htmlFor="first_name">First name</Label>
                            <Input
                                id="first_name"
                                value={newCustomer.first_name}
                                onChange={(e) =>
                                    setNewCustomer({
                                        ...newCustomer,
                                        first_name: e.target.value,
                                    })
                                }
                            />
                        </div>
                        <div className="flex flex-col w-full gap-2 sm:w-1/2">
                            <Label htmlFor="last_name">Last name</Label>
                            <Input
                                id="last_name"
                                value={newCustomer.last_name}
                                onChange={(e) =>
                                    setNewCustomer({
                                        ...newCustomer,
                                        last_name: e.target.value,
                                    })
                                }
                            />
                        </div>
                    </div>
                    <div className="flex flex-col w-full gap-2">
                        <Label htmlFor="street_address">Street address</Label>
                        <SearchAddress
                            onSelectLocation={(location) => {
                                setNewCustomer({
                                    ...newCustomer,
                                    street_address:
                                        location?.raw.address.house_number +
                                            " " +
                                            location?.raw.address.road || "",
                                    city:
                                        location?.raw.address.town ||
                                        location?.raw.address.municipality ||
                                        "",
                                    state: location?.raw.address.state || "",
                                    postal_code:
                                        location?.raw.address.postcode || "",
                                    country:
                                        location?.raw.address.country || "",
                                });
                            }}
                        />
                    </div>
                    <div className="flex flex-col w-full gap-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            value={newCustomer.email}
                            onChange={(e) =>
                                setNewCustomer({
                                    ...newCustomer,
                                    email: e.target.value,
                                })
                            }
                        />
                    </div>
                    <div className="flex flex-col w-full gap-2">
                        <Label htmlFor="phone">Phone</Label>
                        <PhoneInput
                            required
                            id="company.phone"
                            name="company.phone"
                            placeholder="Phone"
                            type="text"
                            value={newCustomer.phone}
                            defaultCountry="FR"
                            onChange={(phone) =>
                                setNewCustomer({
                                    ...newCustomer,
                                    phone,
                                })
                            }
                        />
                    </div>
                </form>
                <CredenzaFooter>
                    <Button
                        type="submit"
                        disabled={
                            !newCustomer.first_name ||
                            !newCustomer.last_name ||
                            !newCustomer.street_address ||
                            !newCustomer.city ||
                            !newCustomer.state ||
                            !newCustomer.postal_code ||
                            !newCustomer.country ||
                            !newCustomer.email ||
                            !newCustomer.phone ||
                            loading
                        }
                    >
                        {loading ? "Adding..." : "Add"}
                    </Button>
                    <CredenzaClose asChild>
                        <Button variant="outline" disabled={loading}>
                            Cancel
                        </Button>
                    </CredenzaClose>
                </CredenzaFooter>
            </CredenzaContent>
        </Credenza>
    );
};

export default function Page({}: Props) {
    const router = useRouter();

    const [customers, setCustomers] = React.useState<Customer[]>([]);
    const [search, setSearch] = React.useState<string>("");
    const [loading, setLoading] = React.useState<boolean>(true);
    const [error, setError] = React.useState<boolean>(false);

    const fetchCustomers = React.useCallback(async () => {
        try {
            setLoading(true);
            setError(false);
            const response = await fetch(
                process.env.NEXT_PUBLIC_API_URL +
                    "/api/customers?" +
                    `${search ? `search=${search}` : ""}`,
                {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${getCookie("token")}`,
                    },
                }
            );
            if (!response.ok) {
                throw new Error("Failed to fetch invoices");
            }

            const data = await response.json();
            setCustomers(data);
            console.log(data);
        } catch (error) {
            console.error(error);
            setError(true);
        } finally {
            setLoading(false);
        }
    }, [search]);

    React.useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            fetchCustomers();
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [fetchCustomers]);

    const handleSelectCustomer = (customerId: number) => {
        router.push(`/dashboard/customers/${customerId}`);
    };

    if (error) {
        console.error("Error fetching data");
        return (
            <div className="flex flex-col w-full h-full justify-center items-center gap-6">
                <Image
                    src={"/assets/illustrations/illu_error.svg"}
                    width={200}
                    height={200}
                    alt="Error"
                />
                <h1 className="text-2xl font-semibold">
                    An error occurred while fetching data
                </h1>
                <Button onClick={fetchCustomers}>Retry</Button>
            </div>
        );
    }

    return (
        <ContentLayout title="Customers">
            <div className="flex flex-col w-full h-full gap-6">
                <div className="flex flex-col gap-10">
                    <div className="flex items-center justify-between">
                        <h1 className="text-2xl font-semibold">Customers</h1>
                        <AddCustomerDialog
                            onSave={(updatedCustomer) =>
                                setCustomers((prev) => [
                                    ...prev,
                                    updatedCustomer,
                                ])
                            }
                        />
                    </div>
                    <div className="flex flex-col w-full gap-6">
                        <div className="flex flex-col gap-6 xl:flex-row xl:justify-between">
                            <div className="flex w-full py-2 gap-6 xl:w-2/6">
                                <Input
                                    placeholder="Search customers by name, email, phone"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>
                </div>
                {loading ? (
                    <div className="flex justify-center items-center w-full h-full ">
                        <ClipLoader color="#009933" size={50} />
                    </div>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableHead>CliendId</TableHead>
                            <TableHead>Firstname</TableHead>
                            <TableHead>Lastname</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Phone</TableHead>
                            <TableHead>Country</TableHead>
                            <TableHead>Nb Invoices</TableHead>
                        </TableHeader>
                        <TableBody>
                            {customers?.length === 0 ? (
                                <TableRow>
                                    <TableCell
                                        colSpan={8}
                                        className="text-center"
                                    >
                                        {search
                                            ? "No customers found"
                                            : "No customers"}
                                    </TableCell>
                                </TableRow>
                            ) : (
                                customers?.map((customer) => (
                                    <TableRow
                                        key={customer.client_id}
                                        onClick={() =>
                                            handleSelectCustomer(
                                                customer.client_id
                                            )
                                        }
                                        className="cursor-pointer"
                                    >
                                        <TableCell>
                                            {customer.client_id}
                                        </TableCell>
                                        <TableCell>
                                            {customer.first_name}
                                        </TableCell>
                                        <TableCell>
                                            {customer.last_name}
                                        </TableCell>
                                        <TableCell>{customer.email}</TableCell>
                                        <TableCell>{customer.phone}</TableCell>
                                        <TableCell>
                                            {customer.country}
                                        </TableCell>
                                        <TableCell>
                                            {customer.invoice_count}
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                )}
            </div>
        </ContentLayout>
    );
}
