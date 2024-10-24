"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

import { Customer } from "@/types/Customer";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ContentLayout } from "@/components/admin-panel/content-layout";
import AddCustomerDialog from "@/components/add-customer-dialog";
import TableCustomers from "@/components/table-customers";
import ErrorScreen from "@/components/error-screen";
import { useToast } from "@/components/ui/use-toast";

import { ClipLoader } from "react-spinners";
import { PiPlus } from "react-icons/pi";

import api from "@/lib/axios";
import { cn } from "@/lib/utils";

type Props = {};

export default function Page({}: Props) {
  const router = useRouter();
  const t = useTranslations();
  const { toast } = useToast();

  const [customers, setCustomers] = React.useState<Customer[]>([]);
  const [search, setSearch] = React.useState<string>("");
  const [loading, setLoading] = React.useState<boolean>(true);
  const [error, setError] = React.useState<String | null>(null);

  const fetchCustomers = React.useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get("/customers", {
        params: {
          search: search || undefined,
        },
      });
      setCustomers(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message);
      toast({
        variant: "destructive",
        title: "Une Erreur s'est produite",
        description: t(`server.${err.response?.data?.message}`),
      });
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
    router.push(`/customers/${customerId}`);
  };

  const handleOnAdd = () => {
    fetchCustomers();
  };

  return (
    <>
      <ContentLayout title="Clients">
        <div className="flex flex-col w-full h-full gap-6">
          <div className="flex flex-col gap-10">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-semibold">{"Clients"}</h1>
              <AddCustomerDialog
                trigger={
                  <Button variant="default" className="flex items-center gap-2">
                    <PiPlus size={20} />
                    {"Ajouter un client"}
                  </Button>
                }
                onSave={handleOnAdd}
              />
            </div>
            <div className="flex flex-col w-full gap-6">
              <div className="flex flex-col gap-6 xl:flex-row xl:justify-between">
                <div className="flex w-full py-2 gap-6 xl:w-2/6">
                  <Input
                    type="text"
                    placeholder={"Rechercher un client"}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>
          {loading ? (
            <div className="flex justify-center items-center w-full h-full ">
              <ClipLoader color={cn("text-primary")} />
            </div>
          ) : error ? (
            <div className="flex justify-center items-center w-full h-full ">
              <ErrorScreen handleRetry={fetchCustomers} />
            </div>
          ) : (
            <TableCustomers
              customers={customers}
              handleSelectCustomer={handleSelectCustomer}
            />
          )}
        </div>
      </ContentLayout>
    </>
  );
}
