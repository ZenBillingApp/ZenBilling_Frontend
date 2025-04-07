import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { DatePicker } from "@/components/ui/date-picker"
import { AlertCircle, Loader2, Pencil, Calendar, ClockIcon, Info } from 'lucide-react'
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { isAfter, format, addDays } from 'date-fns'
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
import { useState, useEffect } from "react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

const editInvoiceSchema = z.object({
    invoice_date: z.date({
        required_error: "La date de facturation est requise",
    }),
    due_date: z.date({
        required_error: "La date d'échéance est requise",
    }),
    conditions: z.string().optional().nullable(),
    late_payment_penalty: z.string().optional().nullable()
}).refine((data) => {
    return isAfter(data.due_date, data.invoice_date);
}, {
    message: "La date d'échéance doit être postérieure à la date de facturation",
    path: ["due_date"]
});

export type EditInvoiceSchema = z.infer<typeof editInvoiceSchema>

interface EditInvoiceDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onSubmit: (data: Partial<EditInvoiceSchema>) => Promise<void>
    defaultValues: {
        invoice_date: Date
        due_date: Date
        conditions?: string
        late_payment_penalty?: string
    }
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

const DEFAULT_PAYMENT_CONDITIONS = "Paiement à réception de facture. Aucun escompte accordé pour paiement anticipé.";
const DEFAULT_LATE_PENALTY = "En cas de retard de paiement, une pénalité égale à trois fois le taux d'intérêt légal sera appliquée, ainsi qu'une indemnité forfaitaire de 40€ pour frais de recouvrement.";

export function EditInvoiceDialog({
    open,
    onOpenChange,
    onSubmit,
    defaultValues,
    isLoading,
    isError,
    error
}: EditInvoiceDialogProps) {
    const [hasChanged, setHasChanged] = useState(false);

    const form = useForm<EditInvoiceSchema>({
        resolver: zodResolver(editInvoiceSchema),
        defaultValues: {
            invoice_date: new Date(defaultValues.invoice_date),
            due_date: new Date(defaultValues.due_date),
            conditions: defaultValues.conditions || '',
            late_payment_penalty: defaultValues.late_payment_penalty || '',
        },
        mode: "onChange"
    });

    // Reset form when dialog opens/closes or defaultValues change
    useEffect(() => {
        if (!open) {
            form.reset({
                invoice_date: new Date(defaultValues.invoice_date),
                due_date: new Date(defaultValues.due_date),
                conditions: defaultValues.conditions || '',
                late_payment_penalty: defaultValues.late_payment_penalty || '',
            });
            setHasChanged(false);
        }
    }, [open, defaultValues, form]);

    // Track form changes
    useEffect(() => {
        const subscription = form.watch(() => {
            setHasChanged(true);
        });
        return () => subscription.unsubscribe();
    }, [form]);

    const handleSubmit = async (data: EditInvoiceSchema) => {
        try {
            await onSubmit({
                ...data,
                // Formater les dates au format ISO YYYY-MM-DD
                invoice_date: new Date(format(data.invoice_date, 'yyyy-MM-dd')),
                due_date: new Date(format(data.due_date, 'yyyy-MM-dd'))
            });
        } catch (error) {
            console.error("Erreur lors de la soumission du formulaire:", error);
        }
    };

    const setDueDateToPlus30Days = () => {
        const invoiceDate = form.getValues("invoice_date");
        if (invoiceDate) {
            const newDueDate = addDays(invoiceDate, 30);
            form.setValue("due_date", newDueDate);
            setHasChanged(true);
        }
    };

    const applyDefaultConditions = () => {
        form.setValue("conditions", DEFAULT_PAYMENT_CONDITIONS);
        setHasChanged(true);
    };

    const applyDefaultPenalties = () => {
        form.setValue("late_payment_penalty", DEFAULT_LATE_PENALTY);
        setHasChanged(true);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-xl">
                <DialogHeader>
                    <DialogTitle>Modifier la facture</DialogTitle>
                    <DialogDescription>
                        Modifiez les dates et conditions de votre facture
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    {isError && <Alert variant="destructive" className="mb-4">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Erreur</AlertTitle>
                        <AlertDescription>
                            {error?.errors?.map((err, index) => (
                                <p key={index}>{err.message}</p>
                            )) || error?.message || "Une erreur est survenue lors de la modification de la facture."}
                        </AlertDescription>
                    </Alert>}
                    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="invoice_date"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="flex items-center gap-2">
                                            <Calendar className="h-4 w-4" />
                                            Date de facturation
                                        </FormLabel>
                                        <FormControl>
                                            <DatePicker
                                                date={field.value}
                                                setDate={(date) => {
                                                    if (date) {
                                                        field.onChange(date);
                                                    }
                                                }}
                                                placeholder="Date de facturation"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="due_date"
                                render={({ field }) => (
                                    <FormItem>
                                        <div className="flex items-center justify-between">
                                            <FormLabel className="flex items-center gap-2">
                                                <ClockIcon className="h-4 w-4" />
                                                Date d&apos;échéance
                                            </FormLabel>
                                            <TooltipProvider>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Button 
                                                            variant="ghost" 
                                                            size="sm"
                                                            type="button"
                                                            onClick={setDueDateToPlus30Days}
                                                            className="h-6 px-2 text-xs"
                                                        >
                                                            +30 jours
                                                        </Button>
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                        <p>Définir l&apos;échéance à 30 jours après la date de facturation</p>
                                                    </TooltipContent>
                                                </Tooltip>
                                            </TooltipProvider>
                                        </div>
                                        <FormControl>
                                            <DatePicker
                                                date={field.value}
                                                setDate={(date) => {
                                                    if (date) {
                                                        field.onChange(date);
                                                    }
                                                }}
                                                placeholder="Date d'échéance"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <FormField
                            control={form.control}
                            name="conditions"
                            render={({ field }) => (
                                <FormItem>
                                    <div className="flex items-center justify-between">
                                        <FormLabel className="flex items-center gap-2">
                                            <Info className="h-4 w-4" />
                                            Conditions
                                        </FormLabel>
                                        <Button 
                                            variant="ghost" 
                                            size="sm"
                                            type="button"
                                            onClick={applyDefaultConditions}
                                            className="h-6 px-2 text-xs"
                                        >
                                            Appliquer modèle
                                        </Button>
                                    </div>
                                    <FormControl>
                                        <Textarea
                                            {...field}
                                            value={field.value || ''}
                                            onChange={(e) => {
                                                field.onChange(e);
                                            }}
                                            placeholder="Conditions de paiement"
                                            className="min-h-[80px]"
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        Précisez les conditions de paiement pour votre client
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="late_payment_penalty"
                            render={({ field }) => (
                                <FormItem>
                                    <div className="flex items-center justify-between">
                                        <FormLabel className="flex items-center gap-2">
                                            <AlertCircle className="h-4 w-4" />
                                            Pénalités de retard
                                        </FormLabel>
                                        <Button 
                                            variant="ghost" 
                                            size="sm"
                                            type="button"
                                            onClick={applyDefaultPenalties}
                                            className="h-6 px-2 text-xs"
                                        >
                                            Appliquer modèle
                                        </Button>
                                    </div>
                                    <FormControl>
                                        <Textarea
                                            {...field}
                                            value={field.value || ''}
                                            onChange={(e) => {
                                                field.onChange(e);
                                            }}
                                            placeholder="Pénalités en cas de retard de paiement"
                                            className="min-h-[80px]"
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        Informations légales sur les pénalités en cas de retard
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
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
                                        Modification...
                                    </>
                                ) : (
                                    <>
                                        <Pencil className="w-4 h-4 mr-2" />
                                        Modifier
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