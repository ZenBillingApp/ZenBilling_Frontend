"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { authClient, invalidateTokenCache } from "@/lib/auth-client";
import { useToast } from "@/hooks/use-toast";
import {
  ICreateOrganizationRequest,
  IUpdateOrganizationRequest,
  IInviteMemberRequest,
  IUpdateMemberRoleRequest,
  IRemoveMemberRequest,
} from "@/types/Organization.request.interface";
import {
  IOrganization,
} from "@/types/Organization.interface";

/**
 * Hook pour récupérer la liste des organisations de l'utilisateur connecté
 */
export const useOrganizations = () => {
  return authClient.useListOrganizations();
};

/**
 * Hook pour récupérer l'organisation active de l'utilisateur
 */
export const useActiveOrganization = () => {
  return authClient.useActiveOrganization();
};

/**
 * Hook pour récupérer l'ID de l'organisation active
 * Retourne l'ID de l'organisation active ou undefined si aucune organisation n'est active
 */
export const useActiveOrganizationId = () => {
  const { data } = useActiveOrganization();
  return data?.id;
};

/**
 * Hook pour récupérer une organisation complète avec ses membres
 */
export const useFullOrganization = (organizationId?: string) => {
  return useQuery<IOrganization | null>({
    queryKey: ["fullOrganization", organizationId],
    queryFn: async () => {
      const response = await authClient.organization.getFullOrganization({
        query: {
          organizationId,
        },
      });
      if (response.error) {
        throw new Error(response.error.message || "Impossible de récupérer l'organisation");
      }
      return response.data as IOrganization;
    },
    enabled: !!organizationId,
  });
};
export const useCreateOrganization = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: ICreateOrganizationRequest) => {
      const response = await authClient.organization.create({
        ...data
      });
      if (response.error) {
        throw new Error(response.error.message || "Erreur lors de la création de l'organisation");
      }
      return response.data as IOrganization;
    },
    onSuccess: async (data) => {
      await queryClient.invalidateQueries({ queryKey: ["organizations"] });
      await queryClient.invalidateQueries({ queryKey: ["organization", data.id] });
      await queryClient.invalidateQueries({ queryKey: ["fullOrganization", data.id] });
      toast({
        title: "Organisation créée",
        description: `L'organisation "${data.name}" a été créée avec succès`,
      });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Erreur lors de la création",
        description: error.message,
      });
    },
  });
};

/**
 * Hook pour mettre à jour une organisation
 */
export const useUpdateOrganization = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: IUpdateOrganizationRequest) => {
      const response = await authClient.organization.update({
        organizationId: data.organizationId,
        data: {
          ...data,
          logo: data.logo || undefined,
          tva_intra: data.tva_intra || undefined,
          capital: data.capital || undefined,
          email: data.email || undefined,
          phone: data.phone || undefined,
          website: data.website || undefined,
        }
      });
      if (response.error) {
        throw new Error(response.error.message || "Erreur lors de la mise à jour");
      }
      return response.data as IOrganization;
    },
    onSuccess: async (data) => {
      await queryClient.invalidateQueries({ queryKey: ["organizations"] });
      await queryClient.invalidateQueries({ queryKey: ["organization", data.id] });
      await queryClient.invalidateQueries({ queryKey: ["fullOrganization", data.id] });
      toast({
        title: "Organisation mise à jour",
        description: "Les modifications ont été enregistrées avec succès",
      });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Erreur lors de la mise à jour",
        description: error.message,
      });
    },
  });
};

/**
 * Hook pour définir l'organisation active
 */
export const useSetActiveOrganization = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (organizationId: string) => {
      const response = await authClient.organization.setActive({
        organizationId,
      });
      if (response.error) {
        throw new Error(response.error.message || "Erreur lors du changement d'organisation");
      }
      return response.data;
    },
    onSuccess: async () => {
      // Invalider le cache JWT car l'organisation a changé
      // Le prochain appel API obtiendra un nouveau token avec le bon activeOrganizationId
      invalidateTokenCache();

      // Invalider uniquement l'organisation active
      // Les autres queries se rafraîchiront automatiquement car leurs query keys incluent l'organization_id
      await queryClient.invalidateQueries({ queryKey: ["activeOrganization"] });

      toast({
        title: "Organisation changée",
        description: "L'organisation active a été mise à jour",
      });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Erreur lors du changement d'organisation",
        description: error.message,
      });
    },
  });
};

/**
 * Hook pour inviter un membre dans une organisation
 */
export const useInviteMember = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: IInviteMemberRequest) => {
      const response = await authClient.organization.inviteMember(data);
      if (response.error) {
        throw new Error(response.error.message || "Erreur lors de l'invitation");
      }
      return response.data;
    },
    onSuccess: async (_, variables) => {
      await queryClient.invalidateQueries({
        queryKey: ["fullOrganization", variables.organizationId],
      });
      toast({
        title: "Invitation envoyée",
        description: `Une invitation a été envoyée à ${variables.email}`,
      });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Erreur lors de l'invitation",
        description: error.message,
      });
    },
  });
};

/**
 * Hook pour mettre à jour le rôle d'un membre
 */
export const useUpdateMemberRole = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: IUpdateMemberRoleRequest) => {
      const response = await authClient.organization.updateMemberRole({
        organizationId: data.organizationId,
        memberId: data.memberId,
        role: data.role,
      });
      if (response.error) {
        throw new Error(response.error.message || "Erreur lors de la mise à jour du rôle");
      }
      return response.data;
    },
    onSuccess: async (_, variables) => {
      await queryClient.invalidateQueries({
        queryKey: ["fullOrganization", variables.organizationId],
      });
      toast({
        title: "Rôle mis à jour",
        description: "Le rôle du membre a été modifié avec succès",
      });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Erreur lors de la mise à jour du rôle",
        description: error.message,
      });
    },
  });
};

/**
 * Hook pour supprimer un membre d'une organisation
 */
export const useRemoveMember = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: IRemoveMemberRequest) => {
      const response = await authClient.organization.removeMember({
        organizationId: data.organizationId,
        memberIdOrEmail: data.memberId,
      });
      if (response.error) {
        throw new Error(response.error.message || "Erreur lors de la suppression du membre");
      }
      return response.data;
    },
    onSuccess: async (_, variables) => {
      await queryClient.invalidateQueries({
        queryKey: ["fullOrganization", variables.organizationId],
      });
      toast({
        title: "Membre supprimé",
        description: "Le membre a été retiré de l'organisation",
      });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Erreur lors de la suppression",
        description: error.message,
      });
    },
  });
};

/**
 * Hook pour supprimer une organisation
 */
export const useDeleteOrganization = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (organizationId: string) => {
      const response = await authClient.organization.delete({
        organizationId,
      });
      if (response.error) {
        throw new Error(response.error.message || "Erreur lors de la suppression de l'organisation");
      }
      return response.data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["organizations"] });
      await queryClient.invalidateQueries({ queryKey: ["activeOrganization"] });
      toast({
        title: "Organisation supprimée",
        description: "L'organisation a été supprimée avec succès",
      });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Erreur lors de la suppression",
        description: error.message,
      });
    },
  });
};
