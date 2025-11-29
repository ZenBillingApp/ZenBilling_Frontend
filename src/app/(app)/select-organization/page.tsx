"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Building2, Plus, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useOrganizations, useSetActiveOrganization } from "@/hooks/useOrganization";
import { Skeleton } from "@/components/ui/skeleton";
import { CreateOrganizationModal } from "@/components/organization/create-organization-dialog";

export default function SelectOrganizationPage() {
  const router = useRouter();
  const { data: organizations, isPending } = useOrganizations();
  const setActiveOrganization = useSetActiveOrganization();

  useEffect(() => {
    // Si l'utilisateur n'a aucune organisation, on peut rediriger vers onboarding ou rester ici
    // Pour l'instant on reste sur cette page pour permettre la création
  }, [organizations]);

  const handleSelectOrganization = async (organizationId: string) => {
    await setActiveOrganization.mutateAsync(organizationId);
    router.push("/dashboard");
  };

  if (isPending) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-full max-w-4xl px-4 py-16 space-y-8">
          <div className="text-center space-y-2">
            <Skeleton className="h-10 w-64 mx-auto" />
            <Skeleton className="h-6 w-96 mx-auto" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-48" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const organizationList = organizations || [];

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="w-full max-w-4xl px-4 py-16">
        <div className="text-center mb-12 space-y-2">
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-primary/10 rounded-full">
              <Building2 className="w-12 h-12 text-primary" />
            </div>
          </div>
          <h1 className="text-4xl font-bold tracking-tight">
            Sélectionnez une organisation
          </h1>
          <p className="text-muted-foreground text-lg">
            Choisissez l'organisation avec laquelle vous souhaitez travailler
          </p>
        </div>

        {organizationList.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-16 space-y-4">
              <div className="p-4 bg-muted rounded-full">
                <Building2 className="w-12 h-12 text-muted-foreground" />
              </div>
              <div className="text-center space-y-2">
                <h3 className="text-xl font-semibold">
                  Aucune organisation trouvée
                </h3>
                <p className="text-muted-foreground max-w-md">
                  Vous n'appartenez à aucune organisation. Créez-en une nouvelle
                  ou attendez qu'un administrateur vous invite.
                </p>
              </div>
              <CreateOrganizationModal>
                <Button size="lg" className="mt-4">
                  <Plus className="w-4 h-4 mr-2" />
                  Créer une organisation
                </Button>
              </CreateOrganizationModal>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {organizationList.map((org) => (
                <Card
                  key={org.id}
                  className="cursor-pointer hover:border-primary transition-all hover:shadow-lg"
                  onClick={() => handleSelectOrganization(org.id)}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        {org.logo ? (
                          <img
                            src={org.logo}
                            alt={org.name}
                            className="w-12 h-12 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                            <Building2 className="w-6 h-6 text-primary" />
                          </div>
                        )}
                        <div>
                          <CardTitle className="text-lg">{org.name}</CardTitle>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {org.slug && (
                      <p className="text-sm text-muted-foreground">
                        @{org.slug}
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}

              {/* Carte pour créer une nouvelle organisation */}
              <CreateOrganizationModal>
                <Card className="cursor-pointer border-dashed hover:border-primary transition-all hover:shadow-lg">
                  <CardContent className="flex flex-col h-full items-center justify-center space-y-2 p-4">
                    <div className="p-1 bg-primary/10 rounded-full">
                      <Plus className="w-6 h-6 text-primary" />
                    </div>
                    <p className="font-semibold text-center text-sm">
                      Créer une nouvelle
                      <br />
                      organisation
                    </p>
                  </CardContent>
                </Card>
              </CreateOrganizationModal>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
