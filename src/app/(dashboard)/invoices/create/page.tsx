"use client"

import React, { useState } from 'react'
import { useCustomers } from '@/hooks/useCustomer'
import { useProducts } from '@/hooks/useProduct'
import { useCreateInvoice } from '@/hooks/useInvoice'
import { useDebounce } from '@/hooks/useDebounce'
import { useRouter } from 'next/navigation'
import { useForm, ControllerRenderProps } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useFormat } from '@/hooks/useFormat'

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { DatePicker } from "@/components/ui/date-picker"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Building, User, Search, Plus, X } from 'lucide-react'

import type { ICustomer } from '@/types/Customer.interface'
import type { IProduct } from '@/types/Product.interface'
import type { IInvoiceItem } from '@/types/Invoice.request.interface'

const TVA_RATES = [
  { value: "20", label: "20 %" },
  { value: "10", label: "10 %" },
  { value: "5.5", label: "5.5 %" },
  { value: "2.1", label: "2.1 %" },
  { value: "0", label: "0 %" },
] as const

const newProductSchema = z.object({
  name: z.string().min(1, "Le nom est requis"),
  description: z.string().optional(),
  price_excluding_tax: z.string().min(1, "Le prix est requis").regex(/^\d*\.?\d*$/, "Le prix doit être un nombre valide"),
  vat_rate: z.string().min(1, "La TVA est requise"),
  save_as_product: z.boolean().default(false)
})

type NewProductSchema = z.infer<typeof newProductSchema>

export default function CreateInvoicePage() {
    const router = useRouter()
    const { formatCurrency, formatPercent, formatQuantity } = useFormat()
    const [isCustomerSheetOpen, setIsCustomerSheetOpen] = useState(false)
    const [isProductDialogOpen, setIsProductDialogOpen] = useState(false)
    const [customerSearch, setCustomerSearch] = useState('')
    const [productSearch, setProductSearch] = useState('')
    const [customerType, setCustomerType] = useState<'all' | 'individual' | 'company'>('all')
    const [selectedCustomer, setSelectedCustomer] = useState<ICustomer | null>(null)
    const [items, setItems] = useState<IInvoiceItem[]>([])
    const [conditions, setConditions] = useState('')
    const [latePenalty, setLatePenalty] = useState('')
    const [invoiceDate, setInvoiceDate] = useState<Date>(new Date())
    const [dueDate, setDueDate] = useState<Date>(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000))

    const debouncedCustomerSearch = useDebounce(customerSearch, 300)
    const debouncedProductSearch = useDebounce(productSearch, 300)

    const form = useForm<NewProductSchema>({
        resolver: zodResolver(newProductSchema),
        defaultValues: {
            name: "",
            description: "",
            price_excluding_tax: "",
            vat_rate: "",
            save_as_product: false
        }
    })

    const { data: customersData, isLoading: isCustomersLoading } = useCustomers({
        search: debouncedCustomerSearch,
        type: customerType === 'all' ? undefined : customerType,
        limit: 50
    })

    const { data: productsData, isLoading: isProductsLoading } = useProducts({
        search: debouncedProductSearch,
        limit: 50
    })

    const createInvoice = useCreateInvoice()

    const handleAddProduct = (product: IProduct) => {
        setItems(prev => [...prev, {
            product_id: product.product_id,
            name: product.name,
            description: product.description || undefined,
            quantity: 1,
            unit_price_excluding_tax: product.price_excluding_tax,
            vat_rate: product.vat_rate
        }])
    }

    const handleAddCustomProduct = (data: NewProductSchema) => {
        setItems(prev => [...prev, {
            name: data.name,
            description: data.description || undefined,
            quantity: 1,
            unit_price_excluding_tax: Number(data.price_excluding_tax),
            vat_rate: Number(data.vat_rate),
            save_as_product: data.save_as_product
        }])

        form.reset()
        setIsProductDialogOpen(false)
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

    const handleCreateInvoice = () => {
        if (!selectedCustomer || items.length === 0) return

        createInvoice.mutate({
            customer_id: selectedCustomer.customer_id!,
            invoice_date: invoiceDate,
            due_date: dueDate,
            items,
            conditions: conditions || undefined,
            late_payment_penalty: latePenalty || undefined
        }, {
            onSuccess: () => {
                router.push('/invoices')
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
                <h1 className="text-2xl font-bold">Nouvelle Facture</h1>
                <Button onClick={handleCreateInvoice} disabled={!selectedCustomer || items.length === 0}>
                    Créer la facture
                </Button>
            </div>

            <div className="grid gap-6">
                {/* Client Selection */}
                <Card>
                    <CardHeader>
                        <CardTitle>Client</CardTitle>
                        <CardDescription>Sélectionnez le client pour cette facture</CardDescription>
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
                        <CardDescription>Sélectionnez la date de facturation et d&apos;échéance</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Date de facturation</Label>
                                <DatePicker
                                    date={invoiceDate}
                                    setDate={(date) => date && setInvoiceDate(date)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Date d&apos;échéance</Label>
                                <DatePicker
                                    date={dueDate}
                                    setDate={(date) => date && setDueDate(date)}
                                />
                            </div>
                        </div>
                    </CardContent>

                </Card>

                {/* Products List */}
                <Card>
                    <CardHeader>
                        <CardTitle>Produits</CardTitle>
                        <CardDescription>Ajoutez les produits à facturer</CardDescription>
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
                        <CardDescription>Ajoutez des conditions et pénalités de retard</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="conditions">Conditions</Label>
                            <Textarea
                                id="conditions"
                                placeholder="Conditions de paiement..."
                                value={conditions}
                                onChange={(e) => setConditions(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="penalty">Pénalités de retard</Label>
                            <Textarea
                                id="penalty"
                                placeholder="Pénalités en cas de retard de paiement..."
                                value={latePenalty}
                                onChange={(e) => setLatePenalty(e.target.value)}
                            />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Customer Selection Sheet */}
            <Sheet open={isCustomerSheetOpen} onOpenChange={setIsCustomerSheetOpen}>
                <SheetContent side="right" className="w-full sm:w-[540px] overflow-y-auto">
                    <SheetHeader>
                        <SheetTitle>Sélectionner un client</SheetTitle>
                        <SheetDescription>
                            Recherchez et sélectionnez un client pour la facture
                        </SheetDescription>
                    </SheetHeader>

                    <div className="mt-6 space-y-4">
                        <div className="space-y-4">
                            <div className="flex flex-col gap-4">
                                <div className="relative flex-1">
                                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Rechercher un client..."
                                        value={customerSearch}
                                        onChange={(e) => setCustomerSearch(e.target.value)}
                                        className="pl-8"
                                    />
                                </div>
                                <Tabs 
                                    value={customerType} 
                                    onValueChange={(value) => setCustomerType(value as 'all' | 'individual' | 'company')}
                                >
                                    <TabsList>
                                        <TabsTrigger value="all">Tous</TabsTrigger>
                                        <TabsTrigger value="individual">Particuliers</TabsTrigger>
                                        <TabsTrigger value="company">Entreprises</TabsTrigger>
                                    </TabsList>
                                </Tabs>
                            </div>
                        </div>

                        {/* <div className="space-y-2"> */}
                            
                                <div className="space-y-2">
                                    { isCustomersLoading ? (
                                        <p className="text-sm text-center text-muted-foreground">Chargement des clients...</p>
                                    ) : (
                                    customersData?.data.customers.length === 0 ? (
                                        <p className="text-sm text-center text-muted-foreground">Aucun client trouvé</p>
                                    ) : (
                                        customersData?.data.customers.map((customer: ICustomer) => (
                                            <div
                                                key={customer.customer_id}
                                                className="flex items-center justify-between p-4 rounded-lg border cursor-pointer hover:bg-muted"
                                                onClick={() => {
                                                    setSelectedCustomer(customer)
                                                    setIsCustomerSheetOpen(false)
                                                }}
                                            >
                                                <div className="flex items-center gap-4">
                                                    <Badge variant="outline">
                                                        {customer.type === 'company' ? (
                                                            <Building className="w-4 h-4" />
                                                        ) : (
                                                            <User className="w-4 h-4" />
                                                        )}
                                                    </Badge>
                                                    <div>
                                                        <p className="font-medium">
                                                            {customer.type === 'company'
                                                                ? customer.BusinessCustomer?.name
                                                                : `${customer.IndividualCustomer?.first_name} ${customer.IndividualCustomer?.last_name}`}
                                                        </p>
                                                        <p className="text-sm text-muted-foreground">{customer.email}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    ))}
                                </div>
                            
                        {/* </div> */}
                    </div>
                </SheetContent>
            </Sheet>

            {/* Product Dialog */}
            <Dialog open={isProductDialogOpen} onOpenChange={setIsProductDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Ajouter un produit</DialogTitle>
                        <DialogDescription>
                            Sélectionnez un produit existant ou créez-en un nouveau
                        </DialogDescription>
                    </DialogHeader>

                    <Tabs defaultValue="existing">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="existing">Produits existants</TabsTrigger>
                            <TabsTrigger value="new">Nouveau produit</TabsTrigger>
                        </TabsList>
                        <TabsContent value="existing">
                            <div className="mt-4">
                                <div data-value="existing" className="space-y-4">
                                    <div className="relative">
                                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            placeholder="Rechercher un produit..."
                                            value={productSearch}
                                            onChange={(e) => setProductSearch(e.target.value)}
                                            className="pl-8"
                                        />
                                    </div>
                                    <ScrollArea className="h-[300px] pr-4">
                                        <div className="space-y-4">
                                            {isProductsLoading ? (
                                                <p className="text-sm text-center text-muted-foreground">Chargement des produits...</p>
                                            ) : productsData?.data.products.length === 0 ? (
                                                <p className="text-sm text-center text-muted-foreground">Aucun produit trouvé</p>
                                            ) : (
                                                productsData?.data.products.map((product: IProduct) => (
                                                    <div
                                                        key={product.product_id}
                                                        className="flex items-center justify-between p-4 rounded-lg border cursor-pointer hover:bg-muted"
                                                        onClick={() => {
                                                            handleAddProduct(product)
                                                            setIsProductDialogOpen(false)
                                                        }}
                                                    >
                                                        <div>
                                                            <p className="font-medium">{product.name}</p>
                                                            {product.description && (
                                                                <p className="text-sm text-muted-foreground line-clamp-2">{product.description}</p>
                                                            )}
                                                        </div>
                                                        <div className="text-right min-w-fit">
                                                            <p className="font-medium">{formatCurrency(product.price_excluding_tax)}</p>
                                                            <p className="text-sm text-muted-foreground">TVA {formatPercent(product.vat_rate)}</p>
                                                        </div>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </ScrollArea>
                                </div>
                            </div>
                        </TabsContent>
                        <TabsContent value="new">
                            <Form {...form}>
                                <form onSubmit={form.handleSubmit(handleAddCustomProduct)} className="space-y-4">
                                    <FormField
                                        control={form.control}
                                        name="name"
                                        render={({ field }: { field: ControllerRenderProps<NewProductSchema, "name"> }) => (
                                            <FormItem>
                                                <FormLabel>Nom du produit</FormLabel>
                                                <FormControl>
                                                    <Input {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="description"
                                        render={({ field }: { field: ControllerRenderProps<NewProductSchema, "description"> }) => (
                                            <FormItem>
                                                <FormLabel>Description</FormLabel>
                                                <FormControl>
                                                    <Textarea {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <div className="grid grid-cols-2 gap-4">
                                        <FormField
                                            control={form.control}
                                            name="price_excluding_tax"
                                            render={({ field }: { field: ControllerRenderProps<NewProductSchema, "price_excluding_tax"> }) => (
                                                <FormItem>
                                                    <FormLabel>Prix HT</FormLabel>
                                                    <FormControl>
                                                        <Input type="number" step="0.01" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="vat_rate"
                                            render={({ field }: { field: ControllerRenderProps<NewProductSchema, "vat_rate"> }) => (
                                                <FormItem>
                                                    <FormLabel>TVA</FormLabel>
                                                    <Select 
                                                        onValueChange={field.onChange} 
                                                        defaultValue={field.value}
                                                    >
                                                        <FormControl>
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Sélectionner un taux de TVA" />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            {TVA_RATES.map((rate) => (
                                                                <SelectItem key={rate.value} value={rate.value}>
                                                                    {rate.label}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                    <FormField
                                        control={form.control}
                                        name="save_as_product"
                                        render={({ field }: { field: ControllerRenderProps<NewProductSchema, "save_as_product"> }) => (
                                            <FormItem className="flex items-center space-x-2">
                                                <FormControl>
                                                    <Switch
                                                        checked={field.value}
                                                        onCheckedChange={field.onChange}
                                                    />
                                                </FormControl>
                                                <FormLabel className="!mt-0">Sauvegarder comme produit</FormLabel>
                                            </FormItem>
                                        )}
                                    />
                                    <DialogFooter>
                                        <Button type="button" variant="outline" onClick={() => {
                                            form.reset()
                                            setIsProductDialogOpen(false)
                                        }}>
                                            Annuler
                                        </Button>
                                        <Button type="submit">
                                            Ajouter
                                        </Button>
                                    </DialogFooter>
                                </form>
                            </Form>
                        </TabsContent>
                    </Tabs>
                </DialogContent>
            </Dialog>
        </div>
    )
} 