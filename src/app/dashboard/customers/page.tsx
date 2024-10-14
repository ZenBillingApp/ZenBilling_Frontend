"use client";
import React from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";

import { Customer } from "@/types/Customer";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ContentLayout } from "@/components/admin-panel/content-layout";
import AddCustomerDialog from "@/components/add-customer-dialog";
import TableCustomers from "@/components/table-customers";

import { ClipLoader } from "react-spinners";
import { PiPlus } from "react-icons/pi";

import api from "@/lib/axios";

type Props = {};

export default function Page({}: Props) {
  const router = useRouter();
  const t = useTranslations();

  const [customers, setCustomers] = React.useState<Customer[]>([]);
  const [search, setSearch] = React.useState<string>("");
  const [loading, setLoading] = React.useState<boolean>(true);
  const [error, setError] = React.useState<boolean>(false);

  const fetchCustomers = React.useCallback(async () => {
    try {
      setLoading(true);
      setError(false);
      const response = await api.get("/customers", {
        params: {
          search: search || undefined,
        },
      });
      setCustomers(response.data);
    } catch (error) {
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

  const handleOnAdd = (newCustomer: Customer) => {
    setCustomers((prev) => [...prev, newCustomer]);
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
          {t("common.common_error_fetch_message")}
        </h1>
        <Button onClick={fetchCustomers}>{t("common.common_retry")}</Button>
      </div>
    );
  }

  return (
    <ContentLayout title={t("customers.customers")}>
      <div className="flex flex-col w-full h-full gap-6">
        <div className="flex flex-col gap-10">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold">
              {t("customers.customers")}
            </h1>
            <AddCustomerDialog
              trigger={
                <Button variant="default" className="flex items-center gap-2">
                  <PiPlus size={20} />
                  {t("customers.customer_add")}
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
                  placeholder={t("customers.customer_table_search_placeholder")}
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
          <TableCustomers
            customers={customers}
            handleSelectCustomer={handleSelectCustomer}
          />
        )}
      </div>
    </ContentLayout>
  );
}
