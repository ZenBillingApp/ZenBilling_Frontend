"use client"

import React, { useState } from 'react'
import { useInvoices } from '@/hooks/useInvoice'
import { useFormat } from '@/hooks/useFormat'
import { useDebounce } from '@/hooks/useDebounce'
import { DateRange } from 'react-day-picker'

import { FileStack, ShoppingCart, Search, Plus } from 'lucide-react'

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
import { DatePickerWithRange } from '@/components/ui/date-range-picker'

import { Loader2 } from 'lucide-react'
import { IInvoice } from '@/types/Invoice.interface'
import { User, Building, CalendarDays, Clock } from 'lucide-react'

export default function InvoicesPage() {
    const [search, setSearch] = useState('')
    const [page, setPage] = useState(1)
    const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'paid' | 'cancelled'>('all')
    const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined)
    
    const debouncedSearch = useDebounce(search, 300)
    
    const { data, isLoading } = useInvoices({
        search: debouncedSearch || undefined,
        status: statusFilter === 'all' ? undefined : statusFilter,
        start_date: dateRange?.from?.toISOString(),
        end_date: dateRange?.to?.toISOString(),
        limit: 25,
        page: page
    })

    const { formatCurrency } = useFormat()
    const totalPages = data?.data.pagination.totalPages

    const handleCreateInvoice = () => {
        // TODO: Implement create invoice modal
    }

    const getStatusBadgeVariant = (status: string) => {
        switch (status) {
            case 'paid':
                return 'default'
            case 'pending':
                return 'secondary'
            case 'cancelled':
                return 'destructive'
            default:
                return 'secondary'
        }
    }

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'pending':
                return 'En attente'
            case 'paid':
                return 'Payée'
            case 'cancelled':
                return 'Annulée'
            default:
                return status
        }
    }

    return (
        <div className="container mx-auto px-4 py-6 space-y-6 max-w-7xl">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h1 className="text-2xl font-bold font-dmSans flex items-center">
                    <FileStack className="w-6 h-6 mr-2" />
                    Factures
                </h1>
                <Button onClick={handleCreateInvoice} className="flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    Nouvelle facture
                </Button>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Rechercher une facture..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-8"
                    />
                </div>
                <div className="w-full sm:w-[200px]">
                    <Select
                        value={statusFilter}
                        onValueChange={(value: 'all' | 'pending' | 'paid' | 'cancelled') => setStatusFilter(value)}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Statut" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Tous</SelectItem>
                            <SelectItem value="pending">En attente</SelectItem>
                            <SelectItem value="paid">Payée</SelectItem>
                            <SelectItem value="cancelled">Annulée</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="w-full sm:w-[300px]">
                    <DatePickerWithRange date={dateRange} setDate={setDateRange} />
                </div>
            </div>

                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Type</TableHead>
                            <TableHead>N° Facture</TableHead>
                            <TableHead>Client</TableHead>
                            <TableHead>Statut</TableHead>
                            <TableHead>Produits</TableHead>
                            <TableHead>Dates</TableHead>
                            <TableHead>Total TTC</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center py-8">
                                    <div className="flex justify-center items-center h-full w-full">
                                        <Loader2 className="w-6 h-6 animate-spin" />
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : !data?.data?.invoices?.length ? (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                                    Aucune facture trouvée
                                </TableCell>
                            </TableRow>
                        ) : (
                            data?.data?.invoices?.map((invoice: IInvoice) => (
                                <TableRow key={invoice.invoice_id} className="cursor-pointer hover:bg-muted/50">
                                    <TableCell>
                                        <Badge variant="outline" className="w-fit">
                                            {invoice.Customer?.type === 'company' ? (
                                                <Building className="w-4 h-4" />
                                            ) : (
                                                <User className="w-4 h-4" />
                                            )}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="font-medium">
                                        {invoice.invoice_number}
                                    </TableCell>
                                    <TableCell>
                                        {invoice.Customer?.type === 'company'
                                            ? invoice.Customer.BusinessCustomer?.name
                                            : `${invoice.Customer?.IndividualCustomer?.first_name} ${invoice.Customer?.IndividualCustomer?.last_name}`}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={getStatusBadgeVariant(invoice.status)}>
                                            {getStatusLabel(invoice.status)}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className="flex items-center gap-2">
                                            <ShoppingCart className="w-4 h-4" />
                                            {invoice.InvoiceItems?.length || 0}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2 text-sm">
                                                <CalendarDays className="w-4 h-4 text-muted-foreground" />
                                                <span>{new Date(invoice.invoice_date).toLocaleDateString()}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-sm">
                                                <Clock className="w-4 h-4 text-muted-foreground" />
                                                <span>{new Date(invoice.due_date).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="font-medium">
                                        {formatCurrency(invoice.amount_including_tax)}
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>

            {totalPages > 1 && (
                <div className="flex justify-center">
                    <Pagination>
                        <PaginationContent>
                            <PaginationItem>
                                <PaginationPrevious
                                    className="hidden sm:flex cursor-pointer"
                                    onClick={() => setPage(p => Math.max(1, p - 1))}
                                    isActive={page !== 1}
                                />
                            </PaginationItem>
                            {[...Array(totalPages)].map((_, i) => {
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
                                <PaginationNext
                                    className="hidden sm:flex cursor-pointer"
                                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                    isActive={page !== totalPages}
                                />
                            </PaginationItem>
                        </PaginationContent>
                    </Pagination>
                </div>
            )}
        </div>
    )
}