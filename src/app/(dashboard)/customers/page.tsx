"use client"

import React, { useState } from 'react'
import { useCustomers } from '@/hooks/useCustomer'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Loader2, MapPin, Plus, Search } from 'lucide-react'
import { ICustomer } from '@/types/Customer.interface'
import { User, Building, User2Icon } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useDebounce } from '@/hooks/useDebounce'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
  } from "@/components/ui/pagination"
import NiceModal from '@ebay/nice-modal-react'
import CreateCustomerDialog from '@/components/customers/create-customer-dialog'
import EditCustomerDialog from '@/components/customers/edit-customer-dialog'

export default function CustomersPage() {
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [typeFilter, setTypeFilter] = useState<'all' | 'individual' | 'company'>('all')
  const debouncedSearch = useDebounce(search, 300)
  const { data, isLoading } = useCustomers({
    search: debouncedSearch || undefined,
    type: typeFilter === 'all' ? undefined : typeFilter,
    limit: 25,
    page: page
  })
  const totalPages = data?.data.pagination.totalPages


  const handleCreateCustomer = () => {
    NiceModal.show(CreateCustomerDialog)
  }

  const handleEditCustomer = (customer: ICustomer) => {
    NiceModal.show(EditCustomerDialog, { customer })
  }

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

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher un client..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8"
          />
        </div>
        <div className="w-full sm:w-[200px]">
          <Select
            value={typeFilter}
            onValueChange={(value: 'all' | 'individual' | 'company') => setTypeFilter(value)}
          >
            <SelectTrigger>
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
                className="cursor-pointer transition-colors"
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
            {
                isLoading ? (
                    <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        <div className="flex justify-center items-center h-full w-full">
                      <Loader2 className="w-6 h-6 animate-spin" />
                    </div>
                        </TableCell>
                    </TableRow>
                ) : 
                   
            !data?.data?.customers?.length && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  Aucun client trouvé
                </TableCell>
              </TableRow>
            )
          }

          </TableBody>
        </Table>
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center py-4 border-t">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious className='hidden sm:flex cursor-pointer' onClick={() => setPage(p => Math.max(1, p - 1))} isActive={page !== 1} />
                </PaginationItem>
                {[...Array(totalPages)].map((_, i) => {
                  // Afficher seulement les 3 pages autour de la page courante sur mobile
                  if (window.innerWidth < 640 && Math.abs(page - (i + 1)) > 1) {
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
                  <PaginationNext className='hidden sm:flex cursor-pointer' onClick={() => setPage(p => Math.min(totalPages, p + 1))} isActive={page !== totalPages} />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
    </div>
  )
}