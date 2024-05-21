"use client";
import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
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
import { ClipLoader } from "react-spinners";
import { cn } from "@/lib/utils";

type Props = {};

type Invoice = {
  invoice_id: number;
  invoice_date: Date;
  company: {
    name: string;
    street_address: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
    phone: string;
    email: string;
    vat_number: string;
  };
  client: {
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    street_address: string;
    state: string;
    country: string;
    city: string;
    postal_code: string;
  };
  items: Array<{
    description: string;
    item_id: number;
    total_price: number;
    quantity: number;
    unit_price: number;
    vat_rate: number;
    vat_amount: number;
  }>;
  status: string;
  total_amount: number;
  due_date: string;
  payments: Array<{
    payment_method: "cash" | "credit_card" | "bank_transfer";
    amount: number;
    payment_date: Date;
  }>;
};

export default function Page({}: Props) {
  const { id } = useParams();

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
              Authorization: `Bearer ${process.env.NEXT_PUBLIC_API_KEY}`,
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

  return (
    <div className="flex flex-col flex-1 gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Invoices / {id}</h1>
        <Button variant={"outline"} className="flex items-center gap-2">
          <Download size={16} />
          Download
        </Button>
      </div>

      <Card className="flex flex-col justify-between gap-10 p-6 md:flex-row">
        <div className="flex flex-col w-full gap-4 md:w-1/2">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold">Invoice ID</h2>
            <p className="flex w-24 text-sm items-start">
              {invoice?.invoice_id}
            </p>
          </div>
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold">Invoice Date </h2>
            <p className="flex w-24 text-sm items-start">{formattedDate}</p>
          </div>

          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold">Status</h2>
            <p className="flex w-24 text-sm items-start">{invoice?.status}</p>
          </div>
        </div>
        <div className="flex flex-col w-full gap-4 md:w-1/2">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold">Due</h2>
            <p className="flex w-24 text-sm items-start">{formattedDueDate}</p>
          </div>
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold">Method of Payment </h2>
            <p className="flex w-24 text-sm items-start">
              {invoice?.payments[0]?.payment_method ?? "N/A"}
            </p>
          </div>
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold">Total Amount</h2>
            <p className="flex w-24 text-sm items-start">
              {invoice?.total_amount}
            </p>
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
