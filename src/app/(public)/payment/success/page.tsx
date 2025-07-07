"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle2,
  FileText,
  Calendar,
  CreditCard,
  Building,
  User,
  Download,
  ExternalLink,
} from "lucide-react";

interface PaymentSuccessData {
  invoiceNumber: string;
  invoiceId: string;
  amount: number;
  customerName: string;
  customerType: "individual" | "company";
  paymentDate: string;
  sessionId?: string;
}

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams();
  const [paymentData, setPaymentData] = useState<PaymentSuccessData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Récupérer les paramètres de l'URL
    const invoiceNumber = searchParams.get("invoice_number");
    const invoiceId = searchParams.get("invoice_id");
    const amount = searchParams.get("amount");
    const customerName = searchParams.get("customer_name");
    const customerType = searchParams.get("customer_type");
    const sessionId = searchParams.get("session_id");

    if (invoiceNumber && invoiceId && amount && customerName) {
      setPaymentData({
        invoiceNumber,
        invoiceId,
        amount: parseFloat(amount),
        customerName: decodeURIComponent(customerName),
        customerType: (customerType as "individual" | "company") || "individual",
        paymentDate: new Date().toISOString(),
        sessionId: sessionId || undefined,
      });
    }
    setIsLoading(false);
  }, [searchParams]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
    }).format(amount);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-center">
          <div className="h-8 w-48 bg-muted rounded mx-auto mb-4"></div>
          <div className="h-4 w-32 bg-muted rounded mx-auto"></div>
        </div>
      </div>
    );
  }

  if (!paymentData) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-destructive">Informations manquantes</CardTitle>
            <CardDescription>
              Impossible de récupérer les informations de paiement.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button
              onClick={() => window.close()}
              variant="outline"
            >
              Fermer
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Header de succès */}
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="rounded-full bg-green-100 dark:bg-green-900/30 p-6">
                <CheckCircle2 className="h-16 w-16 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-green-900 dark:text-green-100">
                Paiement réussi !
              </h1>
              <p className="text-lg text-green-700 dark:text-green-300 mt-2">
                Votre paiement a été traité avec succès
              </p>
            </div>
          </div>

          {/* Détails du paiement */}
          <Card className="border-green-200 dark:border-green-800">
            <CardHeader className="bg-green-50 dark:bg-green-900/20">
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-green-600" />
                Détails du paiement
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Facture</p>
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{paymentData.invoiceNumber}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Montant payé</p>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {formatCurrency(paymentData.amount)}
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Client</p>
                  <div className="flex items-center gap-2">
                    {paymentData.customerType === "company" ? (
                      <Building className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <User className="h-4 w-4 text-muted-foreground" />
                    )}
                    <span className="font-medium">{paymentData.customerName}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Date du paiement</p>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">
                      {new Date(paymentData.paymentDate).toLocaleDateString("fr-FR", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                </div>
              </div>

              {paymentData.sessionId && (
                <div className="space-y-2 pt-2 border-t">
                  <p className="text-sm text-muted-foreground">Référence de transaction</p>
                  <code className="text-xs bg-muted px-2 py-1 rounded font-mono">
                    {paymentData.sessionId}
                  </code>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Statut et informations */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-4">
                <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  Paiement confirmé
                </Badge>
              </div>
              <div className="space-y-3 text-sm text-muted-foreground">
                <p>
                  ✅ Votre paiement a été traité et confirmé par notre système
                </p>
                <p>
                  📧 Un email de confirmation vous sera envoyé sous peu
                </p>
                <p>
                  📄 La facture sera automatiquement marquée comme payée
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              onClick={() => window.print()}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Imprimer cette page
            </Button>
            <Button
              onClick={() => window.close()}
              className="flex items-center gap-2"
            >
              <ExternalLink className="h-4 w-4" />
              Fermer cette page
            </Button>
          </div>

          {/* Footer */}
          <div className="text-center text-sm text-muted-foreground pt-8">
            <p>
              Pour toute question concernant ce paiement, contactez le service client.
            </p>
            <p className="mt-2 text-xs">
              Paiement sécurisé via Stripe • ZenBilling
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 