"use client";
import React from "react";
import { useSearchParams, useRouter } from "next/navigation";

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
import { ClipLoader } from "react-spinners";

import { Search } from "lucide-react";
import { PiPlus } from "react-icons/pi";

type Props = {};

type Invoice = {
  invoice_id: number;
  client: {
    first_name: string;
    last_name: string;
  };
  items: Array<{
    description: string;
    quantity: number;
    unit_price: number;
  }>;
  status: string;
  total_amount: number;
  due_date: string;
};

export default function Page({}: Props) {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [invoices, setInvoices] = React.useState<Invoice[]>([]);
  const [filter, setFilter] = React.useState<string>(
    searchParams.get("filter") || "all"
  );
  const [loading, setLoading] = React.useState<boolean>(true);

  React.useEffect(() => {
    const fetchInvoices = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          process.env.NEXT_PUBLIC_API_URL +
            "/api/invoices" +
            `${filter === "all" ? "" : `?status=${filter}`}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${process.env.NEXT_PUBLIC_API_KEY}`,
            },
          }
        );
        if (!response.ok) {
          throw new Error("Failed to fetch invoices");
        }

        const data = await response.json();
        setInvoices(data.rows);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchInvoices();
  }, [filter]);

  const handleChangeFilter = (filter: string) => {
    setFilter(filter);
  };

  const handleSelectInvoice = (invoiceId: number) => {
    router.push(`/dashboard/invoices/${invoiceId}`);
  };

  return (
    <div className="flex flex-col w-full h-full gap-6 p-6">
      <div className="flex flex-col gap-10">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Invoices</h1>
          <Button>
            <PiPlus className="mr-2" size={20} />
            New Invoice
          </Button>
        </div>
        <div className="flex flex-col w-full overflow-auto gap-6">
          <div className="flex justify-between gap-6">
            <div className="flex w-1/2 gap-2">
              <Button
                variant={filter === "all" ? "default" : "outline"}
                onClick={() => handleChangeFilter("all")}
              >
                All
              </Button>
              <Button
                variant={filter === "paid" ? "default" : "outline"}
                onClick={() => handleChangeFilter("paid")}
              >
                Paid
              </Button>
              <Button
                variant={filter === "pending" ? "default" : "outline"}
                onClick={() => handleChangeFilter("pending")}
              >
                Pending
              </Button>
            </div>

            <div className="flex w-2/6 p-2  gap-6">
              <Input placeholder="Search" />
              <Button className="flex gap-2">
                <Search size={16} />
                Search
              </Button>
            </div>
          </div>
        </div>
      </div>
      {loading ? (
        <div className="flex justify-center items-center w-full h-full">
          <ClipLoader color="#009933" />
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableHead>InvoiceId</TableHead>
            <TableHead>firstname</TableHead>
            <TableHead>lastname</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Lines</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Due date</TableHead>
          </TableHeader>
          <TableBody>
            {invoices?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center">
                  No invoices
                </TableCell>
              </TableRow>
            ) : (
              invoices?.map((invoice) => (
                <TableRow
                  key={invoice.invoice_id}
                  onClick={() => handleSelectInvoice(invoice.invoice_id)}
                  className="cursor-pointer"
                >
                  <TableCell>{invoice.invoice_id}</TableCell>
                  <TableCell>{invoice.client.first_name}</TableCell>
                  <TableCell>{invoice.client.last_name}</TableCell>
                  <TableCell>{invoice.status}</TableCell>
                  <TableCell>{invoice.items.length} </TableCell>
                  <TableCell>{invoice.total_amount} €</TableCell>
                  <TableCell>{invoice.due_date}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
