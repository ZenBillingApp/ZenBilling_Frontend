"use client";

import Image from "next/image";
import { useStripeConnect, useStripeAccountLink, useStripeSkippingOnboarding } from "@/hooks/useStripe";
import { Button } from "@/components/ui/button";
import { usePathname } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  CreditCard,
  ArrowRight,
  CheckCircle,
  Globe,
  ShieldCheck,
} from "lucide-react";
import { useAuthStore } from "@/stores/authStores";
import logo from "@/assets/logo.png";
import stripeLogo from "@/assets/stripe.svg";

export default function StripeOnboardingPage() {
  const { user } = useAuthStore();
  const pathname = usePathname();
  const stripeConnect = useStripeConnect();
  const stripeAccountLink = useStripeAccountLink(
    process.env.NEXT_PUBLIC_CLIENT_URL + pathname,
    process.env.NEXT_PUBLIC_CLIENT_URL + pathname,
  );
  const stripeSkippingOnboarding = useStripeSkippingOnboarding();
  const handleCreateAccount = async () => {
    await stripeConnect.mutateAsync();
  };

  const handleGoToOnboarding = async () => {
    await stripeAccountLink.mutateAsync();
  };


  return (
    <div className=" flex flex-col container justify-center min-h-screen mx-auto max-w-5xl py-10 space-y-10">
      <div className="text-center space-y-4">
      <div className="flex flex-col items-center gap-2 mb-6">
          <a href="#" className="flex flex-col items-center gap-2 font-medium">
            <div className="flex h-10 w-10 items-center justify-center rounded-md ">
              <Image src={logo} alt="zenbilling logo" width={32} height={32} />
            </div>
            <span className="text-xl font-bold">ZenBilling</span>
          </a>
        </div>
        <h1 className="text-3xl font-bold">Configuration de votre compte Stripe</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Connectez votre compte Stripe pour commencer à accepter les paiements en ligne directement depuis vos factures.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="space-y-1">
            <div className="bg-primary/10 p-3 rounded-full w-fit">
              <CreditCard className="w-6 h-6 text-primary" />
            </div>
            <CardTitle>Acceptez les paiements</CardTitle>
            <CardDescription>
              Vos clients peuvent payer directement depuis leurs factures avec carte bancaire.
            </CardDescription>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="space-y-1">
            <div className="bg-primary/10 p-3 rounded-full w-fit">
              <Globe className="w-6 h-6 text-primary" />
            </div>
            <CardTitle>Connexion internationale</CardTitle>
            <CardDescription>
              Acceptez des paiements dans plus de 135 devises du monde entier.
            </CardDescription>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="space-y-1">
            <div className="bg-primary/10 p-3 rounded-full w-fit">
              <ShieldCheck className="w-6 h-6 text-primary" />
            </div>
            <CardTitle>Sécurité avancée</CardTitle>
            <CardDescription>
              Toutes les transactions sont sécurisées avec le chiffrement SSL et l&apos;authentification 3D Secure.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>

      <Card className="border-2 border-primary/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl">Configurer Stripe en 2 étapes</CardTitle>
            <Image 
              src={stripeLogo} 
              alt="Stripe" 
              width={80} 
              height={34}
              className="h-8 w-auto"
            />
          </div>
          <CardDescription>
            Suivez ces étapes pour connecter votre compte Stripe à ZenBilling
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="flex gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                1
              </div>
              <div className="space-y-1">
                <h3 className="font-medium">Créer un compte Stripe Connect</h3>
                <p className="text-sm text-muted-foreground">
                  Créez un compte Stripe Connect pour votre entreprise directement depuis notre plateforme.
                </p>
                <Button 
                  className="mt-2" 
                  onClick={handleCreateAccount}
                  disabled={stripeConnect.isPending || Boolean(user?.stripe_account_id)}
                >

                  {stripeConnect.isPending ? "Création en cours..." :  user?.stripe_account_id ? "Votre compte Stripe est déjà créé" : "Créer mon compte Stripe"}
                </Button>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                2
              </div>
              <div className="space-y-1">
                <h3 className="font-medium">Compléter l&apos;onboarding Stripe</h3>
                <p className="text-sm text-muted-foreground">
                  Suivez les étapes d&apos;onboarding pour vérifier votre identité et configurer vos méthodes de paiement.
                </p>
                <Button 
                  className="mt-2" 
                  onClick={handleGoToOnboarding}
                  disabled={stripeAccountLink.isPending}
                >
                  {stripeAccountLink.isPending ? "Chargement..." : "Compléter l'onboarding"}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="bg-muted/50 px-6 py-4">
          <div className="flex items-center text-sm text-muted-foreground">
            <CheckCircle className="w-4 h-4 mr-2 text-primary" />
            En vous connectant à Stripe, vous acceptez les conditions d&apos;utilisation de Stripe et notre politique de confidentialité.
          </div>
        </CardFooter>
      </Card>

      <div className="text-center">
        <Button 
          variant="outline" 
          onClick={() => stripeSkippingOnboarding.mutateAsync()}
        >
          Je configurerai Stripe plus tard
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
} 