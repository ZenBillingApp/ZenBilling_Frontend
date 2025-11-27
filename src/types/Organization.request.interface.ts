import { ILegalForm } from "./Organization.interface";

// Interface pour créer une organisation (paramètres de authClient.organization.create)
export interface ICreateOrganizationRequest {
  name: string;
  slug: string;
  // Additional fields
  siret: string;
  tva_intra?: string;
  tva_applicable: boolean;
  RCS_number: string;
  RCS_city: string;
  capital?: number | undefined;
  siren: string;
  legal_form: ILegalForm;
  address: string;
  postal_code: string;
  city: string;
  country: string;
  email?: string | undefined;
  phone?: string | undefined;
  website?: string | undefined;
}

// Interface pour mettre à jour une organisation (paramètres de authClient.organization.update)
export interface IUpdateOrganizationRequest {
  organizationId: string;
  name?: string;
  slug?: string;
  logo?: string | undefined;
  // Additional fields (tous optionnels pour un update)
  siret?: string;
  tva_intra?: string | undefined;
  tva_applicable?: boolean;
  RCS_number?: string;
  RCS_city?: string;
  capital?: number | undefined;
  siren?: string;
  legal_form?: ILegalForm;
  address?: string;
  postal_code?: string;
  city?: string;
  country?: string;
  email?: string | undefined;
  phone?: string | undefined;
  website?: string | undefined;
}

// Interface pour inviter un membre
export interface IInviteMemberRequest {
  organizationId: string;
  email: string;
  role: "admin" | "member";
}

// Interface pour mettre à jour le rôle d'un membre
export interface IUpdateMemberRoleRequest {
  organizationId: string;
  memberId: string;
  role: "admin" | "member";
}

// Interface pour supprimer un membre
export interface IRemoveMemberRequest {
  organizationId: string;
  memberId: string;
}
