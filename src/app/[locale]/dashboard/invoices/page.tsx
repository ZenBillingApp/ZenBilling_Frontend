"use client";
import React from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";

import { Invoice } from "@/types/Invoice";

import TableInvoices from "@/components/tableInvoices";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ClipLoader } from "react-spinners";
import { getCookie } from "cookies-next";

import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";

import { PiPlus } from "react-icons/pi";

type Props = {};

export default function Page({}: Props) {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [invoices, setInvoices] = React.useState<Invoice[]>([]);
    const [search, setSearch] = React.useState<string>("");
    const [filter, setFilter] = React.useState<string>("all");
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
                    `${filter === "all" ? "" : `status=${filter}&`}` +
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
    }, [filter, page, search]);

    React.useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            fetchInvoices();
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [fetchInvoices]);

    const handleChangeFilter = (filter: string) => {
        setFilter(filter);
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
                    An error occurred while fetching data
                </h1>
                <Button onClick={fetchInvoices}>Retry</Button>
            </div>
        );
    }

    return (
        <div className="flex flex-col w-full  gap-6 p-6">
            <div className="flex flex-col gap-10">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-semibold">Invoices</h1>
                    <Button
                        onClick={() =>
                            router.push("/dashboard/invoices/create")
                        }
                    >
                        <PiPlus className="mr-2" size={20} />
                        New Invoice
                    </Button>
                </div>
                <div className="flex flex-col w-full gap-6">
                    <div className="flex flex-col gap-6 xl:flex-row xl:justify-between">
                        <div className="flex w-1/2 gap-2">
                            <Button
                                variant={
                                    filter === "all" ? "default" : "outline"
                                }
                                onClick={() => handleChangeFilter("all")}
                            >
                                All
                            </Button>
                            <Button
                                variant={
                                    filter === "paid" ? "default" : "outline"
                                }
                                onClick={() => handleChangeFilter("paid")}
                            >
                                Paid
                            </Button>
                            <Button
                                variant={
                                    filter === "pending" ? "default" : "outline"
                                }
                                onClick={() => handleChangeFilter("pending")}
                            >
                                Pending
                            </Button>
                            <Button
                                variant={
                                    filter === "cancelled"
                                        ? "default"
                                        : "outline"
                                }
                                onClick={() => handleChangeFilter("cancelled")}
                            >
                                Cancelled
                            </Button>
                        </div>

                        <div className="flex w-full py-2 gap-6 xl:w-2/6">
                            <Input
                                placeholder="Search invoices by client name or invoice id"
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
                <>
                    <div className="flex flex-col gap-6">
                        <TableInvoices invoices={invoices} search={search} />
                    </div>
                    {invoices.length !== 0 && (
                        <Pagination>
                            <PaginationContent>
                                <PaginationPrevious
                                    isActive={false}
                                    className="cursor-pointer"
                                    onClick={() => {
                                        if (page > 1) {
                                            handleChangePage(page - 1);
                                        }
                                    }}
                                >
                                    Previous
                                </PaginationPrevious>
                                {[...Array(totalPages)].map((_, index) => (
                                    <PaginationItem
                                        key={index}
                                        className="cursor-pointer"
                                    >
                                        <PaginationLink
                                            isActive={index + 1 === page}
                                            onClick={() =>
                                                handleChangePage(index + 1)
                                            }
                                        >
                                            {index + 1}
                                        </PaginationLink>
                                    </PaginationItem>
                                ))}

                                <PaginationNext
                                    className="cursor-pointer"
                                    onClick={() => {
                                        if (page < totalPages) {
                                            handleChangePage(page + 1);
                                        }
                                    }}
                                >
                                    Next
                                </PaginationNext>
                            </PaginationContent>
                        </Pagination>
                    )}
                </>
            )}
        </div>
    );
}
