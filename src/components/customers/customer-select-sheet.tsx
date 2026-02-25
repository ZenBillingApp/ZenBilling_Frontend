"use client";

import { useState } from "react";
import { useCustomers } from "@/hooks/useCustomer";
import { useDebounce } from "@/hooks/useDebounce";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Building, User, Search, Plus } from "lucide-react";
import NiceModal from "@ebay/nice-modal-react";

import CreateCustomerDialog from "./create-customer-dialog";
import type { ICustomer } from "@/types/Customer.interface";

interface CustomerSelectSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (customer: ICustomer) => void;
}

export function CustomerSelectSheet({
  open,
  onOpenChange,
  onSelect,
}: CustomerSelectSheetProps) {
  const [search, setSearch] = useState("");
  const [customerType, setCustomerType] = useState<
    "all" | "individual" | "company"
  >("all");

  const debouncedSearch = useDebounce(search, 300);

  const { data: customersData, isLoading, refetch } = useCustomers({
    search: debouncedSearch,
    type: customerType === "all" ? undefined : customerType,
    limit: 50,
  });

  const handleCreateCustomer = () => {
    NiceModal.show(CreateCustomerDialog).then(() => {
      refetch();
    });
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:w-[540px] overflow-y-auto"
      >
        <SheetHeader>
          <SheetTitle>Sélectionner un client</SheetTitle>
          <SheetDescription>
            Recherchez et sélectionnez un client pour la facture
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-4">
          <div className="space-y-4">
            <div className="flex flex-col gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher un client..."
                  aria-label="Rechercher un client"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-8"
                />
              </div>
              <div className="flex justify-between items-center">
                <Tabs
                  value={customerType}
                  onValueChange={(value) =>
                    setCustomerType(value as "all" | "individual" | "company")
                  }
                >
                  <TabsList>
                    <TabsTrigger value="all">Tous</TabsTrigger>
                    <TabsTrigger value="individual">Particuliers</TabsTrigger>
                    <TabsTrigger value="company">Entreprises</TabsTrigger>
                  </TabsList>
                </Tabs>
                <Button 
                  onClick={handleCreateCustomer}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-1"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          <div className="flex-1 mt-4">
            <ScrollArea className="h-[calc(100vh-16rem)] pr-4">
              <div className="space-y-2">
                {isLoading ? (
                  <p className="text-sm text-center text-muted-foreground">
                    Chargement des clients...
                  </p>
                ) : customersData?.data?.customers.length === 0 ? (
                  <p className="text-sm text-center text-muted-foreground">
                    Aucun client trouvé
                  </p>
                ) : (
                  customersData?.data?.customers.map((customer: ICustomer) => (
                    <div
                      key={customer.customer_id}
                      className="flex items-center justify-between p-4 rounded-lg border cursor-pointer hover:bg-muted"
                      onClick={() => {
                        onSelect(customer);
                        onOpenChange(false);
                      }}
                    >
                      <div className="flex items-center gap-4">
                        <Badge variant="outline">
                          {customer.type === "company" ? (
                            <Building className="w-4 h-4" />
                          ) : (
                            <User className="w-4 h-4" />
                          )}
                        </Badge>
                        <div>
                          <p className="font-medium">
                            {customer.type === "company"
                              ? customer.business?.name
                              : `${customer.individual?.first_name} ${customer.individual?.last_name}`}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {customer.email}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
