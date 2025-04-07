import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { DatePicker } from "@/components/ui/date-picker"
import { AlertCircle, Loader2, Pencil, Calendar, ClockIcon, Info, FileText } from 'lucide-react'
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { format, isAfter, addDays } from 'date-fns'
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

const editQuoteSchema = z.object({
    quote_date: z.date({
        required_error: "La date du devis est requise",
    }),
    validity_date: z.date({
        required_error: "La date de validité est requise",
    }),
    conditions: z.string().optional().nullable(),
    notes: z.string().optional().nullable()
}).refine((data) => {
    return isAfter(data.validity_date, data.quote_date);
}, {
    message: "La date de validité doit être postérieure à la date du devis",
    path: ["validity_date"]
});

export type EditQuoteSchema = z.infer<typeof editQuoteSchema>

interface EditQuoteDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onSubmit: (data: Partial<EditQuoteSchema>) => Promise<void>
    defaultValues: {
        quote_date: Date
        validity_date: Date
        conditions?: string
        notes?: string
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

const DEFAULT_QUOTE_CONDITIONS = "Ce devis est valable pendant 30 jours à compter de sa date d'émission. Les prix indiqués sont fermes et définitifs, toutes taxes comprises.";
const DEFAULT_QUOTE_NOTES = "Tous les délais mentionnés dans ce devis sont donnés à titre indicatif. Les conditions de paiement seront précisées lors de la commande.";

export function EditQuoteDialog({
    open,
    onOpenChange,
    onSubmit,
    defaultValues,
    isLoading,
    isError,
    error
}: EditQuoteDialogProps) {
    const [hasChanged, setHasChanged] = useState(false);

    const form = useForm<EditQuoteSchema>({
        resolver: zodResolver(editQuoteSchema),
        defaultValues: {
            quote_date: new Date(defaultValues.quote_date),
            validity_date: new Date(defaultValues.validity_date),
            conditions: defaultValues.conditions || '',
            notes: defaultValues.notes || '',
        },
        mode: "onChange"
    });

    // Reset form when dialog opens/closes or defaultValues change
    useEffect(() => {
        if (!open) {
            form.reset({
                quote_date: new Date(defaultValues.quote_date),
                validity_date: new Date(defaultValues.validity_date),
                conditions: defaultValues.conditions || '',
                notes: defaultValues.notes || '',
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

    const handleSubmit = async (data: EditQuoteSchema) => {
        try {
            await onSubmit({
                ...data,
                quote_date: new Date(format(data.quote_date, 'yyyy-MM-dd')),
                validity_date: new Date(format(data.validity_date, 'yyyy-MM-dd'))
            });
        } catch (error) {
            console.error("Erreur lors de la soumission du formulaire:", error);
        }
    };

    const setValidityDateToPlus30Days = () => {
        const quoteDate = form.getValues("quote_date");
        if (quoteDate) {
            const newValidityDate = addDays(quoteDate, 30);
            form.setValue("validity_date", newValidityDate);
            setHasChanged(true);
        }
    };

    const applyDefaultConditions = () => {
        form.setValue("conditions", DEFAULT_QUOTE_CONDITIONS);
        setHasChanged(true);
    };

    const applyDefaultNotes = () => {
        form.setValue("notes", DEFAULT_QUOTE_NOTES);
        setHasChanged(true);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-xl">
                <DialogHeader>
                    <DialogTitle>Modifier le devis</DialogTitle>
                    <DialogDescription>
                        Modifiez les dates et conditions de votre devis
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    {isError && <Alert variant="destructive" className="mb-4">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Erreur</AlertTitle>
                        <AlertDescription>
                            {error?.errors?.map((err, index) => (
                                <p key={index}>{err.message}</p>
                            )) || error?.message || "Une erreur est survenue lors de la modification du devis."}
                        </AlertDescription>
                    </Alert>}
                    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="quote_date"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="flex items-center gap-2">
                                            <Calendar className="h-4 w-4" />
                                            Date du devis
                                        </FormLabel>
                                        <FormControl>
                                            <DatePicker
                                                date={field.value}
                                                setDate={(date) => {
                                                    if (date) {
                                                        field.onChange(date);
                                                    }
                                                }}
                                                placeholder="Date du devis"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="validity_date"
                                render={({ field }) => (
                                    <FormItem>
                                        <div className="flex items-center justify-between">
                                            <FormLabel className="flex items-center gap-2">
                                                <ClockIcon className="h-4 w-4" />
                                                Date de validité
                                            </FormLabel>
                                            <TooltipProvider>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Button 
                                                            variant="ghost" 
                                                            size="sm"
                                                            type="button"
                                                            onClick={setValidityDateToPlus30Days}
                                                            className="h-6 px-2 text-xs"
                                                        >
                                                            +30 jours
                                                        </Button>
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                        <p>Définir la validité à 30 jours après la date du devis</p>
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
                                                placeholder="Date de validité"
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
                                            placeholder="Conditions du devis"
                                            className="min-h-[80px]"
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        Précisez les conditions de validité pour votre client
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="notes"
                            render={({ field }) => (
                                <FormItem>
                                    <div className="flex items-center justify-between">
                                        <FormLabel className="flex items-center gap-2">
                                            <FileText className="h-4 w-4" />
                                            Notes
                                        </FormLabel>
                                        <Button 
                                            variant="ghost" 
                                            size="sm"
                                            type="button"
                                            onClick={applyDefaultNotes}
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
                                            placeholder="Notes additionnelles"
                                            className="min-h-[80px]"
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        Ajoutez des informations complémentaires à votre devis
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