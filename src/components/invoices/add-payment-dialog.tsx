import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DatePicker } from "@/components/ui/date-picker"
import { AlertCircle, Loader2, Plus, Calendar, CreditCard, FileText, Hash, DollarSign } from 'lucide-react'
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { format } from "date-fns"
import * as z from "zod"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
    FormDescription
} from "@/components/ui/form"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { useState, useEffect } from "react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import type { PaymentMethod } from "@/types/Invoice.request.interface"
import * as React from "react"

const addPaymentSchema = z.object({
    payment_date: z.date(),
    amount: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
        message: "Le montant doit être un nombre positif"
    }),
    payment_method: z.enum(['cash', 'credit_card', 'bank_transfer'] as const),
    description: z.string().optional(),
    reference: z.string().optional()
})

export type AddPaymentSchema = z.infer<typeof addPaymentSchema>

interface AddPaymentDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onSubmit: (data: AddPaymentSchema) => Promise<void>
    invoiceAmount: number
    isLoading: boolean
    isError: boolean
    error?: {
        message?: string
        errors?: Array<{
            field?: string
            message: string
        }>
    }
}

const PAYMENT_METHODS: { value: PaymentMethod; label: string; icon: React.ReactNode }[] = [
    { value: "credit_card", label: "Carte bancaire", icon: <CreditCard className="h-4 w-4 mr-2" /> },
    { value: "bank_transfer", label: "Virement", icon: <DollarSign className="h-4 w-4 mr-2" /> },
    { value: "cash", label: "Espèces", icon: <DollarSign className="h-4 w-4 mr-2" /> }
]

export function AddPaymentDialog({
    open,
    onOpenChange,
    onSubmit,
    invoiceAmount,
    isLoading,
    isError,
    error
}: AddPaymentDialogProps) {
    const [hasChanged, setHasChanged] = useState(false);

    const form = useForm<AddPaymentSchema>({
        resolver: zodResolver(addPaymentSchema),
        defaultValues: {
            amount: invoiceAmount.toString(),
            payment_date: new Date(),
            payment_method: "credit_card",
            description: "",
            reference: ""
        }
    });

    // Reset form when dialog opens/closes or defaultValues change
    useEffect(() => {
        if (open) {
            form.reset({
                amount: invoiceAmount.toString(),
                payment_date: new Date(),
                payment_method: "credit_card",
                description: "",
                reference: ""
            });
            setHasChanged(false);
        }
    }, [open, invoiceAmount, form]);

    // Track form changes
    useEffect(() => {
        const subscription = form.watch(() => {
            setHasChanged(true);
        });
        return () => subscription.unsubscribe();
    }, [form]);

    const handleSubmit = async (data: AddPaymentSchema) => {
        try {
            await onSubmit({
                ...data,
                payment_date: new Date(format(data.payment_date, 'yyyy-MM-dd')),
                amount: data.amount // Le montant est déjà validé comme un nombre par Zod
            });
            form.reset();
        } catch (error) {
            console.error("Erreur lors de l'ajout du paiement:", error);
        }
    };

    const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        form.setValue("amount", e.target.value);
        setHasChanged(true);
    };

    const setFullAmount = () => {
        form.setValue("amount", invoiceAmount.toString());
        setHasChanged(true);
    };

    console.log(error)

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-xl">
                <DialogHeader>
                    <DialogTitle>Ajouter un paiement</DialogTitle>
                    <DialogDescription>
                        Enregistrez un nouveau paiement pour cette facture
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    {isError && <Alert variant="destructive" className="mb-4">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Erreur</AlertTitle>
                        <AlertDescription>
                            {error?.errors?.map((err, index) => (
                                <p key={index}>{err.message}</p>
                            )) || error?.message || "Une erreur est survenue lors de l'ajout du paiement."}
                        </AlertDescription>
                    </Alert>}
                    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="amount"
                                render={({ field }) => (
                                    <FormItem>
                                        <div className="flex items-center justify-between">
                                            <FormLabel className="flex items-center gap-2">
                                                <DollarSign className="h-4 w-4" />
                                                Montant
                                            </FormLabel>
                                            <TooltipProvider>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Button 
                                                            variant="ghost" 
                                                            size="sm"
                                                            type="button"
                                                            onClick={setFullAmount}
                                                            className="h-6 px-2 text-xs"
                                                            tabIndex={-1}
                                                        >
                                                            Montant total
                                                        </Button>
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                        <p>Utiliser le montant total de la facture</p>
                                                    </TooltipContent>
                                                </Tooltip>
                                            </TooltipProvider>
                                        </div>
                                        <FormControl>
                                            <Input
                                                {...field}
                                                type="number"
                                                step="0.01"
                                                min="0"
                                                onChange={handleAmountChange}
                                            />
                                        </FormControl>
                                        <FormDescription>
                                            Montant du paiement reçu
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="payment_date"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="flex items-center gap-2">
                                            <Calendar className="h-4 w-4" />
                                            Date du paiement
                                        </FormLabel>
                                        <FormControl>
                                            <DatePicker
                                                date={field.value}
                                                setDate={(date) => {
                                                    if (date) {
                                                        field.onChange(date);
                                                        setHasChanged(true);
                                                    }
                                                }}
                                            />
                                        </FormControl>
                                        <FormDescription>
                                            Date à laquelle le paiement a été reçu
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <FormField
                            control={form.control}
                            name="payment_method"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="flex items-center gap-2">
                                        <CreditCard className="h-4 w-4" />
                                        Moyen de paiement
                                    </FormLabel>
                                    <Select 
                                        onValueChange={(value) => {
                                            field.onChange(value);
                                            setHasChanged(true);
                                        }} 
                                        defaultValue={field.value}
                                    >
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Sélectionner un moyen de paiement" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {PAYMENT_METHODS.map(method => (
                                                <SelectItem 
                                                    key={method.value} 
                                                    value={method.value}
                                                >
                                                    <div className="flex items-center">
                                                        {method.icon}
                                                        {method.label}
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormDescription>
                                        Mode de paiement utilisé par le client
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="description"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="flex items-center gap-2">
                                            <FileText className="h-4 w-4" />
                                            Description
                                        </FormLabel>
                                        <FormControl>
                                            <Input 
                                                {...field} 
                                                placeholder="Description du paiement..." 
                                                onChange={(e) => {
                                                    field.onChange(e);
                                                    setHasChanged(true);
                                                }}
                                            />
                                        </FormControl>
                                        <FormDescription>
                                            Informations complémentaires (optionnel)
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="reference"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="flex items-center gap-2">
                                            <Hash className="h-4 w-4" />
                                            Référence
                                        </FormLabel>
                                        <FormControl>
                                            <Input 
                                                {...field} 
                                                placeholder="Numéro de transaction, chèque..." 
                                                onChange={(e) => {
                                                    field.onChange(e);
                                                    setHasChanged(true);
                                                }}
                                            />
                                        </FormControl>
                                        <FormDescription>
                                            Numéro de référence du paiement (optionnel)
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <div className="flex justify-end gap-2 pt-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => onOpenChange(false)}
                                disabled={isLoading}
                            >
                                Annuler
                            </Button>
                            <Button 
                                type="submit"
                                disabled={isLoading || !hasChanged}
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Ajout en cours...
                                    </>
                                ) : (
                                    <>
                                        <Plus className="w-4 h-4 mr-2" />
                                        Ajouter
                                    </>
                                )}
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
} 