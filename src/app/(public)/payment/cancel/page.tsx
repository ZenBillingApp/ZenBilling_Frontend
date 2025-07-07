"use client";

import { Suspense } from "react";
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
  XCircle,
  FileText,
  Calendar,
  Building,
  User,
  RotateCcw,
  ExternalLink,
  AlertCircle,
} from "lucide-react";

interface PaymentCancelData {
  invoiceNumber: string;
  invoiceId: string;
  amount: number;
  customerName: string;
  customerType: "individual" | "company";
  cancelDate: string;
  sessionId?: string;
}

function PaymentCancelContent() {
  const searchParams = useSearchParams();
  const [paymentData, setPaymentData] = useState<PaymentCancelData | null>(null);
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
        cancelDate: new Date().toISOString(),
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

  const handleRetryPayment = () => {
    // Rediriger vers une nouvelle session de paiement ou fermer
    window.close();
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
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950/20 dark:to-red-950/20">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Header d'annulation */}
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="rounded-full bg-orange-100 dark:bg-orange-900/30 p-6">
                <XCircle className="h-16 w-16 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-orange-900 dark:text-orange-100">
                Paiement annulé
              </h1>
              <p className="text-lg text-orange-700 dark:text-orange-300 mt-2">
                Votre paiement a été annulé
              </p>
            </div>
          </div>

          {/* Détails de la facture */}
          <Card className="border-orange-200 dark:border-orange-800">
            <CardHeader className="bg-orange-50 dark:bg-orange-900/20">
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-orange-600" />
                Détails de la facture
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
                  <p className="text-sm text-muted-foreground">Montant</p>
                  <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
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
                  <p className="text-sm text-muted-foreground">Date d&apos;annulation</p>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">
                      {new Date(paymentData.cancelDate).toLocaleDateString("fr-FR", {
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
                  <p className="text-sm text-muted-foreground">Référence de session</p>
                  <code className="text-xs bg-muted px-2 py-1 rounded font-mono">
                    {paymentData.sessionId}
                  </code>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Statut et informations */}
          <Card className="border-orange-200 dark:border-orange-800">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-4">
                <Badge variant="secondary" className="bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300">
                  <XCircle className="h-3 w-3 mr-1" />
                  Paiement annulé
                </Badge>
              </div>
              <div className="space-y-3 text-sm text-muted-foreground">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-orange-500 mt-0.5 flex-shrink-0" />
                  <p>
                    Votre paiement a été annulé et aucun montant n&apos;a été débité
                  </p>
                </div>
                <p>
                  💳 Aucune charge n&apos;a été effectuée sur votre carte
                </p>
                <p>
                  📄 La facture reste en attente de paiement
                </p>
                <p>
                  📧 Vous pouvez contacter l&apos;émetteur pour un nouveau lien de paiement
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Raisons courantes d'annulation */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Pourquoi mon paiement a-t-il été annulé ?</CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-2">
              <p>• Vous avez cliqué sur le bouton &quot;Retour&quot; ou &quot;Annuler&quot;</p>
              <p>• Vous avez fermé la page de paiement avant la fin du processus</p>
              <p>• Le délai de paiement a expiré</p>
              <p>• Une erreur technique s&apos;est produite</p>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              onClick={handleRetryPayment}
              className="flex items-center gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              Réessayer le paiement
            </Button>
            <Button
              onClick={() => window.close()}
              variant="outline"
              className="flex items-center gap-2"
            >
              <ExternalLink className="h-4 w-4" />
              Fermer cette page
            </Button>
          </div>

          {/* Footer */}
          <div className="text-center text-sm text-muted-foreground pt-8">
            <p>
              Pour effectuer un nouveau paiement, contactez l&apos;émetteur de la facture.
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

function PaymentCancelLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-pulse text-center">
        <div className="h-8 w-48 bg-muted rounded mx-auto mb-4"></div>
        <div className="h-4 w-32 bg-muted rounded mx-auto"></div>
      </div>
    </div>
  );
}

export default function PaymentCancelPage() {
  return (
    <Suspense fallback={<PaymentCancelLoading />}>
      <PaymentCancelContent />
    </Suspense>
  );
} 