"use client";
import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";

import { Invoice } from "@/types/Invoice";

import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
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
import { Calendar } from "@/components/ui/calendar";
import { useToast } from "@/components/ui/use-toast";
import { ToastAction } from "@/components/ui/toast";

import { ClipLoader } from "react-spinners";
import { cn } from "@/lib/utils";
import { getCookie } from "cookies-next";
import { Badge } from "@/components/ui/badge";

import { ChevronDownIcon } from "lucide-react";

type Props = {};

export default function Page({}: Props) {
  const { id } = useParams();
  const { toast } = useToast();

  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

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

      setInvoice((prev: Invoice | null) => (prev ? { ...prev, status } : prev));
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update status",
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

  const handleChangePaymentMethod = async (payment_method: string) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/payments/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getCookie("token")}`,
          },
          body: JSON.stringify({ payment_method }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update payment method");
      }

      toast({
        title: "Success",
        description: "Payment method updated successfully",
      });

      setInvoice(
        (prev: Invoice | null) =>
          (prev
            ? {
                ...prev,
                payments: { payment_method },
              }
            : prev) as Invoice | null
      );
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update payment method",
        action: (
          <ToastAction
            altText="Retry"
            onClick={() => handleChangePaymentMethod(payment_method)}
          >
            Retry
          </ToastAction>
        ),
      });
    }
  };

  const handleSelectDueDate = async (date: Date) => {
    console.log(formatDate(date));
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

      setInvoice(
        (prev: Invoice | null) =>
          (prev ? { ...prev, due_date: date.toISOString() } : prev) as Invoice
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

  return (
    <div className="flex flex-col flex-1 gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Invoices / {id}</h1>
        <Button
          variant={"outline"}
          className="flex items-center gap-2"
          onClick={handleDownload}
        >
          <Download size={16} />
          Download
        </Button>
      </div>
      <Card className="flex flex-col justify-between gap-6 p-6 md:flex-row">
        <div className="flex flex-col w-full gap-4 md:w-1/2">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold">Invoice ID</h2>
            <p className="flex  text-sm text-right">{invoice?.invoice_id}</p>
          </div>
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold">Invoice Date </h2>
            <p className="flex  text-sm text-right">{formattedDate}</p>
          </div>

          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold">Status</h2>
            <div className="flex ">
              <Select
                defaultValue={invoice?.status}
                value={invoice?.status}
                onValueChange={(value) => handleChangeStatus(value)}
              >
                <SelectTrigger className="border-0 p-0 h-fit gap-2 bg-transparent focus:outline-none focus:ring-0 focus:border-0 focus-within:border-0 focus-within:ring-0 focus:ring-offset-0">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="paid">
                    <Badge className={cn("bg-green-500 text-white")}>
                      paid
                    </Badge>
                  </SelectItem>
                  <SelectItem value="pending">
                    <Badge
                      className={cn(
                        "bg-yellow-500 text-white hover:bg-yellow-600"
                      )}
                    >
                      pending
                    </Badge>
                  </SelectItem>
                  <SelectItem value="cancelled">
                    <Badge
                      className={cn("bg-red-500 text-white hover:bg-red-600")}
                    >
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
                  variant={"ghost"}
                  className={cn(
                    "p-0 h-fit justify-start text-left font-normal hover:bg-transparent"
                  )}
                >
                  {invoice?.due_date ? formattedDueDate : "Select a date"}
                  <ChevronDownIcon size={16} className="ml-2 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={new Date(invoice?.due_date ?? "")}
                  onSelect={(date) => handleSelectDueDate(date as Date)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold">Method of Payment </h2>
            <div className="flex ">
              <Select
                defaultValue={invoice?.payments?.payment_method ?? "N/A"}
                value={invoice?.payments?.payment_method ?? "N/A"}
                onValueChange={(value) => handleChangePaymentMethod(value)}
              >
                <SelectTrigger className="border-0 bg-transparent p-0 h-fit gap-2 focus:outline-none focus:ring-0 focus:border-0 focus-within:border-0 focus-within:ring-0 focus:ring-offset-0">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="credit_card">credit card</SelectItem>

                  <SelectItem value="bank_transfer">bank transfer</SelectItem>
                  <SelectItem value="cash">cash</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold">Total Amount</h2>
            <p className="flex  text-sm text-right">{invoice?.total_amount}</p>
          </div>
        </div>
      </Card>
      <div className="flex flex-col gap-6 md:flex-row">
        <Card className="flex flex-col w-full gap-2 p-6">
          <h2 className="text-lg font-semibold">My Company :</h2>
          <div className="flex flex-col pl-2">
            <h2 className="text-sm font-semibold">{invoice?.company?.name}</h2>
            <p className="text-sm">{invoice?.company?.street_address}</p>
            <p className="text-sm">
              {invoice?.company?.city}, {invoice?.company?.state}{" "}
              {invoice?.company?.postal_code}
            </p>
            <p className="text-sm">{invoice?.company?.country}</p>
            <p className="text-sm">
              <span className="font-semibold">Email:</span>{" "}
              {invoice?.company?.email}
            </p>
            <p className="text-sm">
              <span className="font-semibold">Phone:</span>{" "}
              {invoice?.company?.phone}
            </p>
            <p className="text-sm">
              <span className="font-semibold">VAT Number:</span>{" "}
              {invoice?.company?.vat_number}
            </p>
          </div>
        </Card>
        <Card className="flex flex-col w-full gap-2 p-6">
          <h2 className="text-lg font-semibold">Bill To :</h2>
          <div className="flex flex-col pl-2">
            <h2 className="text-sm font-semibold">
              {invoice?.client?.first_name} {invoice?.client?.last_name}
            </h2>
            <p className="text-sm">{invoice?.client?.street_address}</p>
            <p className="text-sm">
              {invoice?.client?.city}, {invoice?.client?.state}{" "}
              {invoice?.client?.postal_code}
            </p>
            <p className="text-sm">{invoice?.client?.country}</p>
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
      <Table>
        <TableHeader className={cn("bg-secondary")}>
          <TableHead>Description</TableHead>
          <TableHead>Quantity</TableHead>
          <TableHead>Unit Price</TableHead>
          <TableHead>VAT Rate</TableHead>
          <TableHead>VAT Amount</TableHead>
          <TableHead>Total Price (VAT incl.)</TableHead>
        </TableHeader>
        <TableBody>
          {invoice?.items?.map((item) => (
            <TableRow key={item.item_id}>
              <TableCell>{item.description}</TableCell>
              <TableCell>{item.quantity}</TableCell>
              <TableCell>${item.unit_price}</TableCell>
              <TableCell>{item.vat_rate}</TableCell>
              <TableCell>${item.vat_amount}</TableCell>
              <TableCell>
                $
                {item.unit_price * item.quantity +
                  (item.vat_rate / 100) * item.unit_price * item.quantity}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <div className="flex justify-end p-4">
        <div className="w-full md:w-1/4">
          <div className="flex justify-between">
            <h2 className="text-sm font-semibold">Total Amount (VAT excl.)</h2>
            <p className="flex w-24 text-sm items-start text-right">
              ${totalAmountWithoutVAT.toFixed(2)}
            </p>
          </div>
          <div className="flex justify-between">
            <h2 className="text-sm font-semibold">Total Amount (VAT incl.)</h2>
            <p className="flex w-24 text-sm items-start text-right">
              ${totalAmount.toFixed(2)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
