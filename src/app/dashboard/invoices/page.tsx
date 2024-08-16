"use client";
import React from "react";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { getCookie } from "cookies-next";

import { Invoice } from "@/types/Invoice";

import TableInvoices from "@/components/tableInvoices";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import PaginationList from "@/components/pagination-list";
import { ContentLayout } from "@/components/admin-panel/content-layout";
import BtnFilter from "@/components/btn-filter";

import { PiPlus } from "react-icons/pi";
import { ClipLoader } from "react-spinners";
import ErrorScreen from "@/components/error-screen";

type Props = {};

export default function Page({}: Props) {
    const router = useRouter();
    const t = useTranslations();

    const [invoices, setInvoices] = React.useState<Invoice[]>([]);
    const [search, setSearch] = React.useState<string>("");
    const [selectedFilter, setSelectedFilter] = React.useState<string>("all");
    const [loading, setLoading] = React.useState<boolean>(true);
    const [error, setError] = React.useState<boolean>(false);
    const [page, setPage] = React.useState<number>(1);
    const [totalPages, setTotalPages] = React.useState<number>(1);

    const handleChangePage = (page: number) => {
        setPage(page);
    };

    const fetchInvoices = React.useCallback(async () => {
        try {
            setLoading(true);
            setError(false);
            const response = await fetch(
                process.env.NEXT_PUBLIC_API_URL +
                    "/api/invoices?" +
                    `${
                        selectedFilter === "all"
                            ? ""
                            : `status=${selectedFilter}&`
                    }` +
                    `${search ? `search=${search}` : ""}${
                        page ? `&page=${page}` : ""
                    }`,
                {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${getCookie("token")}`,
                    },
                }
            );
            if (!response.ok) {
                throw new Error("Failed to fetch invoices");
            }

            const data = await response.json();
            setInvoices(data.invoices);
            setTotalPages(data.totalPages);
            console.log(data);
        } catch (error) {
            console.error(error);
            setError(true);
        } finally {
            setLoading(false);
        }
    }, [selectedFilter, page, search]);

    React.useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            fetchInvoices();
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [fetchInvoices]);

    if (error) {
        return (
            <ContentLayout title={t("invoices.invoices")}>
                <ErrorScreen handleRetry={fetchInvoices} />
            </ContentLayout>
        );
    }

    return (
        <ContentLayout title={t("invoices.invoices")}>
            <div className="flex flex-col w-full h-full gap-4">
                <div className="flex flex-col gap-6">
                    <div className="flex flex-col xl:flex-row xl:justify-between xl:items-center gap-6">
                        <h1 className="text-2xl font-semibold">
                            {t("invoices.invoices")}
                        </h1>
                        <Button
                            onClick={() =>
                                router.push("/dashboard/invoices/create")
                            }
                        >
                            <PiPlus className="mr-2" size={20} />
                            {t("invoices.create_invoice")}
                        </Button>
                    </div>
                    <div className="flex flex-col w-full gap-6">
                        <div className="flex flex-col gap-6 xl:flex-row xl:justify-between">
                            <div className="grid grid-cols-2 items-center gap-4 sm:grid-cols-4">
                                <BtnFilter
                                    filter="all"
                                    text={t(
                                        "invoices.invoice_table_filter_all"
                                    )}
                                    selectedFilter={selectedFilter}
                                    setSelectedFilter={setSelectedFilter}
                                />

                                <BtnFilter
                                    filter="paid"
                                    text={t(
                                        "invoices.invoice_table_filter_paid"
                                    )}
                                    selectedFilter={selectedFilter}
                                    setSelectedFilter={setSelectedFilter}
                                />
                                <BtnFilter
                                    filter="pending"
                                    text={t(
                                        "invoices.invoice_table_filter_pending"
                                    )}
                                    selectedFilter={selectedFilter}
                                    setSelectedFilter={setSelectedFilter}
                                />
                                <BtnFilter
                                    filter="cancelled"
                                    text={t(
                                        "invoices.invoice_table_filter_cancelled"
                                    )}
                                    selectedFilter={selectedFilter}
                                    setSelectedFilter={setSelectedFilter}
                                />
                            </div>

                            <div className="flex w-full py-2 gap-6 xl:w-2/6">
                                <Input
                                    type="text"
                                    placeholder={t(
                                        "invoices.invoice_table_search_placeholder"
                                    )}
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>
                </div>
                {loading ? (
                    <div className="flex justify-center items-center w-full h-full">
                        <ClipLoader color="#009933" size={50} />
                    </div>
                ) : (
                    <>
                        <div className="flex flex-col gap-6">
                            <TableInvoices
                                invoices={invoices}
                                search={search}
                            />
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
        </ContentLayout>
    );
}
