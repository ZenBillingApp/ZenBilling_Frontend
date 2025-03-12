"use client";

import React, { useState } from "react";
import { useCustomers } from "@/hooks/useCustomer";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Loader2, MapPin, Plus, Search, Mail, Phone } from "lucide-react";
import { ICustomer } from "@/types/Customer.interface";
import { User, Building, User2Icon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useDebounce } from "@/hooks/useDebounce";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import NiceModal from "@ebay/nice-modal-react";
import CreateCustomerDialog from "@/components/customers/create-customer-dialog";
import EditCustomerDialog from "@/components/customers/edit-customer-dialog";
import { CustomerDetailsDialog } from "@/components/customers/customer-details-dialog";

export default function CustomersPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [typeFilter, setTypeFilter] = useState<
    "all" | "individual" | "company"
  >("all");
  const [selectedCustomer, setSelectedCustomer] = useState<ICustomer | null>(
    null
  );
  const debouncedSearch = useDebounce(search, 300);
  const { data, isLoading } = useCustomers({
    search: debouncedSearch || undefined,
    type: typeFilter === "all" ? undefined : typeFilter,
    limit: 25,
    page: page,
  });
  const totalPages = data?.data.pagination.totalPages || 1;

  const handleCreateCustomer = () => {
    NiceModal.show(CreateCustomerDialog);
  };

  const handleEditCustomer = () => {
    if (selectedCustomer) {
      NiceModal.show(EditCustomerDialog, { customer: selectedCustomer });
    }
  };

  return (
    <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-6 space-y-4 sm:space-y-6 max-w-7xl">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-xl sm:text-2xl font-bold font-dmSans flex items-center">
          <User2Icon className="w-5 sm:w-6 h-5 sm:h-6 mr-2" />
          Clients
        </h1>
        <Button
          onClick={handleCreateCustomer}
          className="w-full sm:w-auto flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Nouveau client
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
        <div className="relative w-full">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher un client..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 w-full"
          />
        </div>
        <div className="w-full sm:w-[200px]">
          <Select
            value={typeFilter}
            onValueChange={(value: "all" | "individual" | "company") =>
              setTypeFilter(value)
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Type de client" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous</SelectItem>
              <SelectItem value="individual">Particuliers</SelectItem>
              <SelectItem value="company">Professionnels</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : data?.data.customers.length === 0 ? (
        <div className="text-center py-8 sm:py-12">
          <User2Icon className="mx-auto h-10 sm:h-12 w-10 sm:w-12 text-muted-foreground" />
          <h3 className="mt-3 sm:mt-4 text-base sm:text-lg font-medium">Aucun client</h3>
          <p className="mt-1 sm:mt-2 text-xs sm:text-sm text-muted-foreground">
            Commencez par créer un nouveau client.
          </p>
          <div className="mt-4 sm:mt-6">
            <Button onClick={handleCreateCustomer}>
              <Plus className="w-4 h-4 mr-2" />
              Nouveau client
            </Button>
          </div>
        </div>
      ) : (
        <>
          {/* Vue mobile (uniquement sur xs) */}
          <div className="block sm:hidden space-y-4">
            {data?.data?.customers?.map((customer: ICustomer) => (
              <div 
                key={customer.customer_id}
                className="border rounded-lg p-3 cursor-pointer hover:bg-muted/50"
                onClick={() => setSelectedCustomer(customer)}
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className="flex items-center gap-1 h-5"
                      >
                        {customer.type === "company" ? (
                          <Building className="w-3 h-3" />
                        ) : (
                          <User className="w-3 h-3" />
                        )}
                      </Badge>
                      <p className="font-medium text-sm">
                        {customer.type === "company"
                          ? customer.business?.name
                          : `${customer.individual?.first_name} ${customer.individual?.last_name}`}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-1 mt-2">
                  {customer.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="w-3 h-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground truncate">
                        {customer.email}
                      </span>
                    </div>
                  )}
                  
                  {customer.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-3 h-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">
                        {customer.phone}
                      </span>
                    </div>
                  )}
                  
                  {customer.address && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3 h-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground truncate">
                        {customer.address}{customer.city ? `, ${customer.city}` : ''}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
          
          {/* Vue desktop (à partir de sm) */}
          <div className="hidden sm:block overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">Type</TableHead>
                  <TableHead>Nom</TableHead>
                  <TableHead className="hidden sm:table-cell">Email</TableHead>
                  <TableHead className="hidden sm:table-cell">
                    Téléphone
                  </TableHead>
                  <TableHead className="hidden lg:table-cell">
                    Adresse
                  </TableHead>
                  <TableHead className="hidden lg:table-cell">Ville</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data?.data?.customers?.map((customer: ICustomer) => (
                  <TableRow
                    key={customer.customer_id}
                    className="cursor-pointer transition-colors hover:bg-muted/50"
                    onClick={() => setSelectedCustomer(customer)}
                  >
                    <TableCell>
                      {customer.type === "company" ? (
                        <Badge
                          variant="outline"
                          className="flex items-center gap-2 w-fit"
                        >
                          <Building className="w-4 h-4" />
                          <span className="hidden sm:inline">Pro</span>
                        </Badge>
                      ) : (
                        <Badge
                          variant="outline"
                          className="flex items-center gap-2 w-fit"
                        >
                          <User className="w-4 h-4" />
                          <span className="hidden sm:inline">Part.</span>
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="font-medium max-w-[200px] truncate">
                      {customer.type === "company"
                        ? customer.business?.name
                        : `${customer.individual?.first_name} ${customer.individual?.last_name}`}
                    </TableCell>
                    <TableCell className="hidden sm:table-cell text-nowrap">
                      <span className="text-muted-foreground">
                        {customer.email || "-"}
                      </span>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell text-nowrap">
                      <span className="text-muted-foreground">
                        {customer.phone || "-"}
                      </span>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-nowrap">
                      {customer.address ? (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <MapPin className="w-4 h-4 shrink-0" />
                          <span className="truncate max-w-[200px]">
                            {customer.address}
                          </span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-nowrap">
                      <span className="text-muted-foreground">
                        {customer.city || "-"}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-4 sm:mt-6">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  className="cursor-pointer"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  isActive={page !== 1}
                />
              </PaginationItem>
              {[...Array(totalPages)].map((_, i) => {
                // Sur mobile, n'afficher que la page actuelle et les pages adjacentes
                if (
                  (window.innerWidth < 640 && Math.abs(page - (i + 1)) > 1) ||
                  (totalPages > 7 && i > 0 && i < totalPages - 1 && Math.abs(page - (i + 1)) > 2)
                ) {
                  // Afficher des points de suspension au milieu
                  if (i === 1 && page > 3) {
                    return (
                      <PaginationItem key="ellipsis-start" className="flex items-center justify-center h-10 w-10">
                        <span>...</span>
                      </PaginationItem>
                    );
                  }
                  if (i === totalPages - 2 && page < totalPages - 2) {
                    return (
                      <PaginationItem key="ellipsis-end" className="flex items-center justify-center h-10 w-10">
                        <span>...</span>
                      </PaginationItem>
                    );
                  }
                  return null;
                }
                return (
                  <PaginationItem key={i + 1}>
                    <PaginationLink
                      onClick={() => setPage(i + 1)}
                      isActive={page === i + 1}
                    >
                      {i + 1}
                    </PaginationLink>
                  </PaginationItem>
                );
              })}
              <PaginationItem>
                <PaginationNext
                  className="cursor-pointer"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  isActive={page !== totalPages}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}

      {/* Customer Details Dialog */}
      <CustomerDetailsDialog
        customer={selectedCustomer}
        isOpen={!!selectedCustomer}
        onOpenChange={(open) => !open && setSelectedCustomer(null)}
        onEdit={handleEditCustomer}
      />
    </div>
  );
}
