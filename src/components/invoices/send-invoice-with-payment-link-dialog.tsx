"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormDescription,
} from "@/components/ui/form";
import { Mail, Loader2, CreditCard, Info } from "lucide-react";
import { useSendInvoiceWithPaymentLink } from "@/hooks/useInvoice";
import type { ISendInvoiceWithPaymentLinkRequest } from "@/types/Invoice.request.interface";

const sendInvoiceSchema = z.object({
  includePaymentLink: z.boolean().default(false),
});

type SendInvoiceFormData = z.infer<typeof sendInvoiceSchema>;

interface SendInvoiceWithPaymentLinkDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoiceId: string;
  invoiceNumber: string;
  customerName: string;
  customerType: "individual" | "company";
  invoiceAmount: number;
}

export function SendInvoiceWithPaymentLinkDialog({
  open,
  onOpenChange,
  invoiceId,
  invoiceNumber,
  customerName,
  customerType,
  invoiceAmount,
}: SendInvoiceWithPaymentLinkDialogProps) {
  const sendInvoice = useSendInvoiceWithPaymentLink(invoiceId);

  const form = useForm<SendInvoiceFormData>({
    resolver: zodResolver(sendInvoiceSchema),
    defaultValues: {
      includePaymentLink: false,
    },
  });

  // Générer automatiquement les URLs
  const generatePaymentUrls = () => {
    const baseUrl = process.env.NEXT_PUBLIC_CLIENT_URL || 
                   (typeof window !== 'undefined' ? window.location.origin : '');
    
    // Encoder les paramètres pour l'URL
    const params = new URLSearchParams({
      invoice_number: invoiceNumber,
      invoice_id: invoiceId,
      amount: invoiceAmount.toString(),
      customer_name: encodeURIComponent(customerName),
      customer_type: customerType,
    });

    return {
      successUrl: `${baseUrl}/payment/success?${params.toString()}`,
      cancelUrl: `${baseUrl}/payment/cancel?${params.toString()}`,
    };
  };

  const handleSubmit = async (data: SendInvoiceFormData) => {
    const requestData: ISendInvoiceWithPaymentLinkRequest = {
      includePaymentLink: data.includePaymentLink,
    };

    if (data.includePaymentLink) {
      const urls = generatePaymentUrls();
      requestData.successUrl = urls.successUrl;
      requestData.cancelUrl = urls.cancelUrl;
    }

    sendInvoice.mutate(requestData, {
      onSuccess: () => {
        form.reset();
        onOpenChange(false);
      },
    });
  };

  const handleClose = () => {
    form.reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Envoyer la facture par email
          </DialogTitle>
          <DialogDescription>
            Envoyez la facture <strong>{invoiceNumber}</strong> à{" "}
            <strong>{customerName}</strong> avec possibilité d&apos;ajouter un lien de paiement en ligne.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            {/* Section informations facture */}
            <div className="bg-muted/50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Info className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Détails de la facture</span>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Numéro :</span>{" "}
                  <span className="font-medium">{invoiceNumber}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Client :</span>{" "}
                  <span className="font-medium">{customerName}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-muted-foreground">Montant :</span>{" "}
                  <span className="font-medium">
                    {new Intl.NumberFormat("fr-FR", {
                      style: "currency",
                      currency: "EUR",
                    }).format(invoiceAmount)}
                  </span>
                </div>
              </div>
            </div>

            {/* Switch pour inclure le lien de paiement */}
            <FormField
              control={form.control}
              name="includePaymentLink"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-1">
                    <FormLabel className="flex items-center gap-2 text-base">
                      <CreditCard className="h-4 w-4" />
                      Inclure un lien de paiement en ligne
                    </FormLabel>
                    <FormDescription>
                      Permettre au client de payer directement via un lien sécurisé Stripe
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={sendInvoice.isPending}
              >
                Annuler
              </Button>
              <Button
                type="submit"
                disabled={sendInvoice.isPending}
                className="min-w-[120px]"
              >
                {sendInvoice.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Envoi...
                  </>
                ) : (
                  <>
                    <Mail className="h-4 w-4 mr-2" />
                    Envoyer
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
} 