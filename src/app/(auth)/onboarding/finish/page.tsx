"use client";

import { Button } from "@/components/ui/button";
import { GalleryVerticalEnd, CheckCircle, ArrowRight } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useOnboardingFinish } from "@/hooks/useAuth";



export default function OnboardingFinish() {
  const { mutate: onboardingFinish } = useOnboardingFinish();
  const handleStartUsing = () => {
    onboardingFinish();
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center gap-2 mb-6">
          <a href="#" className="flex flex-col items-center gap-2 font-medium">
            <div className="flex h-10 w-10 items-center justify-center rounded-md ">
              <GalleryVerticalEnd className="size-6" />
            </div>
            <span className="text-xl font-bold">ZenBilling</span>
          </a>
        </div>

        <Card className="w-full">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
            <CardTitle className="text-2xl">Configuration terminée !</CardTitle>
            <CardDescription>
              Félicitations, vous avez terminé la configuration de votre compte ZenBilling.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-center text-muted-foreground">
              Votre entreprise a été configurée avec succès. Vous êtes maintenant prêt à commencer à utiliser ZenBilling pour gérer vos factures et vos clients.
            </p>
            <div className="grid grid-cols-1 gap-4 py-4">
              <div className="flex items-center gap-3 rounded-lg border p-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                  <CheckCircle className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">Compte créé</p>
                  <p className="text-sm text-muted-foreground">Votre compte utilisateur est prêt</p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-lg border p-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                  <CheckCircle className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">Entreprise configurée</p>
                  <p className="text-sm text-muted-foreground">Les informations de votre entreprise sont enregistrées</p>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              className="w-full gap-2" 
              size="lg" 
              onClick={handleStartUsing}
            >
              Commencer à utiliser ZenBilling
              <ArrowRight className="h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>

        {/* <p className="mt-6 text-center text-sm text-muted-foreground">
          Besoin d&apos;aide ? <a href="#" className="font-medium text-primary hover:underline">Contactez notre support</a>
        </p> */}
      </div>
    </div>
  );
}
