"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { Plus } from "lucide-react";

import { Invoice } from "@/types/Invoice";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import TableInvoices from "@/components/tableInvoices";
import PaginationList from "@/components/pagination-list";
import { ContentLayout } from "@/components/admin-panel/content-layout";
import FilterButton from "@/components/btn-filter";
import ErrorScreen from "@/components/error-screen";

import { ClipLoader } from "react-spinners";

import api from "@/lib/axios";
import { cn } from "@/lib/utils";

interface InvoicesState {
  data: Invoice[];
  isLoading: boolean;
  error: string | null;
  totalPages: number;
}

interface FilterConfig {
  id: string;
  text: string;
  value: string;
}

const FILTERS: FilterConfig[] = [
  { id: "all", text: "Toutes", value: "all" },
  { id: "paid", text: "Payées", value: "paid" },
  { id: "pending", text: "En attente", value: "pending" },
  { id: "cancelled", text: "Annulées", value: "cancelled" },
];

const DEBOUNCE_DELAY = 300;

const initialState: InvoicesState = {
  data: [],
  isLoading: true,
  error: null,
  totalPages: 1,
};

export default function InvoicesPage() {
  const router = useRouter();
  const [{ data: invoices, isLoading, error, totalPages }, setState] =
    useState<InvoicesState>(initialState);
  const [search, setSearch] = useState("");
  const [selectedFilter, setSelectedFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);

  const fetchInvoicesData = useCallback(async () => {
    try {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      const params = {
        page: currentPage,
        search: search || undefined,
        status: selectedFilter === "all" ? undefined : selectedFilter,
      };

      const response = await api.get("/invoices", { params });

      setState((prev) => ({
        ...prev,
        data: response.data.invoices,
        totalPages: response.data.totalPages,
        isLoading: false,
      }));
    } catch (err) {
      console.error("Failed to fetch invoices:", err);
      setState((prev) => ({
        ...prev,
        error: "Impossible de charger les factures",
        isLoading: false,
      }));
    }
  }, [currentPage, search, selectedFilter]);

  useEffect(() => {
    const timer = setTimeout(fetchInvoicesData, DEBOUNCE_DELAY);
    return () => clearTimeout(timer);
  }, [fetchInvoicesData]);

  const handleCreateInvoice = () => router.push("/invoices/create");

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(event.target.value);
    setCurrentPage(1); // Reset to first page on new search
  };

  const handleFilterChange = (filter: string) => {
    setSelectedFilter(filter);
    setCurrentPage(1); // Reset to first page on filter change
  };

  if (error) {
    return (
      <ContentLayout title="Factures">
        <div className="flex flex-col w-full h-full justify-center items-center gap-4">
          <ErrorScreen handleRetry={fetchInvoicesData} />
        </div>
      </ContentLayout>
    );
  }

  return (
    <ContentLayout title="Factures">
      <div className="flex flex-col w-full gap-4">
        <header className="flex flex-col gap-6">
          <div className="flex flex-col xl:flex-row xl:justify-between xl:items-center gap-6">
            <h1 className="text-2xl font-semibold">Factures</h1>
            <Button onClick={handleCreateInvoice}>
              <Plus className="w-5 h-5 mr-2" />
              Créer une facture
            </Button>
          </div>

          <div className="flex flex-col w-full gap-6">
            <div className="flex flex-col gap-6 xl:flex-row xl:justify-between">
              <div className="grid grid-cols-2 items-center gap-4 sm:grid-cols-4">
                {FILTERS.map((filter) => (
                  <FilterButton
                    key={filter.id}
                    filter={filter.value}
                    text={filter.text}
                    selectedFilter={selectedFilter === filter.value}
                    setSelectedFilter={handleFilterChange}
                  />
                ))}
              </div>

              <div className="flex w-full py-2 gap-6 xl:w-2/6">
                <Input
                  type="search"
                  placeholder="Rechercher une facture..."
                  value={search}
                  onChange={handleSearchChange}
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
        ) : (
          <main className="flex flex-col gap-6">
            <TableInvoices invoices={invoices} search={search} />

            {totalPages > 1 && (
              <PaginationList
                currentPage={currentPage}
                totalPages={totalPages}
                handleChangePage={setCurrentPage}
              />
            )}
          </main>
        )}
      </div>
    </ContentLayout>
  );
}
