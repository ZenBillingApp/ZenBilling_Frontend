import React from "react";
import { Customer } from "@/types/Customer";
import { BuildingIcon, User2Icon } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

type Props = {
  customers: Customer[];
  handleSelectCustomer: (clientId: number) => void;
  type?: "company" | "individual";
};

export default function TableCustomers({
  customers,
  handleSelectCustomer,
  type,
}: Props) {
  // Colonnes communes
  const commonColumns = [
    {
      header: "Type",
      cell: (customer: Customer) => (
        <div className="w-8 text-nowrap">
          {customer.type === "company" ? (
            <BuildingIcon className="w-4 h-4" />
          ) : (
            <User2Icon className="w-4 h-4" />
          )}
        </div>
      ),
    },
    {
      header: "ID",
      cell: (customer: Customer) => (
        <div className="text-xs text-muted-foreground text-nowrap">
          {customer.client_id}
        </div>
      ),
    },
  ];

  // Colonnes spécifiques aux entreprises
  const companyColumns = [
    {
      header: "Raison sociale",
      cell: (customer: Customer) => (
        <div className="font-medium text-nowrap">{customer.name || "-"}</div>
      ),
    },
    {
      header: "SIRET",
      cell: (customer: Customer) => (
        <div className="font-mono text-xs text-nowrap">
          {customer.siret_number
            ? `${customer.siret_number.slice(
                0,
                3
              )} ${customer.siret_number.slice(
                3,
                6
              )} ${customer.siret_number.slice(
                6,
                9
              )} ${customer.siret_number.slice(9)}`
            : "-"}
        </div>
      ),
    },
    {
      header: "N° TVA",
      cell: (customer: Customer) => (
        <div className="font-mono text-xs text-nowrap">
          {customer.vat_number || "-"}
        </div>
      ),
    },
  ];

  // Colonnes spécifiques aux particuliers
  const individualColumns = [
    {
      header: "Nom",
      cell: (customer: Customer) => (
        <div className="font-medium text-nowrap">
          {customer.first_name} {customer.last_name}
        </div>
      ),
    },
  ];

  // Colonnes de contact communes
  const contactColumns = [
    {
      header: "Email",
      cell: (customer: Customer) => (
        <div className="text-sm text-nowrap">{customer.email || "-"}</div>
      ),
    },
    {
      header: "Téléphone",
      cell: (customer: Customer) => (
        <div className="font-mono text-sm text-nowrap">
          {customer.phone || "-"}
        </div>
      ),
    },
  ];

  // Colonnes de statistiques
  const statsColumns = [
    {
      header: "Factures",
      cell: (customer: Customer) => (
        <div className="flex items-center gap-2 text-nowrap">
          <Badge
            variant={
              (customer.invoice_count ?? 0) > 0 ? "secondary" : "outline"
            }
          >
            {customer.invoice_count || 0}
          </Badge>
        </div>
      ),
    },
  ];

  // Sélection des colonnes selon le type
  const columns = [
    ...commonColumns,
    ...(type === "company"
      ? companyColumns
      : type === "individual"
      ? individualColumns
      : [...companyColumns, ...individualColumns]),
    ...contactColumns,
    ...statsColumns,
  ];

  return (
    <Table>
      <TableHeader>
        <TableRow>
          {columns.map((column, index) => (
            <TableHead key={index}>{column.header}</TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {customers?.length === 0 ? (
          <TableRow>
            <TableCell
              colSpan={columns.length}
              className="text-center h-32 text-muted-foreground"
            >
              Aucun client trouvé
            </TableCell>
          </TableRow>
        ) : (
          customers?.map((customer) => (
            <TableRow
              key={customer.client_id}
              onClick={() => handleSelectCustomer(customer.client_id)}
              className="cursor-pointer hover:bg-muted/50"
            >
              {columns.map((column, index) => (
                <TableCell key={index}>{column.cell(customer)}</TableCell>
              ))}
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
}
