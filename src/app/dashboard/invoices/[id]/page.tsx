"use client";
import React, { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";

import { Invoice } from "@/types/Invoice";
import { Customer } from "@/types/Customer";
import { Item } from "@/types/Item";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Download, Edit, Plus, Save } from "lucide-react";
import { Card } from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
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

import { Calendar } from "@/components/ui/calendar";
import { useToast } from "@/components/ui/use-toast";
import { ToastAction } from "@/components/ui/toast";

import { ClipLoader } from "react-spinners";
import { cn } from "@/lib/utils";
import { getCookie } from "cookies-next";
import { Badge } from "@/components/ui/badge";

import { ChevronDownIcon } from "lucide-react";
import { MdOutlineEdit, MdDeleteOutline } from "react-icons/md";
import { ContentLayout } from "@/components/admin-panel/content-layout";

type Props = {};

const AlertDeleteInvoice = ({}) => {
    const [open, setOpen] = React.useState<boolean>(false);
    const { id } = useParams();
    const router = useRouter();

    const { toast } = useToast();

    const [loading, setLoading] = React.useState<boolean>(false);

    const onDelete = async () => {
        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/api/invoices/${id}`,
                {
                    method: "DELETE",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${getCookie("token")}`,
                    },
                }
            );

            if (!response.ok) {
                throw new Error("Failed to delete invoice");
            }

            router.push("/dashboard/invoices");
            toast({
                title: "Success",
                description: "Invoice deleted successfully",
            });
        } catch (error) {
            console.error(error);
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to delete invoice",
                action: (
                    <ToastAction altText="Retry" onClick={onDelete}>
                        Retry
                    </ToastAction>
                ),
            });
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
                    <CredenzaTitle>Delete Invoice</CredenzaTitle>
                </CredenzaHeader>
                <CredenzaDescription>
                    <p>Are you sure you want to delete this invoice?</p>
                </CredenzaDescription>
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

export default function Page({}: Props) {
    const { id } = useParams();
    const router = useRouter();
    const { toast } = useToast();

    const [invoice, setInvoice] = useState<Invoice | null>(null);
    const [loading, setLoading] = useState(true);
    const [customerLoading, setCustomerLoading] = useState(true);
    const [open, setOpen] = useState(false);
    const [editOpen, setEditOpen] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
        null
    );
    const [search, setSearch] = useState("");
    const [error, setError] = useState(false);
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [items, setItems] = useState<Item[]>([]);

    const fetchCustomers = useCallback(async () => {
        try {
            setCustomerLoading(true);
            setError(false);
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/api/customers?${
                    search ? `search=${search}` : ""
                }`,
                {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${getCookie("token")}`,
                    },
                }
            );

            if (!response.ok) {
                throw new Error("Failed to fetch customers");
            }

            const data = await response.json();
            setCustomers(data || []);
        } catch (error) {
            console.error(error);
            setError(true);
        } finally {
            setCustomerLoading(false);
        }
    }, [search]);

    const handleChangeCustomer = async (customer: Customer) => {
        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/api/invoices/${id}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${getCookie("token")}`,
                    },
                    body: JSON.stringify({ client_id: customer.client_id }),
                }
            );

            if (!response.ok) {
                throw new Error("Failed to update customer");
            }

            toast({
                title: "Success",
                description: "Customer updated successfully",
            });
            setInvoice((prev) => (prev ? { ...prev, client: customer } : prev));
        } catch (error) {
            console.error(error);
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to update customer",
                action: (
                    <ToastAction
                        altText="Retry"
                        onClick={() => handleChangeCustomer(customer)}
                    >
                        Retry
                    </ToastAction>
                ),
            });
        }
    };

    useEffect(() => {
        const delayDebounceFn = setTimeout(fetchCustomers, 300);
        return () => clearTimeout(delayDebounceFn);
    }, [fetchCustomers]);

    useEffect(() => {
        const fetchInvoiceDetails = async () => {
            try {
                const response = await fetch(
                    `${process.env.NEXT_PUBLIC_API_URL}/api/invoices/${id}`,
                    {
                        method: "GET",
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${getCookie("token")}`,
                        },
                    }
                );
                if (!response.ok) {
                    throw new Error("Failed to fetch invoice");
                }

                const data = await response.json();
                setInvoice(data);
                setItems(data.items);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        fetchInvoiceDetails();
    }, [id]);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-full w-full">
                <ClipLoader color="#009933" />
            </div>
        );
    }

    const formattedDate = new Date(
        invoice?.invoice_date ?? ""
    ).toLocaleDateString();
    const formattedDueDate = new Date(
        invoice?.due_date ?? ""
    ).toLocaleDateString();

    const formatDate = (date: Date | string): string => {
        const d = new Date(date);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, "0");
        const day = String(d.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
    };

    let totalAmountWithoutVAT = 0;
    let totalAmount = 0;

    if (invoice?.items) {
        for (let item of invoice.items) {
            const itemTotal = item.unit_price * item.quantity;
            const itemVAT = (item.vat_rate / 100) * itemTotal;
            totalAmountWithoutVAT += itemTotal;
            totalAmount += itemTotal + itemVAT;
        }
    }

    const handleDownload = async () => {
        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/api/invoices/${id}/pdf`,
                {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${getCookie("token")}`,
                    },
                }
            );

            if (!response.ok) {
                throw new Error("Failed to download invoice");
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `${invoice?.invoice_id}.pdf`;
            document.body.appendChild(a);
            a.click();
            a.remove();
        } catch (error) {
            console.error(error);
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to download invoice",
            });
        }
    };

    const handleChangeStatus = async (status: string) => {
        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/api/invoices/${id}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${getCookie("token")}`,
                    },
                    body: JSON.stringify({ status }),
                }
            );

            if (!response.ok) {
                throw new Error("Failed to update status");
            }

            toast({
                title: "Success",
                description: "Status updated successfully",
            });
            setInvoice((prev) => (prev ? { ...prev, status } : prev));
        } catch (error) {
            console.error(error);
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to update status of invoice",
                action: (
                    <ToastAction
                        altText="Retry"
                        onClick={() => handleChangeStatus(status)}
                    >
                        Retry
                    </ToastAction>
                ),
            });
        }
    };

    // const handleChangePaymentMethod = async (payment_method: string) => {
    //     try {
    //         const response = await fetch(
    //             `${process.env.NEXT_PUBLIC_API_URL}/api/payments/${id}`,
    //             {
    //                 method: "PUT",
    //                 headers: {
    //                     "Content-Type": "application/json",
    //                     Authorization: `Bearer ${getCookie("token")}`,
    //                 },
    //                 body: JSON.stringify({ payment_method }),
    //             }
    //         );

    //         if (!response.ok) {
    //             throw new Error("Failed to update payment method");
    //         }

    //         toast({
    //             title: "Success",
    //             description: "Payment method updated successfully",
    //         });
    //         setInvoice((prev) =>
    //             prev
    //                 ? { ...prev, payments: { payment_method } }
    //                 : (prev as Invoice | null)
    //         );
    //     } catch (error) {
    //         console.error(error);
    //         toast({
    //             variant: "destructive",
    //             title: "Error",
    //             description: "Failed to update payment method",
    //             action: (
    //                 <ToastAction
    //                     altText="Retry"
    //                     onClick={() =>
    //                         handleChangePaymentMethod(payment_method)
    //                     }
    //                 >
    //                     Retry
    //                 </ToastAction>
    //             ),
    //         });
    //     }
    // };

    const handleSelectDueDate = async (date: Date) => {
        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/api/invoices/${id}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${getCookie("token")}`,
                    },
                    body: JSON.stringify({ due_date: formatDate(date) }),
                }
            );

            if (!response.ok) {
                throw new Error("Failed to update due date");
            }

            toast({
                title: "Success",
                description: "Due date updated successfully",
            });
            setInvoice((prev) =>
                prev
                    ? { ...prev, due_date: date.toISOString() }
                    : (prev as unknown as Invoice)
            );
        } catch (error) {
            console.error(error);
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to update due date",
                action: (
                    <ToastAction
                        altText="Retry"
                        onClick={() => handleSelectDueDate(date)}
                    >
                        Retry
                    </ToastAction>
                ),
            });
        }
    };

    const handleChangeItem = (index: number, key: string, value: string) => {
        const newItems = items.map((item, i) =>
            i === index ? { ...item, [key]: value } : item
        );
        setItems(newItems);
    };

    const handleDeleteItem = (index: number) => {
        const newItems = items.filter((_, i) => i !== index);
        setItems(newItems);
    };

    const addItem = () => {
        setItems((prev) => [
            ...prev,
            {
                description: "",
                item_id: items.length + 1,
                total_price: 0,
                quantity: 0,
                unit_price: 0,
                vat_rate: 0,
                vat_amount: 0,
            },
        ]);
    };

    const handleSaveItems = async () => {
        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/api/invoices/${id}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${getCookie("token")}`,
                    },
                    body: JSON.stringify({ items }),
                }
            );

            if (!response.ok) {
                throw new Error("Failed to update items");
            }

            const responseData = await response.json(); // Parse the response data

            toast({
                title: "Success",
                description: "Items updated successfully",
            });

            setInvoice((prev) =>
                prev ? { ...prev, items: responseData.items } : prev
            );

            setEditOpen(false);
        } catch (error) {
            console.error(error);
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to update items",
                action: (
                    <ToastAction altText="Retry" onClick={handleSaveItems}>
                        Retry
                    </ToastAction>
                ),
            });
        }
    };

    return (
        <ContentLayout title="Invoices details">
            <div className="flex flex-col flex-1 gap-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-semibold">Invoices / {id}</h1>
                    <div className="flex gap-4">
                        <Button
                            variant="outline"
                            className="flex items-center gap-2"
                            onClick={handleDownload}
                        >
                            <Download size={16} />
                            Download
                        </Button>

                        <AlertDeleteInvoice />
                    </div>
                </div>
                <Card className="flex flex-col justify-between gap-6 p-6 md:flex-row">
                    <div className="flex flex-col w-full gap-4 md:w-1/2">
                        <div className="flex items-center justify-between">
                            <h2 className="text-sm font-semibold">
                                Invoice ID
                            </h2>
                            <p className="flex text-sm text-right">
                                {invoice?.invoice_id}
                            </p>
                        </div>
                        <div className="flex items-center justify-between">
                            <h2 className="text-sm font-semibold">
                                Invoice Date
                            </h2>
                            <p className="flex text-sm text-right">
                                {formattedDate}
                            </p>
                        </div>

                        <div className="flex items-center justify-between">
                            <h2 className="text-sm font-semibold">Status</h2>
                            <div className="flex">
                                <Select
                                    defaultValue={invoice?.status}
                                    value={invoice?.status}
                                    onValueChange={handleChangeStatus}
                                >
                                    <SelectTrigger className="border-0 p-0 h-fit gap-2 bg-transparent focus:outline-none focus:ring-0 focus:ring-offset-0">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="paid">
                                            <Badge className="bg-green-500 text-white">
                                                paid
                                            </Badge>
                                        </SelectItem>
                                        <SelectItem value="pending">
                                            <Badge className="bg-yellow-500 text-white hover:bg-yellow-600">
                                                pending
                                            </Badge>
                                        </SelectItem>
                                        <SelectItem value="cancelled">
                                            <Badge className="bg-red-500 text-white hover:bg-red-600">
                                                cancelled
                                            </Badge>
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-col w-full gap-4 md:w-1/2">
                        <div className="flex items-center justify-between">
                            <h2 className="text-sm font-semibold">Due</h2>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        className="p-0 h-fit justify-start text-left font-normal hover:bg-transparent"
                                    >
                                        {invoice?.due_date
                                            ? formattedDueDate
                                            : "Select a date"}
                                        <ChevronDownIcon
                                            size={16}
                                            className="ml-2 opacity-50"
                                        />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                    <Calendar
                                        mode="single"
                                        selected={
                                            new Date(invoice?.due_date ?? "")
                                        }
                                        onSelect={(date) =>
                                            handleSelectDueDate(date as Date)
                                        }
                                        initialFocus
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>
                    </div>
                </Card>
                <div className="flex flex-col gap-6 md:flex-row">
                    <Card className="flex flex-col w-full gap-2 p-6">
                        <h2 className="text-lg font-semibold">My Company :</h2>
                        <div className="flex flex-col pl-2">
                            <h2 className="text-sm font-semibold">
                                {invoice?.company?.name}
                            </h2>
                            <p className="text-sm">
                                {invoice?.company?.street_address}
                            </p>
                            <p className="text-sm">
                                {invoice?.company?.city},{" "}
                                {invoice?.company?.state}{" "}
                                {invoice?.company?.postal_code}
                            </p>
                            <p className="text-sm">
                                {invoice?.company?.country}
                            </p>
                            <p className="text-sm">
                                <span className="font-semibold">Email:</span>{" "}
                                {invoice?.company?.email}
                            </p>
                            <p className="text-sm">
                                <span className="font-semibold">Phone:</span>{" "}
                                {invoice?.company?.phone}
                            </p>
                            <p className="text-sm">
                                <span className="font-semibold">
                                    VAT Number:
                                </span>{" "}
                                {invoice?.company?.vat_number}
                            </p>
                        </div>
                    </Card>
                    <Card className="relative flex flex-col w-full gap-2 p-6">
                        <Sheet open={open} onOpenChange={setOpen}>
                            <SheetTrigger asChild>
                                <MdOutlineEdit
                                    size={24}
                                    className="absolute top-2 right-2 cursor-pointer"
                                />
                            </SheetTrigger>
                            <SheetContent className="p-10">
                                <SheetHeader>
                                    <SheetTitle>
                                        <h1 className="text-2xl font-semibold">
                                            Select a customer
                                        </h1>
                                    </SheetTitle>
                                    <SheetDescription>
                                        <Input
                                            placeholder="Search customers"
                                            value={search}
                                            onChange={(e) =>
                                                setSearch(e.target.value)
                                            }
                                        />
                                    </SheetDescription>
                                </SheetHeader>
                                <div className="flex flex-col gap-2 mt-6">
                                    {customerLoading && (
                                        <div className="flex justify-center items-center">
                                            <ClipLoader
                                                color="#009933"
                                                size={20}
                                            />
                                        </div>
                                    )}
                                    {error && <p>Failed to fetch customers</p>}
                                    {customers.length === 0 &&
                                        !customerLoading && (
                                            <p>No customers found</p>
                                        )}
                                    {customers.map((customer) => (
                                        <Button
                                            variant="secondary"
                                            key={customer.client_id}
                                            onClick={() => {
                                                setSelectedCustomer(customer);
                                                setOpen(false);
                                                handleChangeCustomer(customer);
                                            }}
                                        >
                                            {customer.first_name}{" "}
                                            {customer.last_name}
                                        </Button>
                                    ))}
                                </div>
                            </SheetContent>
                        </Sheet>
                        <h2 className="text-lg font-semibold">Bill To :</h2>
                        <div className="flex flex-col pl-2">
                            <h2 className="text-sm font-semibold">
                                {invoice?.client?.first_name}{" "}
                                {invoice?.client?.last_name}
                            </h2>
                            <p className="text-sm">
                                {invoice?.client?.street_address}
                            </p>
                            <p className="text-sm">
                                {invoice?.client?.city},{" "}
                                {invoice?.client?.state}{" "}
                                {invoice?.client?.postal_code}
                            </p>
                            <p className="text-sm">
                                {invoice?.client?.country}
                            </p>
                            <p className="text-sm">
                                <span className="font-semibold">Email:</span>{" "}
                                {invoice?.client?.email}
                            </p>
                            <p className="text-sm">
                                <span className="font-semibold">Phone:</span>{" "}
                                {invoice?.client?.phone}
                            </p>
                        </div>
                    </Card>
                </div>
                <div className="relative">
                    {editOpen ? (
                        <>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Description</TableHead>
                                        <TableHead>Quantity</TableHead>
                                        <TableHead>Unit Price</TableHead>
                                        <TableHead>VAT Rate (in %)</TableHead>
                                        <TableHead></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {items.map((item, index) => (
                                        <TableRow key={index}>
                                            <TableCell>
                                                <Input
                                                    value={item.description}
                                                    placeholder="Description"
                                                    onChange={(e) =>
                                                        handleChangeItem(
                                                            index,
                                                            "description",
                                                            e.target.value
                                                        )
                                                    }
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Input
                                                    type="number"
                                                    value={item.quantity}
                                                    onChange={(e) =>
                                                        handleChangeItem(
                                                            index,
                                                            "quantity",
                                                            e.target.value
                                                        )
                                                    }
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Input
                                                    type="number"
                                                    value={item.unit_price}
                                                    onChange={(e) =>
                                                        handleChangeItem(
                                                            index,
                                                            "unit_price",
                                                            e.target.value
                                                        )
                                                    }
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Input
                                                    type="number"
                                                    value={item.vat_rate}
                                                    onChange={(e) =>
                                                        handleChangeItem(
                                                            index,
                                                            "vat_rate",
                                                            e.target.value
                                                        )
                                                    }
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Button
                                                    variant="destructive"
                                                    onClick={() =>
                                                        handleDeleteItem(index)
                                                    }
                                                >
                                                    Delete
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                            <div className="flex gap-4 mt-4 justify-end">
                                <Button
                                    className="flex gap-1"
                                    onClick={addItem}
                                >
                                    <Plus size={20} />
                                    Add Item
                                </Button>
                                <Button
                                    className="flex gap-1"
                                    onClick={handleSaveItems}
                                >
                                    <Save size={20} />
                                    Save Items
                                </Button>
                            </div>
                        </>
                    ) : (
                        <>
                            <Table>
                                <TableHeader className="bg-secondary">
                                    <TableRow>
                                        <TableHead>Description</TableHead>
                                        <TableHead>Quantity</TableHead>
                                        <TableHead>Unit Price</TableHead>
                                        <TableHead>VAT Rate (in %)</TableHead>
                                        <TableHead>VAT Amount</TableHead>
                                        <TableHead>
                                            Total Price (VAT incl.)
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {invoice?.items?.map((item, index) => (
                                        <TableRow key={item.item_id}>
                                            <TableCell>
                                                {item.description}
                                            </TableCell>
                                            <TableCell>
                                                {item.quantity}
                                            </TableCell>
                                            <TableCell>
                                                ${item.unit_price}
                                            </TableCell>
                                            <TableCell>
                                                {item.vat_rate}
                                            </TableCell>
                                            <TableCell>
                                                ${item.vat_amount}
                                            </TableCell>
                                            <TableCell>
                                                $
                                                {item.unit_price *
                                                    item.quantity +
                                                    (item.vat_rate / 100) *
                                                        item.unit_price *
                                                        item.quantity}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                            <Edit
                                size={20}
                                className="absolute top-[0.75rem] right-4 cursor-pointer"
                                onClick={() => setEditOpen(true)}
                            />
                        </>
                    )}
                </div>

                <div className="flex justify-end p-4">
                    <div className="w-full md:w-1/4">
                        <div className="flex justify-between">
                            <h2 className="text-sm font-semibold">
                                Total Amount (VAT excl.)
                            </h2>
                            <p className="flex w-24 text-sm items-start text-right">
                                ${totalAmountWithoutVAT.toFixed(2)}
                            </p>
                        </div>
                        <div className="flex justify-between">
                            <h2 className="text-sm font-semibold">
                                VAT Amount
                            </h2>
                            <p className="flex w-24 text-sm items-start text-right">
                                $
                                {(totalAmount - totalAmountWithoutVAT).toFixed(
                                    2
                                )}
                            </p>
                        </div>
                        <div className="flex justify-between">
                            <h2 className="text-sm font-semibold">
                                Total Amount (VAT incl.)
                            </h2>
                            <p className="flex w-24 text-sm items-start text-right">
                                ${totalAmount.toFixed(2)}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </ContentLayout>
    );
}
