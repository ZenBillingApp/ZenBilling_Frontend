"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";

import { Customer } from "@/types/Customer";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ContentLayout } from "@/components/admin-panel/content-layout";
import AddCustomerDialog from "@/components/add-customer-dialog";
import TableCustomers from "@/components/table-customers";
import ErrorScreen from "@/components/error-screen";

import { ClipLoader } from "react-spinners";

import api from "@/lib/axios";
import { cn } from "@/lib/utils";

const DEBOUNCE_DELAY = 300;

interface CustomersState {
  data: Customer[];
  isLoading: boolean;
  error: string | null;
}

const initialState: CustomersState = {
  data: [],
  isLoading: true,
  error: null,
};

export default function CustomersPage() {
  const router = useRouter();
  const [{ data: customers, isLoading, error }, setState] =
    useState<CustomersState>(initialState);
  const [search, setSearch] = useState("");

  const fetchCustomersData = useCallback(async () => {
    try {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));
      const response = await api.get("/customers", { params: { search } });
      setState((prev) => ({
        ...prev,
        data: response.data.customers,
        isLoading: false,
      }));
    } catch (err) {
      console.error("Failed to fetch customers:", err);
      setState((prev) => ({
        ...prev,
        error: "Impossible de charger les clients",
        isLoading: false,
      }));
    }
  }, [search]);

  useEffect(() => {
    const timer = setTimeout(fetchCustomersData, DEBOUNCE_DELAY);
    return () => clearTimeout(timer);
  }, [fetchCustomersData]);

  const handleCustomerSelect = (customerId: number) => {
    router.push(`/customers/${customerId}`);
  };

  return (
    <ContentLayout title="Clients">
      <div className="flex flex-col w-full gap-6">
        <header className="flex flex-col gap-10">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold">Clients</h1>
            <AddCustomerDialog
              trigger={
                <Button className="flex items-center gap-2">
                  <Plus className="h-5 w-5" />
                  Ajouter un client
                </Button>
              }
              onSave={fetchCustomersData}
            />
          </div>

          <div className="flex flex-col w-full gap-6">
            <div className="flex flex-col gap-6 xl:flex-row xl:justify-between">
              <div className="flex w-full py-2 gap-6 xl:w-2/6">
                <Input
                  type="search"
                  placeholder="Rechercher un client"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full"
                />
              </div>
            </div>
          </div>
        </header>

        {isLoading ? (
          <div className="flex justify-center items-center w-full h-full">
            <ClipLoader color={cn("text-primary")} />
          </div>
        ) : error ? (
          <div className="flex justify-center items-center w-full h-full">
            <ErrorScreen handleRetry={fetchCustomersData} />
          </div>
        ) : (
          <TableCustomers
            customers={customers}
            handleSelectCustomer={handleCustomerSelect}
          />
        )}
      </div>
    </ContentLayout>
  );
}
