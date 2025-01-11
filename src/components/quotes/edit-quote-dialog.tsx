import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { DatePicker } from "@/components/ui/date-picker"
import { AlertCircle, Loader2, Pencil } from 'lucide-react'
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

const editQuoteSchema = z.object({
    quote_date: z.date(),
    validity_date: z.date(),
    conditions: z.string().optional().nullable(),
    notes: z.string().optional().nullable()
})

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

export function EditQuoteDialog({
    open,
    onOpenChange,
    onSubmit,
    defaultValues,
    isLoading,
    isError,
    error
}: EditQuoteDialogProps) {
    console.log(defaultValues)

    const form = useForm<EditQuoteSchema>({
        resolver: zodResolver(editQuoteSchema),
        defaultValues: {
            quote_date: new Date(defaultValues.quote_date),
            validity_date: new Date(defaultValues.validity_date),
            conditions: defaultValues.conditions,
            notes: defaultValues.notes,
        }
    })

    const handleSubmit = async (data: EditQuoteSchema) => {
        await onSubmit(data)
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Modifier le devis</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                    {isError && <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Erreur</AlertTitle>
                        <AlertDescription>
                            {error?.errors?.map((err, index) => (
                                <p key={index}>{err.message}</p>
                            )) || error?.message || "Une erreur est survenue lors de la modification du devis."}
                        </AlertDescription>
                    </Alert>}
                    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="quote_date"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Date du devis</FormLabel>
                                        <FormControl>
                                            <DatePicker
                                                date={new Date(field.value)}
                                                setDate={(date) => {
                                                    field.onChange(date)
                                                }}
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
                                        <FormLabel>Date de validité</FormLabel>
                                        <FormControl>
                                            <DatePicker
                                                date={new Date(field.value)}
                                                setDate={(date) => {
                                                    field.onChange(date)
                                                }}
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
                                    <FormLabel>Conditions</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            {...field}
                                            value={field.value || ''}
                                            onChange={(e) => {
                                                field.onChange(e)
                                            }}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="notes"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Notes</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            {...field}
                                            value={field.value || ''}
                                            onChange={(e) => {
                                                field.onChange(e)
                                            }}
                                        />
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