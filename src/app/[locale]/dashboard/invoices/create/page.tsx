"use client";
import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Customer } from "@/types/Customer";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ChevronDownIcon, Trash, Edit } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

import { useToast } from "@/components/ui/use-toast";
import { ToastAction } from "@/components/ui/toast";

import { getCookie } from "cookies-next";

type Props = {};

type Item = {
  description: string;
  quantity: number;
  unit_price: number;
  vat_rate: number;
};

export default function Page({}: Props) {
  const router = useRouter();
  const { toast } = useToast();

  const [open, setOpen] = useState<boolean>(false);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [search, setSearch] = useState<string>("");
  const [filter, setFilter] = useState<string>("all");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null
  );
  const [items, setItems] = useState<Item[]>([]);
  const [date, setDate] = useState<Date>(new Date());

  const handleCreateInvoice = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/invoices`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getCookie("token")}`,
          },
          body: JSON.stringify({
            due_date: new Date(),
            client_id: selectedCustomer?.client_id,
            items,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to create invoice");
      }

      const data = await response.json();

      toast({
        title: "Success",
        description: "Invoice created successfully",
      });
      router.push("/dashboard/invoices/" + data.invoice_id);
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create invoice",
        action: (
          <ToastAction
            altText="Retry"
            onClick={() => {
              handleCreateInvoice();
            }}
          >
            Retry
          </ToastAction>
        ),
      });
    }
  };

  const fetchCustomers = useCallback(async () => {
    try {
      setLoading(true);
      setError(false);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/customers?${
          filter === "all" ? "" : `status=${filter}&`
        }${search ? `search=${search}` : ""}`,
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
      setLoading(false);
    }
  }, [filter, search]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchCustomers();
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [fetchCustomers]);

  const addItem = () => {
    setItems([
      ...items,
      { description: "", quantity: 1, unit_price: 0, vat_rate: 0 },
    ]);
  };

  const handleDeleteItem = (index: number) => {
    const newItems = items.filter((_, i) => i !== index);
    setItems(newItems);
  };

  const handleChangeItem = (index: number, field: string, value: string) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: parseFloat(value) || 0 };
    setItems(newItems);
  };

  const calculateSubtotal = () => {
    return items
      .reduce((total, item) => total + item.quantity * item.unit_price, 0)
      .toFixed(2);
  };

  const calculateTax = () => {
    return items
      .reduce(
        (total, item) =>
          total + (item.quantity * item.unit_price * item.vat_rate) / 100,
        0
      )
      .toFixed(2);
  };

  const calculateTotal = () => {
    return (
      parseFloat(calculateSubtotal()) + parseFloat(calculateTax())
    ).toFixed(2);
  };

  return (
    <div className="flex flex-col w-full h-full gap-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Create Invoice</h1>
      </div>
      <div className="flex flex-col gap-6">
        <div className="flex gap-2">
          <div className="flex flex-col items-start w-96 gap-2">
            <Label>Due date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full flex items-center justify-between"
                >
                  {date.toLocaleDateString() ?? "Select a date"}
                  <ChevronDownIcon size={16} className="ml-2 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={new Date()}
                  onSelect={(date) => setDate(date ?? new Date())}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
        <div className="flex flex-col items-start w-96 gap-2">
          <Label>Bill to</Label>
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <div className="flex flex-col items-start w-96 gap-2">
                <Input
                  className="w-full cursor-pointer"
                  placeholder="Select a customer"
                  value={
                    selectedCustomer
                      ? `${selectedCustomer.first_name} ${selectedCustomer.last_name}`
                      : ""
                  }
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </SheetTrigger>
            <SheetContent className="p-10">
              <SheetHeader>
                <SheetTitle>Select a customer</SheetTitle>
                <SheetDescription>
                  <Input
                    placeholder="Search customers"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </SheetDescription>
              </SheetHeader>
              <div className="flex flex-col gap-2 mt-6">
                {loading && <p>Loading...</p>}
                {error && <p>Failed to fetch customers</p>}
                {customers.map((customer) => (
                  <Button
                    variant="secondary"
                    key={customer.client_id}
                    onClick={() => {
                      setSelectedCustomer(customer);
                      setOpen(false);
                    }}
                  >
                    {customer.first_name} {customer.last_name}
                  </Button>
                ))}
              </div>
            </SheetContent>
          </Sheet>
        </div>
        <div className="flex flex-col items-start w-full gap-2 mb-4">
          <Table>
            <TableHeader className={cn("bg-secondary")}>
              <TableRow>
                <TableHead>Description</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Unit price</TableHead>
                <TableHead>VAT rate</TableHead>
                <TableHead>Total</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item, index) => (
                <TableRow key={index} className="h-12">
                  <TableCell className="w-3/6">
                    <Input
                      value={item.description}
                      placeholder="Description"
                      onChange={(e) => {
                        const newItems = [...items];
                        newItems[index].description = e.target.value;
                        setItems(newItems);
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      value={item.quantity}
                      onChange={(e) =>
                        handleChangeItem(index, "quantity", e.target.value)
                      }
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      value={item.unit_price}
                      onChange={(e) =>
                        handleChangeItem(index, "unit_price", e.target.value)
                      }
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      value={item.vat_rate}
                      onChange={(e) =>
                        handleChangeItem(index, "vat_rate", e.target.value)
                      }
                    />
                  </TableCell>
                  <TableCell>
                    ${(item.quantity * item.unit_price).toFixed(2)}
                  </TableCell>
                  <TableCell>
                    <Trash
                      size={24}
                      color="#009933"
                      className="cursor-pointer"
                      onClick={() => handleDeleteItem(index)}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <Button onClick={addItem}>Add item</Button>
          <div className={cn("flex flex-col items-end w-full gap-2 ")}>
            <div className={cn("flex justify-end w-full")}>
              <div
                className={cn(
                  "flex flex-col items-end w-96 gap-2 bg-secondary p-4 rounded-lg"
                )}
              >
                <div className="flex justify-between w-full">
                  <span>Subtotal:</span>
                  <span>${calculateSubtotal()}</span>
                </div>
                <div className="flex justify-between w-full">
                  <span>Tax:</span>
                  <span>${calculateTax()}</span>
                </div>
                <div className="flex justify-between w-full">
                  <span>Total:</span>
                  <span className="font-bold">${calculateTotal()}</span>
                </div>
                <Button className="w-full" onClick={handleCreateInvoice}>
                  Create invoice
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
