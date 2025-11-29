"use client";

import { Building2, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface EmptyOrganizationStateProps {
  title?: string;
  description?: string;
}

export function EmptyOrganizationState({
  title = "Aucune organisation sélectionnée",
  description = "Vous devez sélectionner une organisation pour accéder à cette page.",
}: EmptyOrganizationStateProps) {
  const router = useRouter();

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
      <Card className="max-w-md border-dashed">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-muted rounded-full">
              <Building2 className="w-12 h-12 text-muted-foreground" />
            </div>
          </div>
          <CardTitle className="text-2xl">{title}</CardTitle>
          <CardDescription className="text-base">{description}</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center">
          <Button
            onClick={() => router.push("/select-organization")}
            size="lg"
          >
            <Building2 className="w-4 h-4 mr-2" />
            Sélectionner une organisation
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
