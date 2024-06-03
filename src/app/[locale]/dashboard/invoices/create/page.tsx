"use client";
import React, { useState, useEffect, useCallback } from "react";
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
import { ChevronDownIcon, Delete, Edit } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";

import { getCookie } from "cookies-next";

type Props = {};

type Item = {
  description: string;
  quantity: number;
  unitPrice: number;
  vatRate: number;
};

export default function Page({}: Props) {
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
      console.log(data);
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
      { description: "", quantity: 1, unitPrice: 0, vatRate: 0 },
    ]);
  };

  const handleDeleteItem = (index: number) => {
    const newItems = items.filter((_, i) => i !== index);
    setItems(newItems);
  };

  return (
    <div className="flex flex-col w-full h-full gap-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Create Invoice</h1>
      </div>
      <div className="flex flex-col gap-6">
        <div className="flex gap-2">
          <div className="flex flex-col items-start w-96 gap-2">
            <Label>Invoice date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full flex items-center justify-between"
                >
                  {"Select a date"}
                  <ChevronDownIcon size={16} className="ml-2 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={new Date()}
                  onSelect={() => {}}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          <div className="flex flex-col items-start w-96 gap-2">
            <Label>Due date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full flex items-center justify-between"
                >
                  {"Select a date"}
                  <ChevronDownIcon size={16} className="ml-2 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={new Date()}
                  onSelect={() => {}}
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
        <div className="flex flex-col items-start w-full gap-2">
          <Label>Items</Label>
          <div className="flex flex-col w-full gap-2">
            {items.map((item, index) => (
              <div className="flex w-full gap-2" key={index}>
                <Input
                  placeholder="Description"
                  className="flex flex-1"
                  value={item.description}
                  onChange={(e) => {}}
                />
                <Input
                  placeholder="Quantity"
                  className="w-24"
                  type="number"
                  value={item.quantity}
                  onChange={(e) => {}}
                />
                <Input
                  placeholder="Unit price"
                  className="w-24"
                  type="number"
                  value={item.unitPrice}
                  onChange={(e) => {}}
                />
                <Input
                  placeholder="VAT rate"
                  className="w-24"
                  type="number"
                  value={item.vatRate}
                  onChange={(e) => {}}
                />
                <div className="flex items-center gap-2">
                  <span className="text-gray-500">
                    {(
                      item.quantity *
                      item.unitPrice *
                      (1 + item.vatRate / 100)
                    ).toFixed(2)}
                    $
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Delete size={16} onClick={() => handleDeleteItem(index)} />
                  <Edit size={16} />
                </div>
              </div>
            ))}
            <Button variant="secondary" onClick={addItem}>
              Add item
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
