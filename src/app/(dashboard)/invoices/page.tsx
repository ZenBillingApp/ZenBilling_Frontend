"use client";
import React from "react";
import { useRouter } from "next/navigation";

import { Invoice } from "@/types/Invoice";

import TableInvoices from "@/components/tableInvoices";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import PaginationList from "@/components/pagination-list";
import { ContentLayout } from "@/components/admin-panel/content-layout";
import BtnFilter from "@/components/btn-filter";
import ErrorScreen from "@/components/error-screen";

import { PiPlus } from "react-icons/pi";
import { ClipLoader } from "react-spinners";

import api from "@/lib/axios";
import { cn } from "@/lib/utils";

type Props = {};

export default function Page({}: Props) {
  const router = useRouter();

  const [invoices, setInvoices] = React.useState<Invoice[]>([]);
  const [search, setSearch] = React.useState<string>("");
  const [selectedFilter, setSelectedFilter] = React.useState<string>("all");
  const [loading, setLoading] = React.useState<boolean>(true);
  const [error, setError] = React.useState<string | null>(null);
  const [page, setPage] = React.useState<number>(1);
  const [totalPages, setTotalPages] = React.useState<number>(1);

  const handleChangePage = (page: number) => {
    setPage(page);
  };

  const fetchInvoices = React.useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get("/invoices", {
        params: {
          page: page,
          search: search || undefined,
          status: selectedFilter === "all" ? undefined : selectedFilter,
        },
      });
      setInvoices(response.data.invoices);
      setTotalPages(response.data.totalPages);
    } catch (err: any) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  }, [page, search, selectedFilter]);

  React.useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchInvoices();
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [fetchInvoices]);

  return (
    <ContentLayout title={"Factures"}>
      {error ? (
        <div className="flex flex-col w-full h-full justify-center items-center gap-4">
          <ErrorScreen handleRetry={fetchInvoices} />
        </div>
      ) : (
        <div className="flex flex-col w-full h-full gap-4">
          <div className="flex flex-col gap-6">
            <div className="flex flex-col xl:flex-row xl:justify-between xl:items-center gap-6">
              <h1 className="text-2xl font-semibold">Factures</h1>
              <Button onClick={() => router.push("/invoices/create")}>
                <PiPlus className="mr-2" size={20} />
                Créer une facture
              </Button>
            </div>
            <div className="flex flex-col w-full gap-6">
              <div className="flex flex-col gap-6 xl:flex-row xl:justify-between">
                <div className="grid grid-cols-2 items-center gap-4 sm:grid-cols-4">
                  <BtnFilter
                    filter="all"
                    text="Toutes"
                    selectedFilter={selectedFilter}
                    setSelectedFilter={setSelectedFilter}
                  />
                  <BtnFilter
                    filter="paid"
                    text={"Payées"}
                    selectedFilter={selectedFilter}
                    setSelectedFilter={setSelectedFilter}
                  />
                  <BtnFilter
                    filter="pending"
                    text={"En attente"}
                    selectedFilter={selectedFilter}
                    setSelectedFilter={setSelectedFilter}
                  />
                  <BtnFilter
                    filter="cancelled"
                    text={"Annulées"}
                    selectedFilter={selectedFilter}
                    setSelectedFilter={setSelectedFilter}
                  />
                </div>
                <div className="flex w-full py-2 gap-6 xl:w-2/6">
                  <Input
                    type="text"
                    placeholder={"Rechercher une facture..."}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>
          {loading ? (
            <div className="flex justify-center items-center w-full h-full">
              <ClipLoader color={cn("text-primary")} />
            </div>
          ) : (
            <>
              <div className="flex flex-col gap-6">
                <TableInvoices invoices={invoices} search={search} />
              </div>
              {totalPages > 1 && (
                <PaginationList
                  currentPage={page}
                  totalPages={totalPages}
                  handleChangePage={handleChangePage}
                />
              )}
            </>
          )}
        </div>
      )}
    </ContentLayout>
  );
}
