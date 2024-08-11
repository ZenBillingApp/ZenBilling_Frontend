import React from "react";
import { useTranslations } from "next-intl";

import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";

type Props = {
    currentPage: number;
    totalPages: number;
    handleChangePage: (page: number) => void;
};

const PaginationList = ({
    currentPage,
    totalPages,
    handleChangePage,
}: Props) => {
    const t = useTranslations();
    return (
        <Pagination>
            <PaginationContent>
                <PaginationPrevious
                    title={t("common.common_previous")}
                    isActive={currentPage > 1}
                    className="cursor-pointer"
                    onClick={() => {
                        if (currentPage > 1) {
                            handleChangePage(currentPage - 1);
                        }
                    }}
                />
                {[...Array(totalPages)].map((_, index) => (
                    <PaginationItem key={index} className="cursor-pointer">
                        <PaginationLink
                            isActive={index + 1 === currentPage}
                            onClick={() => handleChangePage(index + 1)}
                        >
                            {index + 1}
                        </PaginationLink>
                    </PaginationItem>
                ))}

                <PaginationNext
                    title={t("common.common_next")}
                    className="cursor-pointer"
                    onClick={() => {
                        if (currentPage < totalPages) {
                            handleChangePage(currentPage + 1);
                        }
                    }}
                />
            </PaginationContent>
        </Pagination>
    );
};

export default PaginationList;
