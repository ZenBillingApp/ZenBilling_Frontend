import React from "react";

import { Customer } from "@/types/Customer";
import { useDebounce } from "@/hooks/use-debounce";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { ScrollArea } from "./ui/scroll-area";
import AddCustomerDialog from "./add-customer-dialog";

import { MdAdd } from "react-icons/md";
import { ClipLoader } from "react-spinners";

import api from "@/lib/axios";
import { cn } from "@/lib/utils";

interface SheetCustomersProps {
  trigger: React.ReactNode;
  handleSelectCustomer: (customer: Customer) => void;
}

export default function SheetCustomers({
  handleSelectCustomer,
  trigger,
}: SheetCustomersProps) {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const [customers, setCustomers] = React.useState<Customer[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const debouncedSearch = useDebounce(search, 300);

  const fetchCustomers = React.useCallback(async () => {
    if (!open) return;

    try {
      setIsLoading(true);
      setError(null);

      const response = await api.get("/customers", {
        params: {
          search: debouncedSearch || undefined,
        },
      });

      setCustomers(response.data.customers);
    } catch (error) {
      setError("Une erreur s'est produite lors du chargement des clients");
    } finally {
      setIsLoading(false);
    }
  }, [debouncedSearch, open]);

  React.useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const handleCustomerSelect = (customer: Customer) => {
    setOpen(false);
    handleSelectCustomer(customer);
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex justify-center items-center py-4">
          <ClipLoader color={cn("text-primary")} />
        </div>
      );
    }

    if (error) {
      return <p className="text-center text-sm text-red-500 py-4">{error}</p>;
    }

    if (customers.length === 0) {
      return (
        <p className="text-center text-sm text-gray-500 py-4">
          Aucun client trouvé
        </p>
      );
    }

    return (
      <div className="flex flex-col gap-2">
        {customers.map((customer) => (
          <Button
            variant="outline"
            key={customer.client_id}
            onClick={() => handleCustomerSelect(customer)}
          >
            {customer.first_name} {customer.last_name}
          </Button>
        ))}
      </div>
    );
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>{trigger}</SheetTrigger>
      <SheetContent className="p-4 flex flex-col h-full">
        <SheetHeader className="mt-4 space-y-4">
          <SheetTitle>
            <h1 className="text-2xl font-semibold">Sélectionner un client</h1>
          </SheetTitle>
          <SheetDescription>
            <div className="flex items-center gap-2">
              <Input
                type="text"
                placeholder="Rechercher un client"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <AddCustomerDialog
                trigger={
                  <Button variant="default">
                    <MdAdd size={20} />
                  </Button>
                }
                onSave={fetchCustomers}
              />
            </div>
          </SheetDescription>
        </SheetHeader>
        <ScrollArea className="mt-4 flex-1">{renderContent()}</ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
