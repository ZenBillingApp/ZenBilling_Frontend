"use client"

import { useParams, useRouter } from 'next/navigation'
import { useQuote, useDownloadQuotePdf, useUpdateQuote } from '@/hooks/useQuote'
import { useFormat } from '@/hooks/useFormat'
import { useState } from 'react'
import type { EditQuoteSchema } from '@/components/quotes/edit-quote-dialog'
import type { ApiError } from '@/services/api'
import type { IQuoteItem } from '@/types/QuoteItem.interface'
import type { IUpdateQuoteRequest } from '@/types/Quote.request.interface'

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    Building,
    User,
    FileText,
    CalendarDays,
    Clock,
    ArrowLeft,
    Download,
    Ban,
    CheckCircle2,
    AlertCircle,
    Loader2,
    Pencil,
    Send,
    ThumbsUp,
    ThumbsDown
} from 'lucide-react'
import { EditQuoteDialog } from '@/components/quotes/edit-quote-dialog'

export default function QuoteDetailsPage() {
    const params = useParams()
    const router = useRouter()
    const { formatCurrency, formatPercent } = useFormat()
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)

    const { data: quoteData, isLoading } = useQuote(Number(params.id))
    const downloadPdf = useDownloadQuotePdf(quoteData?.quote_number)
    const updateQuote = useUpdateQuote(Number(params.id))

    const handleUpdateQuote = async (data: Partial<EditQuoteSchema>) => {
        const updateData: IUpdateQuoteRequest = {
            quote_date: data.quote_date,
            validity_date: data.validity_date,
            conditions: data.conditions || undefined,
            notes: data.notes || undefined
        }
        await updateQuote.mutateAsync(updateData)
        setIsEditDialogOpen(false)
    }

    const handleUpdateStatus = async (status: 'sent' | 'accepted' | 'rejected') => {
        await updateQuote.mutateAsync({ status })
    }

    const getStatusBadgeVariant = (status: string) => {
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

    const getStatusLabel = (status: string) => {
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

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'accepted':
                return <CheckCircle2 className="w-4 h-4" />
            case 'sent':
                return <Send className="w-4 h-4" />
            case 'draft':
                return <AlertCircle className="w-4 h-4" />
            case 'rejected':
                return <Ban className="w-4 h-4" />
            case 'expired':
                return <Ban className="w-4 h-4" />
            default:
                return null
        }
    }

    if (isLoading) {
        return (
            <div className="container mx-auto px-4 py-6 max-w-5xl">
                <div className="animate-pulse space-y-4">
                    <div className="h-8 bg-muted rounded w-1/4"></div>
                    <div className="h-[200px] bg-muted rounded"></div>
                    <div className="h-[400px] bg-muted rounded"></div>
                </div>
            </div>
        )
    }

    if (!quoteData) {
        return (
            <div className="container mx-auto px-4 py-6 max-w-5xl">
                <Card>
                    <CardHeader>
                        <CardTitle>Devis introuvable</CardTitle>
                        <CardDescription>Ce devis n&apos;existe pas ou a été supprimé.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button onClick={() => router.back()}>
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Retour
                        </Button>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="container mx-auto px-4 py-6 space-y-6 max-w-5xl">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <Button variant="outline" size="icon" onClick={() => router.back()}>
                        <ArrowLeft className="w-4 h-4" />
                    </Button>
                    <h1 className="text-xl sm:text-2xl font-bold font-dmSans flex items-center">
                        <FileText className="w-5 sm:w-6 h-5 sm:h-6 mr-2 flex-shrink-0" />
                        Devis {quoteData?.data?.quote_number}
                    </h1>
                </div>
                <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                    <EditQuoteDialog
                        open={isEditDialogOpen}
                        onOpenChange={setIsEditDialogOpen}
                        onSubmit={handleUpdateQuote}
                        defaultValues={{
                            quote_date: quoteData.data?.quote_date,
                            validity_date: quoteData.data?.validity_date,
                            conditions: quoteData.data?.conditions,
                            notes: quoteData.data?.notes
                        }}
                        isLoading={updateQuote.isPending}
                        isError={updateQuote.isError}
                        error={(updateQuote.error as ApiError)?.response?.data}
                    />
                    <Button variant="outline" onClick={() => setIsEditDialogOpen(true)} className="flex-1 sm:flex-none">
                        <Pencil className="w-4 h-4 mr-2" />
                        Modifier
                    </Button>
                    {quoteData.status === 'draft' && (
                        <Button variant="outline" onClick={() => handleUpdateStatus('sent')} className="flex-1 sm:flex-none">
                            <Send className="w-4 h-4 mr-2" />
                            Marquer comme envoyé
                        </Button>
                    )}
                    {quoteData.status === 'sent' && (
                        <>
                            <Button variant="outline" onClick={() => handleUpdateStatus('accepted')} className="flex-1 sm:flex-none">
                                <ThumbsUp className="w-4 h-4 mr-2" />
                                Marquer comme accepté
                            </Button>
                            <Button variant="outline" onClick={() => handleUpdateStatus('rejected')} className="flex-1 sm:flex-none">
                                <ThumbsDown className="w-4 h-4 mr-2" />
                                Marquer comme refusé
                            </Button>
                        </>
                    )}
                    <Button 
                        variant="outline" 
                        onClick={() => downloadPdf.mutate(Number(params.id))}
                        disabled={downloadPdf.isPending}
                        className="flex-1 sm:flex-none"
                    >
                        {downloadPdf.isPending ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                            <Download className="w-4 h-4 mr-2" />
                        )}
                        Télécharger
                    </Button>
                </div>
            </div>

            <div className="grid gap-6">
                {/* Status Card */}
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full">
                                <Badge variant={getStatusBadgeVariant(quoteData.data?.status)} className="px-4 py-1">
                                    <span className="flex items-center gap-2">
                                        {getStatusIcon(quoteData.data?.status)}
                                        {getStatusLabel(quoteData.data?.status)}
                                    </span>
                                </Badge>
                                <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 text-sm text-muted-foreground w-full">
                                    <div className="flex items-center gap-2">
                                        <CalendarDays className="w-4 h-4 flex-shrink-0" />
                                        <span>Émis le {new Date(quoteData.data?.quote_date).toLocaleDateString()}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Clock className="w-4 h-4 flex-shrink-0" />
                                        <span>Valide jusqu&apos;au {new Date(quoteData.data?.validity_date).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="text-right w-full sm:w-auto">
                                <p className="text-sm text-muted-foreground">Total TTC</p>
                                <p className="text-xl sm:text-2xl font-bold">{formatCurrency(quoteData.data?.amount_including_tax)}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Client Info */}
                <Card>
                    <CardHeader>
                        <CardTitle>Client</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-6">
                            <div className="flex items-start gap-4">
                                <Badge variant="outline" className="mt-1">
                                    {quoteData.data?.Customer?.type === 'company' ? (
                                        <Building className="w-4 h-4" />
                                    ) : (
                                        <User className="w-4 h-4" />
                                    )}
                                </Badge>
                                <div>
                                    <p className="font-medium">
                                        {quoteData.data?.Customer?.type === 'company'
                                            ? quoteData.data?.Customer.BusinessCustomer?.name
                                            : `${quoteData.data?.Customer?.IndividualCustomer?.first_name} ${quoteData.data?.Customer?.IndividualCustomer?.last_name}`}
                                    </p>
                                    <p className="text-sm text-muted-foreground">{quoteData.data?.Customer?.email || '-'}</p>
                                </div>
                            </div>

                            <div className="grid gap-4">
                                {quoteData.data?.Customer?.type === 'company' && (
                                    <>
                                        {/* Informations entreprise */}
                                        <div className="space-y-2">
                                            <h3 className="text-sm font-medium">Informations entreprise</h3>
                                            <div className="space-y-1 text-sm text-muted-foreground">
                                                {quoteData.data?.Customer.BusinessCustomer?.vat_number && (
                                                    <p>N° TVA : {quoteData.data?.Customer.BusinessCustomer.vat_number}</p>
                                                )}
                                                {quoteData.data?.Customer.BusinessCustomer?.registration_number && (
                                                    <p>SIRET : {quoteData.data?.Customer.BusinessCustomer.registration_number}</p>
                                                )}
                                            </div>
                                        </div>
                                    </>
                                )}

                                {/* Adresse de facturation */}
                                {(quoteData.Customer?.address ||
                                  quoteData.data?.Customer?.postal_code ||
                                  quoteData.data?.Customer?.city ||
                                  quoteData.data?.Customer?.country) && (
                                    <div className="space-y-2">
                                        <h3 className="text-sm font-medium">Adresse</h3>
                                        <div className="space-y-1 text-sm text-muted-foreground">
                                            {quoteData.data?.Customer?.address && (
                                                <p>{quoteData.data?.Customer.address}</p>
                                            )}
                                            <p>
                                                {quoteData.data?.Customer?.postal_code} {quoteData.data?.Customer?.city}
                                            </p>
                                            {quoteData.data?.Customer?.country && (
                                                <p>{quoteData.data?.Customer.country}</p>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Informations de contact */}
                                {quoteData.data?.Customer?.phone && (
                                    <div className="space-y-2">
                                        <h3 className="text-sm font-medium">Contact</h3>
                                        <p className="text-sm text-muted-foreground">{quoteData.data?.Customer.phone}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Products Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>Produits</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-[40%]">Produit</TableHead>
                                        <TableHead className="hidden sm:table-cell">Prix unitaire HT</TableHead>
                                        <TableHead className="hidden sm:table-cell">TVA</TableHead>
                                        <TableHead>Quantité</TableHead>
                                        <TableHead className="hidden sm:table-cell">Unité</TableHead>
                                        <TableHead className="hidden lg:table-cell">Total HT</TableHead>
                                        <TableHead>Total TTC</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {quoteData.data?.QuoteItems?.map((item: IQuoteItem) => {
                                        const totalHT = item.quantity * item.unit_price_excluding_tax
                                        const totalTTC = totalHT * (1 + item.vat_rate / 100)

                                        return (
                                            <TableRow key={item.item_id}>
                                                <TableCell>
                                                    <div>
                                                        <p className="font-medium">{item.name}</p>
                                                        {item.description && (
                                                            <p className="text-sm text-muted-foreground line-clamp-2">{item.description}</p>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="hidden sm:table-cell">{formatCurrency(item.unit_price_excluding_tax)}</TableCell>
                                                <TableCell className="hidden sm:table-cell">{formatPercent(item.vat_rate)}</TableCell>
                                                <TableCell>{item.quantity}</TableCell>
                                                <TableCell className="hidden sm:table-cell">
                                                    <Badge variant="outline" className="w-fit">
                                                        {item.unit}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="hidden lg:table-cell">{formatCurrency(totalHT)}</TableCell>
                                                <TableCell>{formatCurrency(totalTTC)}</TableCell>
                                            </TableRow>
                                        )
                                    })}
                                </TableBody>
                            </Table>
                        </div>

                        <div className="mt-6 space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Total HT</span>
                                <span>{formatCurrency(quoteData.data?.amount_excluding_tax)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">TVA</span>
                                <span>{formatCurrency(quoteData.data?.tax)}</span>
                            </div>
                            <Separator />
                            <div className="flex justify-between font-medium">
                                <span>Total TTC</span>
                                <span>{formatCurrency(quoteData.data?.amount_including_tax)}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Additional Information */}
                {(quoteData.data?.conditions || quoteData.data?.notes) && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Informations complémentaires</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {quoteData.data?.conditions && (
                                <div className="space-y-2">
                                    <h3 className="font-medium">Conditions</h3>
                                    <p className="text-sm text-muted-foreground">{quoteData.data?.conditions}</p>
                                </div>
                            )}
                            {quoteData.data?.notes && (
                                <div className="space-y-2">
                                    <h3 className="font-medium">Notes</h3>
                                    <p className="text-sm text-muted-foreground">{quoteData.data?.notes}</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    )
} 