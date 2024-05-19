"use client";
import React from "react";
import { useRouter } from "next/navigation";

import { ModeToggle } from "@/components/ui/toggle-theme";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ClipLoader } from "react-spinners";

import { LiaFileInvoiceDollarSolid } from "react-icons/lia";
import { PiUsersThree } from "react-icons/pi";

import { cn } from "@/lib/utils";
import Image from "next/image";

type Props = {};

type Data = {
  numberOfUnpaidInvoices: number;
  numberOfLatePaymentInvoices: number;
  numberOfInvoicesThisMonth: number;
  numberOfClients: number;
  latestInvoices: Array<{
    client: {
      first_name: string;
      last_name: string;
    };
    invoice_id: number;
    client_id: number;
    user_id: number;
    company_id: number;
    invoice_date: string;
    due_date: string;
    total_amount: number;
    status: string;
    createdAt: string;
    updatedAt: string;
  }>;
  user: {
    first_name: string;
    last_name: string;
  };
};

export default function Page({}: Props) {
  const router = useRouter();

  const [data, setData] = React.useState<Data>({
    numberOfUnpaidInvoices: 0,
    numberOfLatePaymentInvoices: 0,
    numberOfInvoicesThisMonth: 0,
    numberOfClients: 0,
    latestInvoices: [],
    user: {
      first_name: "",
      last_name: "",
    },
  });
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<Boolean>(false);

  const fetchData = async () => {
    setLoading(true);
    setError(false);
    try {
      const response = await fetch(
        process.env.NEXT_PUBLIC_API_URL + "/api/dashboard",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_API_KEY}`,
          },
          cache: "no-cache",
        }
      );
      if (!response.ok) {
        throw new Error("Error fetching data");
      }
      const data = await response.json();
      setData(data);
    } catch (error) {
      console.error("Error fetching data: ", error);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col w-full h-full justify-center items-center gap-6">
        <ClipLoader color="#009933" size={50} />
      </div>
    );
  }

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
        <Button onClick={fetchData}>Retry</Button>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col w-full h-full p-6 gap-6 ")}>
      <div className="flex flex-col w-full gap-6">
        <div className="flex w-full justify-between ">
          <h1 className="text-s font-light">
            <span className={cn("text-xl", "text-primary")}>Hi!</span>{" "}
            {data?.numberOfLatePaymentInvoices > 0
              ? "You have " +
                data?.numberOfLatePaymentInvoices +
                " late payment invoices"
              : "You have no late payment invoices"}
          </h1>
          <ModeToggle />
        </div>
        <h1 className="text-2xl font-semibold">
          {data?.user?.first_name}&apos;s Dashboard
        </h1>
      </div>
      <div className="flex w-full gap-6">
        <Card className="flex items-center w-1/3 p-4 gap-6">
          <div
            className={cn(
              "flex items-center justify-center p-2 rounded-full bg-primary"
            )}
          >
            <LiaFileInvoiceDollarSolid
              className={cn("text-primary-foreground")}
              size={32}
            />
          </div>
          <div className="flex flex-col w-full">
            <CardTitle className="text-xl font-semibold">
              Unpaid invoice
            </CardTitle>
            <h1 className="text-4xl font-light">
              {data?.numberOfUnpaidInvoices || 0}
            </h1>
          </div>
        </Card>
        <Card className="flex items-center w-1/3 p-4 gap-6">
          <div
            className={cn(
              "flex items-center justify-center p-2 rounded-full bg-primary"
            )}
          >
            <PiUsersThree className={cn("text-primary-foreground")} size={32} />
          </div>
          <div className="flex flex-col w-full">
            <CardTitle className="text-xl font-semibold">Customers</CardTitle>
            <h1 className="text-4xl font-light">
              {data?.numberOfClients || 0}
            </h1>
          </div>
        </Card>
        <Card className="flex items-center w-1/3 p-4 gap-6">
          <div
            className={cn(
              "flex items-center justify-center p-2 rounded-full bg-primary"
            )}
          >
            <LiaFileInvoiceDollarSolid
              className={cn("text-primary-foreground")}
              size={32}
            />
          </div>
          <div className="flex flex-col w-full">
            <CardTitle className="text-xl font-semibold">
              Invoice this month
            </CardTitle>
            <h1 className="text-4xl font-light">
              {data?.numberOfInvoicesThisMonth || 0}
            </h1>
          </div>
        </Card>
      </div>
      <div className="flex w-1/2 h-full overflow-auto gap-6">
        <Card className="flex flex-col justify-between w-full h-full  p-4 gap-6">
          <Table className="w-full h-full ">
            <TableHeader>
              <TableHead>InvoiceId</TableHead>
              <TableHead>firstname</TableHead>
              <TableHead>lastname</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Due date</TableHead>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : data?.latestInvoices?.length === 0 ||
                data?.latestInvoices === undefined ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center">
                    No invoices
                  </TableCell>
                </TableRow>
              ) : (
                data?.latestInvoices?.map((invoice) => (
                  <TableRow key={invoice.invoice_id}>
                    <TableCell>{invoice.invoice_id}</TableCell>
                    <TableCell>{invoice.client.first_name}</TableCell>
                    <TableCell>{invoice.client.last_name}</TableCell>
                    <TableCell>{invoice.status}</TableCell>
                    <TableCell>{invoice.total_amount} €</TableCell>
                    <TableCell>{invoice.due_date}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          <Button
            onClick={() => {
              router.push("/dashboard/invoices");
            }}
            className="w-full "
          >
            View all invoices
          </Button>
        </Card>
      </div>
    </div>
  );
}
