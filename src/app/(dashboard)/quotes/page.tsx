"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useQuotes } from '@/hooks/useQuote'
import { useFormat } from '@/hooks/useFormat'
import { useDebounce } from '@/hooks/useDebounce'

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Loader2, Plus, Search, FileText } from 'lucide-react'

import type { IQuote, QuoteStatus } from '@/types/Quote.interface'

export default function QuotesPage() {
    const router = useRouter()
    const { formatCurrency } = useFormat()
    const [search, setSearch] = useState('')
    const debouncedSearch = useDebounce(search, 500)
    const [status, setStatus] = useState<QuoteStatus | ''>('')

    const { data: quotesData, isLoading } = useQuotes({
        search: debouncedSearch,
        status: status || undefined
    })

    const getStatusBadgeVariant = (status: QuoteStatus) => {
        switch (status) {
            case 'accepted':
                return 'default'
            case 'sent':
                return 'secondary'
            case 'draft':
                return 'outline'
            case 'rejected':
                return 'destructive'
            case 'expired':
                return 'destructive'
            default:
                return 'secondary'
        }
    }

    const getStatusLabel = (status: QuoteStatus) => {
        switch (status) {
            case 'draft':
                return 'Brouillon'
            case 'sent':
                return 'Envoyé'
            case 'accepted':
                return 'Accepté'
            case 'rejected':
                return 'Refusé'
            case 'expired':
                return 'Expiré'
            default:
                return status
        }
    }

    return (
        <div className="container mx-auto px-4 py-6 space-y-6 max-w-7xl">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <h1 className="text-2xl font-bold font-dmSans flex items-center">
                    <FileText className="w-6 h-6 mr-2" />
                    Devis
                </h1>
                <Button onClick={() => router.push('/quotes/create')} className="w-full sm:w-auto">
                    <Plus className="w-4 h-4 mr-2" />
                    Nouveau devis
                </Button>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Rechercher un devis..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-8"
                    />
                </div>
                <Select
                    value={status}
                    onValueChange={(value) => setStatus(value as QuoteStatus)}
                >
                    <SelectTrigger className="w-full sm:w-[180px]">
                        <SelectValue placeholder="Tous les statuts" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="draft">Brouillon</SelectItem>
                        <SelectItem value="sent">Envoyé</SelectItem>
                        <SelectItem value="accepted">Accepté</SelectItem>
                        <SelectItem value="rejected">Refusé</SelectItem>
                        <SelectItem value="expired">Expiré</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {isLoading ? (
                <div className="flex justify-center items-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            ) : quotesData?.data.quotes.length === 0 ? (
                <div className="text-center py-12">
                    <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h3 className="mt-4 text-lg font-medium">Aucun devis</h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                        Commencez par créer un nouveau devis.
                    </p>
                    <div className="mt-6">
                        <Button onClick={() => router.push('/quotes/create')}>
                            <Plus className="w-4 h-4 mr-2" />
                            Nouveau devis
                        </Button>
                    </div>
                </div>
            ) : (
                <div className="bg-card">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="font-medium">Numéro</TableHead>
                                    <TableHead className="font-medium">Client</TableHead>
                                    <TableHead className="font-medium hidden md:table-cell">Date</TableHead>
                                    <TableHead className="font-medium hidden lg:table-cell">Validité</TableHead>
                                    <TableHead className="font-medium text-right">Montant TTC</TableHead>
                                    <TableHead className="font-medium">Statut</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {quotesData?.data.quotes.map((quote: IQuote) => (
                                    <TableRow
                                        key={quote.quote_id}
                                        className="cursor-pointer hover:bg-muted/50"
                                        onClick={() => router.push(`/quotes/${quote.quote_id}`)}
                                    >
                                        <TableCell className="font-medium text-nowrap">{quote.quote_number}</TableCell>
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span className="font-medium text-nowrap">
                                                    {quote.Customer?.type === 'company'
                                                        ? quote.Customer.BusinessCustomer?.name
                                                        : `${quote.Customer?.IndividualCustomer?.first_name} ${quote.Customer?.IndividualCustomer?.last_name}`}
                                                </span>
                                                <span className="text-sm text-muted-foreground hidden sm:block text-nowrap">
                                                    {quote.Customer?.email}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="hidden md:table-cell text-nowrap">
                                            {new Date(quote.quote_date).toLocaleDateString()}
                                        </TableCell>
                                        <TableCell className="hidden lg:table-cell text-nowrap">
                                            {new Date(quote.validity_date).toLocaleDateString()}
                                        </TableCell>
                                        <TableCell className="text-right font-medium tabular-nums text-nowrap">
                                            {formatCurrency(quote.amount_including_tax)}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={getStatusBadgeVariant(quote.status)} className="w-fit whitespace-nowrap">
                                                {getStatusLabel(quote.status)}
                                            </Badge>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            )}
        </div>
    )
} 