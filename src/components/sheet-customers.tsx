import React from "react";
import { useTranslations } from "next-intl";

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

type Props = {
  trigger: React.ReactNode;
  handleSelectCustomer: (customer: Customer) => void;
};

export default function SheetCustomers({
  handleSelectCustomer,
  trigger,
}: Props) {
  const t = useTranslations();

  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const [customers, setCustomers] = React.useState<Customer[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(false);
  const [data, setData] = React.useState<Customer[]>([]);
  const debouncedSearch = useDebounce(search, 300);

  React.useEffect(() => {
    const fetchCustomers = async () => {
      try {
        setLoading(true);
        const response = await api.get("/customers", {
          params: {
            search: debouncedSearch || undefined,
          },
        });
        setData(response.data);
        setLoading(false);
      } catch (error) {
        setError(true);
        setLoading(false);
      }
    };
    if (open) {
      fetchCustomers();
    }
  }, [debouncedSearch, open]);

  React.useEffect(() => {
    if (data) {
      setCustomers(data);
    }
  }, [data]);

  const onAdd = async (newCustomer: Customer) => {
    setCustomers([...customers, newCustomer]);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>{trigger}</SheetTrigger>
      <SheetContent className="p-4 flex flex-col h-full">
        <SheetHeader className="mt-4 space-y-4">
          <SheetTitle>
            <h1 className="text-2xl font-semibold">
              {t("customers.customer_select")}
            </h1>
          </SheetTitle>
          <SheetDescription>
            <div className="flex items-center gap-2">
              <Input
                type="text"
                placeholder={t("customers.customer_placeholder_search")}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <AddCustomerDialog
                trigger={
                  <Button variant="default">
                    <MdAdd size={20} />
                  </Button>
                }
                onSave={onAdd}
              />
            </div>
          </SheetDescription>
        </SheetHeader>
        <ScrollArea className="mt-4 flex-1">
          <div className="flex flex-col gap-2">
            {loading && (
              <div className="flex justify-center items-center">
                <ClipLoader color="#009933" size={20} />
              </div>
            )}
            {error && (
              <p className="text-center text-sm text-red-500">
                {t("customers.customer_failed_search")}
              </p>
            )}
            {customers && customers.length === 0 && !loading && (
              <p className="text-center text-sm text-gray-500">
                {t("customers.customer_no_results")}
              </p>
            )}
            {customers &&
              customers.map((customer) => (
                <Button
                  variant="outline"
                  key={customer.client_id}
                  onClick={() => {
                    setOpen(false);
                    handleSelectCustomer(customer);
                  }}
                >
                  {customer.first_name} {customer.last_name}
                </Button>
              ))}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
