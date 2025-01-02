"use client"

import React from 'react'
import { useCustomers } from '@/hooks/useCustomer'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card } from '@/components/ui/card'
import { Loader2, MapPin, Plus } from 'lucide-react'
import { ICustomer } from '@/types/Customer.interface'
import { User, Building, User2Icon } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import NiceModal from '@ebay/nice-modal-react'
import CreateCustomerDialog from '@/components/customers/create-customer-dialog'
import EditCustomerDialog from '@/components/customers/edit-customer-dialog'

export default function CustomersPage() {
  const { data, isLoading } = useCustomers()

  const handleCreateCustomer = () => {
    NiceModal.show(CreateCustomerDialog)
  }

  const handleEditCustomer = (customer: ICustomer) => {
    NiceModal.show(EditCustomerDialog, { customer })
  }

  if(isLoading) return <div className='flex justify-center items-center h-screen'>
    <Loader2 className="w-6 h-6 animate-spin" />
  </div>

  return (
    <div className="container mx-auto px-4 py-6 space-y-6 max-w-7xl">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold font-dmSans flex items-center">
          <User2Icon className="w-6 h-6 mr-2" />
          Clients
        </h1>
        <Button onClick={handleCreateCustomer} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Nouveau client
        </Button>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Type</TableHead>
              <TableHead>Nom</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Téléphone</TableHead>
              <TableHead>Adresse</TableHead>
              <TableHead>Ville</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data?.data?.customers?.map((customer: ICustomer) => (
              <TableRow 
                key={customer.customer_id} 
                className="hover:bg-gray-100 cursor-pointer transition-colors"
                onClick={() => handleEditCustomer(customer)}
              >
                <TableCell>
                  {customer.type === 'company' ? (
                    <Badge variant="outline" className="flex items-center gap-2 w-fit">
                      <Building className="w-4 h-4" />
                      Pro
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="flex items-center gap-2 w-fit">
                      <User className="w-4 h-4" />
                      Part.
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="font-medium">
                  {customer.type === 'company' 
                    ? customer.BusinessCustomer?.name 
                    : `${customer.IndividualCustomer?.first_name} ${customer.IndividualCustomer?.last_name}`}
                </TableCell>
                <TableCell>
                  <span className="text-muted-foreground">
                    {customer.email || "-"}
                  </span>
                </TableCell>
                <TableCell>
                  <span className="text-muted-foreground">
                    {customer.phone || "-"}
                  </span>
                </TableCell>
                <TableCell>
                  {customer.address ? (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="w-4 h-4 shrink-0" />
                      <span className="truncate">{customer.address}</span>
                    </div>
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )}
                </TableCell>
                <TableCell>
                  <span className="text-muted-foreground">
                    {customer.city || "-"}
                  </span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  )
}