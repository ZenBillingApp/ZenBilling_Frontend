"use client"

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useFormat } from '@/hooks/useFormat'
import { useCreateQuote } from '@/hooks/useQuote'

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { DatePicker } from "@/components/ui/date-picker"
import { CustomerSelectSheet } from "@/components/customers/customer-select-sheet"
import { ProductSelectDialog } from "@/components/products/product-select-dialog"
import { Building, User, Plus, X, FileText, ArrowLeft } from 'lucide-react'

import type { ICustomer } from '@/types/Customer.interface'
import type { IProduct, VatRate } from '@/types/Product.interface'
import type { IQuoteItem } from '@/types/Quote.request.interface'
import type { NewProductSchema } from '@/components/products/product-select-dialog'
import { ProductUnit } from '@/types/Product.interface'

interface QuoteItemWithUnit extends IQuoteItem {
    unit: ProductUnit;
}

export default function CreateQuotePage() {
    const router = useRouter()
    const { formatCurrency, formatPercent, formatQuantity } = useFormat()
    const [isCustomerSheetOpen, setIsCustomerSheetOpen] = useState(false)
    const [isProductDialogOpen, setIsProductDialogOpen] = useState(false)
    const [selectedCustomer, setSelectedCustomer] = useState<ICustomer | null>(null)
    const [items, setItems] = useState<QuoteItemWithUnit[]>([])
    const [conditions, setConditions] = useState('')
    const [notes, setNotes] = useState('')
    const [quoteDate, setQuoteDate] = useState<Date>(new Date())
    const [validityDate, setValidityDate] = useState<Date>(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000))

    const createQuote = useCreateQuote()

    const handleAddProduct = (product: IProduct) => {
        setItems(prev => [...prev, {
            product_id: product.product_id,
            name: product.name,
            description: product.description || undefined,
            quantity: 1,
            unit: product.unit,
            unit_price_excluding_tax: product.price_excluding_tax,
            vat_rate: product.vat_rate
        }])
    }

    const handleAddCustomProduct = (data: NewProductSchema) => {
        setItems(prev => [...prev, {
            name: data.name,
            description: data.description || undefined,
            quantity: 1,
            unit: data.unit as ProductUnit,
            unit_price_excluding_tax: Number(data.price_excluding_tax),
            vat_rate: Number(data.vat_rate) as VatRate,
            save_as_product: data.save_as_product
        }])
    }

    const handleRemoveItem = (index: number) => {
        setItems(prev => prev.filter((_, i) => i !== index))
    }

    const handleUpdateQuantity = (index: number, quantity: number) => {
        setItems(prev => prev.map((item, i) => {
            if (i === index) {
                return { ...item, quantity }
            }
            return item
        }))
    }

    const handleCreateQuote = () => {
        if (!selectedCustomer || items.length === 0) return

        createQuote.mutate({
            customer_id: selectedCustomer.customer_id!,
            quote_date: quoteDate,
            validity_date: validityDate,
            items,
            conditions: conditions || undefined,
            notes: notes || undefined
        }, {
            onSuccess: () => {
                router.push('/quotes')
            }
        })
    }

    const calculateTotal = () => {
        return items.reduce((total, item) => {
            const itemTotal = item.quantity * item.unit_price_excluding_tax
            const vatAmount = itemTotal * (item.vat_rate / 100)
            return total + itemTotal + vatAmount
        }, 0)
    }

    return (
        <div className="container mx-auto px-4 py-6 space-y-6 max-w-5xl">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon" onClick={() => router.back()}>
                        <ArrowLeft className="w-4 h-4" />
                    </Button>
                    <h1 className="text-2xl font-bold font-dmSans flex items-center">
                        <FileText className="w-6 h-6 mr-2" />
                        Nouveau Devis
                    </h1>
                </div>
                <Button onClick={handleCreateQuote} disabled={!selectedCustomer || items.length === 0}>
                    Créer le devis
                </Button>
            </div>

            <div className="grid gap-6">
                {/* Client Selection */}
                <Card>
                    <CardHeader>
                        <CardTitle>Client</CardTitle>
                        <CardDescription>Sélectionnez le client pour ce devis</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {selectedCustomer ? (
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <Badge variant="outline">
                                        {selectedCustomer.type === 'company' ? (
                                            <Building className="w-4 h-4" />
                                        ) : (
                                            <User className="w-4 h-4" />
                                        )}
                                    </Badge>
                                    <div>
                                        <p className="font-medium">
                                            {selectedCustomer.type === 'company'
                                                ? selectedCustomer.BusinessCustomer?.name
                                                : `${selectedCustomer.IndividualCustomer?.first_name} ${selectedCustomer.IndividualCustomer?.last_name}`}
                                        </p>
                                        <p className="text-sm text-muted-foreground">{selectedCustomer.email}</p>
                                    </div>
                                </div>
                                <Button variant="outline" onClick={() => setSelectedCustomer(null)}>
                                    Changer
                                </Button>
                            </div>
                        ) : (
                            <Button onClick={() => setIsCustomerSheetOpen(true)}>
                                Sélectionner un client
                            </Button>
                        )}
                    </CardContent>
                </Card>

                {/* Date Selection */}
                <Card>
                    <CardHeader>
                        <CardTitle>Date</CardTitle>
                        <CardDescription>Sélectionnez la date du devis et sa date de validité</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Date du devis</Label>
                                <DatePicker
                                    date={quoteDate}
                                    setDate={(date) => date && setQuoteDate(date)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Date de validité</Label>
                                <DatePicker
                                    date={validityDate}
                                    setDate={(date) => date && setValidityDate(date)}
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Products List */}
                <Card>
                    <CardHeader>
                        <CardTitle>Produits</CardTitle>
                        <CardDescription>Ajoutez les produits au devis</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex gap-4">
                                <Button onClick={() => setIsProductDialogOpen(true)}>
                                    <Plus className="w-4 h-4 mr-2" />
                                    Ajouter un produit
                                </Button>
                            </div>

                            {items.length > 0 && (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Produit</TableHead>
                                            <TableHead>Prix unitaire HT</TableHead>
                                            <TableHead>TVA</TableHead>
                                            <TableHead>Quantité</TableHead>
                                            <TableHead>Unité</TableHead>
                                            <TableHead>Total HT</TableHead>
                                            <TableHead>Total TTC</TableHead>
                                            <TableHead></TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {items.map((item, index) => {
                                            const totalHT = item.quantity * item.unit_price_excluding_tax
                                            const totalTTC = totalHT * (1 + item.vat_rate / 100)
                                            
                                            return (
                                                <TableRow key={index}>
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
                                                    <TableCell>
                                                        <Input
                                                            type="number"
                                                            value={formatQuantity(item.quantity)}
                                                            onChange={(e) => handleUpdateQuantity(index, Number(e.target.value))}
                                                            min={1}
                                                            className="w-20"
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge variant="outline" className="w-fit">
                                                            {item.unit}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>{formatCurrency(totalHT)}</TableCell>
                                                    <TableCell>{formatCurrency(totalTTC)}</TableCell>
                                                    <TableCell>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => handleRemoveItem(index)}
                                                        >
                                                            <X className="w-4 h-4" />
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            )
                                        })}
                                        <TableRow>
                                            <TableCell colSpan={4} className="text-right font-medium">
                                                Total
                                            </TableCell>
                                            <TableCell className="font-medium">
                                                {formatCurrency(items.reduce((total, item) => total + (item.quantity * item.unit_price_excluding_tax), 0))}
                                            </TableCell>
                                            <TableCell className="font-medium">
                                                {formatCurrency(calculateTotal())}
                                            </TableCell>
                                            <TableCell />
                                        </TableRow>
                                    </TableBody>
                                </Table>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Additional Information */}
                <Card>
                    <CardHeader>
                        <CardTitle>Informations complémentaires</CardTitle>
                        <CardDescription>Ajoutez des conditions et notes</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="conditions">Conditions</Label>
                            <Textarea
                                id="conditions"
                                placeholder="Conditions du devis..."
                                value={conditions}
                                onChange={(e) => setConditions(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="notes">Notes</Label>
                            <Textarea
                                id="notes"
                                placeholder="Notes additionnelles..."
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                            />
                        </div>
                    </CardContent>
                </Card>
            </div>

            <CustomerSelectSheet
                open={isCustomerSheetOpen}
                onOpenChange={setIsCustomerSheetOpen}
                onSelect={setSelectedCustomer}
            />

            <ProductSelectDialog
                open={isProductDialogOpen}
                onOpenChange={setIsProductDialogOpen}
                onSelect={handleAddProduct}
                onCreateCustom={handleAddCustomProduct}
            />
        </div>
    )
} 