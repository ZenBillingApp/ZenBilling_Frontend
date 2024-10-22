import React from "react";

import { Customer } from "@/types/Customer";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type Props = {
  customers: Customer[];
  handleSelectCustomer: (clientId: number) => void;
};

export default function TableCustomers({
  customers,
  handleSelectCustomer,
}: Props) {
  return (
    <Table>
      <TableHeader>
        <TableHead>ID</TableHead>
        <TableHead>Prénom</TableHead>
        <TableHead>Nom</TableHead>
        <TableHead>Email</TableHead>
        <TableHead>Téléphone</TableHead>
        <TableHead>Pays</TableHead>
        <TableHead>Nombre de factures</TableHead>
      </TableHeader>
      <TableBody>
        {customers?.length === 0 ? (
          <TableRow>
            <TableCell colSpan={8} className="text-center">
              Aucun client trouvé
            </TableCell>
          </TableRow>
        ) : (
          customers?.map((customer) => (
            <TableRow
              key={customer.client_id}
              onClick={() => handleSelectCustomer(customer.client_id)}
              className="cursor-pointer"
            >
              <TableCell>{customer.client_id}</TableCell>
              <TableCell>{customer.first_name}</TableCell>
              <TableCell>{customer.last_name}</TableCell>
              <TableCell>{customer.email}</TableCell>
              <TableCell>{customer.phone}</TableCell>
              <TableCell>{customer.country}</TableCell>
              <TableCell>{customer.invoice_count}</TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
}
