"use client"

import { useParams, useRouter } from 'next/navigation'
import { useInvoice } from '@/hooks/useInvoice'
import { useFormat } from '@/hooks/useFormat'

import { IInvoiceItem } from '@/types/InvoiceItem.interface'

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
    Send,
    Ban,
    CheckCircle2,
    AlertCircle
} from 'lucide-react'

export default function InvoiceDetailsPage() {
    const params = useParams()
    const router = useRouter()
    const { formatCurrency, formatPercent } = useFormat()

    const { data: invoiceData, isLoading } = useInvoice(Number(params.id))

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

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'paid':
                return <CheckCircle2 className="w-4 h-4" />
            case 'pending':
                return <AlertCircle className="w-4 h-4" />
            case 'cancelled':
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

    if (!invoiceData) {
        return (
            <div className="container mx-auto px-4 py-6 max-w-5xl">
                <Card>
                    <CardHeader>
                        <CardTitle>Facture introuvable</CardTitle>
                        <CardDescription>Cette facture n&apos;existe pas ou a été supprimée.</CardDescription>
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
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon" onClick={() => router.back()}>
                        <ArrowLeft className="w-4 h-4" />
                    </Button>
                    <h1 className="text-2xl font-bold font-dmSans flex items-center">
                        <FileText className="w-6 h-6 mr-2" />
                        Facture {invoiceData?.invoice_number}
                    </h1>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline">
                        <Download className="w-4 h-4 mr-2" />
                        Télécharger
                    </Button>
                    <Button variant="outline">
                        <Send className="w-4 h-4 mr-2" />
                        Envoyer
                    </Button>
                </div>
            </div>

            <div className="grid gap-6">
                {/* Status Card */}
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <div className="flex items-center gap-4">
                                <Badge variant={getStatusBadgeVariant(invoiceData.status)} className="px-4 py-1">
                                    <span className="flex items-center gap-2">
                                        {getStatusIcon(invoiceData.status)}
                                        {getStatusLabel(invoiceData.status)}
                                    </span>
                                </Badge>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <CalendarDays className="w-4 h-4" />
                                    <span>Émise le {new Date(invoiceData.invoice_date).toLocaleDateString()}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Clock className="w-4 h-4" />
                                    <span>Échéance le {new Date(invoiceData.due_date).toLocaleDateString()}</span>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-sm text-muted-foreground">Total TTC</p>
                                <p className="text-2xl font-bold">{formatCurrency(invoiceData.amount_including_tax)}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Client & Company Info */}
                <div className="grid sm:grid-cols-2 gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Client</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-6">
                                <div className="flex items-start gap-4">
                                    <Badge variant="outline" className="mt-1">
                                        {invoiceData.Customer?.type === 'company' ? (
                                            <Building className="w-4 h-4" />
                                        ) : (
                                            <User className="w-4 h-4" />
                                        )}
                                    </Badge>
                                    <div>
                                        <p className="font-medium">
                                            {invoiceData.Customer?.type === 'company'
                                                ? invoiceData.Customer.BusinessCustomer?.name
                                                : `${invoiceData.Customer?.IndividualCustomer?.first_name} ${invoiceData.Customer?.IndividualCustomer?.last_name}`}
                                        </p>
                                        <p className="text-sm text-muted-foreground">{invoiceData.Customer?.email || '-'}</p>
                                    </div>
                                </div>

                                <div className="grid gap-4">
                                    {invoiceData.Customer?.type === 'company' && (
                                        <>
                                            {/* Informations entreprise */}
                                            <div className="space-y-2">
                                                <h3 className="text-sm font-medium">Informations entreprise</h3>
                                                <div className="space-y-1 text-sm text-muted-foreground">
                                                    {invoiceData.Customer.BusinessCustomer?.vat_number && (
                                                        <p>N° TVA : {invoiceData.Customer.BusinessCustomer.vat_number}</p>
                                                    )}
                                                    {invoiceData.Customer.BusinessCustomer?.registration_number && (
                                                        <p>SIRET : {invoiceData.Customer.BusinessCustomer.registration_number}</p>
                                                    )}
                                                </div>
                                            </div>
                                        </>
                                    )}

                                    {/* Adresse de facturation */}
                                    {(invoiceData.Customer?.address ||
                                      invoiceData.Customer?.postal_code ||
                                      invoiceData.Customer?.city ||
                                      invoiceData.Customer?.country) && (
                                        <div className="space-y-2">
                                            <h3 className="text-sm font-medium">Adresse de facturation</h3>
                                            <div className="space-y-1 text-sm text-muted-foreground">
                                                {invoiceData.Customer?.address && (
                                                    <p>{invoiceData.Customer.address}</p>
                                                )}
                                                
                                                <p>
                                                    {invoiceData.Customer?.postal_code} {invoiceData.Customer?.city}
                                                </p>
                                                {invoiceData.Customer?.country && (
                                                    <p>{invoiceData.Customer.country}</p>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* Informations de contact */}
                                    {invoiceData.Customer?.phone && (
                                        <div className="space-y-2">
                                            <h3 className="text-sm font-medium">Contact</h3>
                                            <p className="text-sm text-muted-foreground">{invoiceData.Customer.phone}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Votre entreprise</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-6">
                                <div className="flex items-start gap-4">
                                    <Badge variant="outline" className="mt-1">
                                        <Building className="w-4 h-4" />
                                    </Badge>
                                    <div>
                                        <p className="font-medium">{invoiceData.Company?.name}</p>
                                        <p className="text-sm text-muted-foreground">{invoiceData.Company?.email}</p>
                                    </div>
                                </div>

                                <div className="grid gap-4">
                                    {/* Informations légales */}
                                    <div className="space-y-2">
                                        <h3 className="text-sm font-medium">Informations légales</h3>
                                        <div className="space-y-1 text-sm text-muted-foreground">
                                            {invoiceData.Company?.vat_number && (
                                                <p>N° TVA : {invoiceData.Company.vat_number}</p>
                                            )}
                                            {invoiceData.Company?.siret && (
                                                <p>SIRET : {invoiceData.Company.siret}</p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Adresse */}
                                    {(invoiceData.Company?.address ||
                                      invoiceData.Company?.postal_code ||
                                      invoiceData.Company?.city ||
                                      invoiceData.Company?.country) && (
                                        <div className="space-y-2">
                                            <h3 className="text-sm font-medium">Adresse</h3>
                                            <div className="space-y-1 text-sm text-muted-foreground">
                                                {invoiceData.Company?.address && (
                                                    <p>{invoiceData.Company.address}</p>
                                                )}
                                                <p>
                                                    {invoiceData.Company?.postal_code} {invoiceData.Company?.city}
                                                </p>
                                                {invoiceData.Company?.country && (
                                                    <p>{invoiceData.Company.country}</p>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* Contact */}
                                    {(invoiceData.Company?.phone || invoiceData.Company?.website) && (
                                        <div className="space-y-2">
                                            <h3 className="text-sm font-medium">Contact</h3>
                                            <div className="space-y-1 text-sm text-muted-foreground">
                                                {invoiceData.Company?.phone && (
                                                    <p>{invoiceData.Company.phone}</p>
                                                )}
                                                {invoiceData.Company?.website && (
                                                    <p>{invoiceData.Company.website}</p>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Products Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>Produits</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[40%]">Produit</TableHead>
                                    <TableHead>Prix unitaire HT</TableHead>
                                    <TableHead>TVA</TableHead>
                                    <TableHead>Quantité</TableHead>
                                    <TableHead>Total HT</TableHead>
                                    <TableHead>Total TTC</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {invoiceData.InvoiceItems?.map((item: IInvoiceItem) => {
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
                                            <TableCell>{formatCurrency(item.unit_price_excluding_tax)}</TableCell>
                                            <TableCell>{formatPercent(item.vat_rate)}</TableCell>
                                            <TableCell>{item.quantity}</TableCell>
                                            <TableCell>{formatCurrency(totalHT)}</TableCell>
                                            <TableCell>{formatCurrency(totalTTC)}</TableCell>
                                        </TableRow>
                                    )
                                })}
                            </TableBody>
                        </Table>

                        <div className="mt-6 space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Total HT</span>
                                <span>{formatCurrency(invoiceData.amount_excluding_tax)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">TVA</span>
                                <span>{formatCurrency(invoiceData.tax)}</span>
                            </div>
                            <Separator />
                            <div className="flex justify-between font-medium">
                                <span>Total TTC</span>
                                <span>{formatCurrency(invoiceData.amount_including_tax)}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Additional Information */}
                {(invoiceData.conditions || invoiceData.late_payment_penalty) && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Informations complémentaires</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {invoiceData.conditions && (
                                <div className="space-y-2">
                                    <h3 className="font-medium">Conditions de paiement</h3>
                                    <p className="text-sm text-muted-foreground">{invoiceData.conditions}</p>
                                </div>
                            )}
                            {invoiceData.late_payment_penalty && (
                                <div className="space-y-2">
                                    <h3 className="font-medium">Pénalités de retard</h3>
                                    <p className="text-sm text-muted-foreground">{invoiceData.late_payment_penalty}</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    )
} 