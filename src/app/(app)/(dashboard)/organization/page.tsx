"use client";

import { OrganizationDetails } from "@/components/organization/organization-details";
import { useActiveOrganization } from "@/hooks/useOrganization";
import { Loader2, AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function OrganizationPage() {
  const { data: activeOrg, isPending, error } = useActiveOrganization();

  if (isPending) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Chargement de l&apos;organisation...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Erreur</AlertTitle>
          <AlertDescription>
            Impossible de charger l&apos;organisation active.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!activeOrg) {
    return (
      <div className="container mx-auto px-4 py-6">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Aucune organisation sélectionnée</AlertTitle>
          <AlertDescription>
            Veuillez sélectionner une organisation dans le menu latéral.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6">Paramètres de l&apos;organisation</h1>
      <OrganizationDetails organizationId={activeOrg.id} />
    </div>
  );
}
