"use client";

import { ChevronsUpDown, Plus, Building2, AlertCircle } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  useOrganizations,
  useActiveOrganization,
  useSetActiveOrganization,
} from "@/hooks/useOrganization";
import { IOrganization } from "@/types/Organization.interface";
import { Skeleton } from "@/components/ui/skeleton";
import { CreateOrganizationModal } from "@/components/organization/create-organization-dialog";

export function OrganizationSwitcher() {
  const { isMobile } = useSidebar();
  const {
    data: organizations,
    isPending: isLoadingOrganizations,
    error: organizationsError
  } = useOrganizations();
  const {
    data: activeOrg,
    isPending: isLoadingActiveOrg
  } = useActiveOrganization();
  const {
    mutate: setActiveOrg,
    isPending: isSwitching
  } = useSetActiveOrganization();

  const handleSwitchOrganization = (organization: IOrganization) => {
    setActiveOrg(organization.id);
  };

  // Cas 1: Chargement initial des organisations
  if (isLoadingOrganizations) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <div className="flex items-center gap-2 p-2">
            <Skeleton className="h-8 w-8 rounded-lg" />
            <div className="flex flex-col gap-1 flex-1">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-16" />
            </div>
          </div>
        </SidebarMenuItem>
      </SidebarMenu>
    );
  }

  // Cas 2: Erreur lors du chargement des organisations
  if (organizationsError) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton
            size="lg"
            onClick={() => window.location.reload()}
            className="border-2 border-destructive/50"
          >
            <div className="bg-destructive/10 text-destructive flex aspect-square size-8 items-center justify-center rounded-lg">
              <AlertCircle className="size-4" />
            </div>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-medium text-destructive">Erreur de chargement</span>
              <span className="truncate text-xs text-destructive/70">Cliquez pour réessayer</span>
            </div>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    );
  }

  // Cas 3: Aucune organisation disponible
  if (!organizations || organizations.length === 0) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <CreateOrganizationModal>
            <SidebarMenuButton
              size="lg"
              className="border-2 border-dashed"
            >
              <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                <Plus className="size-4" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">Créer une organisation</span>
                <span className="truncate text-xs">Commencez ici</span>
              </div>
            </SidebarMenuButton>
          </CreateOrganizationModal>
        </SidebarMenuItem>
      </SidebarMenu>
    );
  }

  // Cas 4: Aucune organisation sélectionnée mais des organisations existent
  if (!activeOrg && !isLoadingActiveOrg) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton
                size="lg"
                className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground border-2 border-dashed"
              >
                <div className="bg-muted text-muted-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                  <Building2 className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">Sélectionner une organisation</span>
                  <span className="truncate text-xs text-muted-foreground">Aucune sélectionnée</span>
                </div>
                <ChevronsUpDown className="ml-auto" />
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
              align="start"
              side={isMobile ? "bottom" : "right"}
              sideOffset={4}
            >
              <DropdownMenuLabel className="text-muted-foreground text-xs">
                Organisations
              </DropdownMenuLabel>
              {organizations.map((organization, index) => (
                <DropdownMenuItem
                  key={organization.id}
                  onClick={() => handleSwitchOrganization(organization as IOrganization)}
                  className="gap-2 p-2"
                >
                  <div className="flex size-6 items-center justify-center rounded-md border">
                    <Building2 className="size-3.5 shrink-0" />
                  </div>
                  <div className="flex flex-col flex-1">
                    <span className="text-sm font-medium">
                      {organization.name}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {organization.legal_form}
                    </span>
                  </div>
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <CreateOrganizationModal>
                <DropdownMenuItem className="gap-2 p-2" onSelect={(e) => e.preventDefault()}>
                  <div className="flex size-6 items-center justify-center rounded-md border bg-transparent">
                    <Plus className="size-4" />
                  </div>
                  <div className="text-muted-foreground font-medium">
                    Créer une organisation
                  </div>
                </DropdownMenuItem>
              </CreateOrganizationModal>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>
    );
  }

  // Cas 5: Affichage normal avec organisations disponibles
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild disabled={isLoadingActiveOrg || isSwitching}>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              {isLoadingActiveOrg || isSwitching ? (
                <>
                  <Skeleton className="h-8 w-8 rounded-lg" />
                  <div className="flex flex-col gap-1 flex-1">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                </>
              ) : (
                <>
                  <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                    <Building2 className="size-4" />
                  </div>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-medium">{activeOrg?.name}</span>
                    <span className="truncate text-xs">{activeOrg?.legal_form}</span>
                  </div>
                  <ChevronsUpDown className="ml-auto" />
                </>
              )}
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            align="start"
            side={isMobile ? "bottom" : "right"}
            sideOffset={4}
          >
            <DropdownMenuLabel className="text-muted-foreground text-xs">
              Organisations
            </DropdownMenuLabel>
            {organizations.map((organization, index) => {
              const isActive = activeOrg?.id === organization.id;
              return (
                <DropdownMenuItem
                  key={organization.id}
                  onClick={() => handleSwitchOrganization(organization as IOrganization)}
                  className="gap-2 p-2"
                  disabled={isActive}
                >
                  <div className={`flex size-6 items-center justify-center rounded-md border ${isActive ? 'bg-sidebar-primary text-sidebar-primary-foreground border-sidebar-primary' : ''}`}>
                    <Building2 className="size-3.5 shrink-0" />
                  </div>
                  <div className="flex flex-col flex-1">
                    <span className={`text-sm font-medium ${isActive ? 'text-sidebar-primary' : ''}`}>
                      {organization.name}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {organization.legal_form}
                    </span>
                  </div>
                </DropdownMenuItem>
              );
            })}
            <DropdownMenuSeparator />
            <CreateOrganizationModal>
              <DropdownMenuItem className="gap-2 p-2" onSelect={(e) => e.preventDefault()}>
                <div className="flex size-6 items-center justify-center rounded-md border bg-transparent">
                  <Plus className="size-4" />
                </div>
                <div className="text-muted-foreground font-medium">
                  Créer une organisation
                </div>
              </DropdownMenuItem>
            </CreateOrganizationModal>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
