import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DatePicker } from "@/components/ui/date-picker"
import { AlertCircle, Loader2, Plus } from 'lucide-react'
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import type { PaymentMethod } from "@/types/Invoice.request.interface"

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

const PAYMENT_METHODS: { value: PaymentMethod; label: string }[] = [
    { value: "credit_card", label: "Carte bancaire" },
    { value: "bank_transfer", label: "Virement" },
    { value: "cash", label: "Espèces" }
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
    const form = useForm<AddPaymentSchema>({
        resolver: zodResolver(addPaymentSchema),
        defaultValues: {
            amount: invoiceAmount.toString(),
            payment_date: new Date(),
            payment_method: "credit_card",
            description: "",
            reference: ""
        }
    })

    const handleSubmit = async (data: AddPaymentSchema) => {
        await onSubmit({
            ...data,
            amount: data.amount // Le montant est déjà validé comme un nombre par Zod
        })
        form.reset()
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Ajouter un paiement</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                    {isError && <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Erreur</AlertTitle>
                        <AlertDescription>
                            {error?.errors?.map((err, index) => (
                                <p key={index}>{err.message}</p>
                            )) || error?.message || "Une erreur est survenue lors de l'ajout du paiement."}
                        </AlertDescription>
                    </Alert>}
                    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="amount"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Montant</FormLabel>
                                    <FormControl>
                                        <Input
                                            {...field}
                                            type="number"
                                            step="0.01"
                                            min="0"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="payment_date"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Date du paiement</FormLabel>
                                    <FormControl>
                                        <DatePicker
                                            date={field.value}
                                            setDate={(date) => field.onChange(date)}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="payment_method"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Moyen de paiement</FormLabel>
                                    <Select 
                                        onValueChange={field.onChange} 
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
                                                    {method.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Description</FormLabel>
                                    <FormControl>
                                        <Input {...field} placeholder="Description du paiement..." />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="reference"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Référence</FormLabel>
                                    <FormControl>
                                        <Input {...field} placeholder="Numéro de transaction, chèque..." />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <div className="flex justify-end gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => onOpenChange(false)}
                            >
                                Annuler
                            </Button>
                            <Button 
                                type="submit"
                                disabled={isLoading}
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