import { LegalForm } from "./Company.interface";

export interface ICreateCompanyRequest {
  company_id?: string;
  name: string;
  siret: string;
  tva_intra: string | null;
  tva_applicable: boolean;
  RCS_number: string;
  RCS_city: string;
  capital?: number | null;
  siren: string;
  legal_form: LegalForm;
  // Informations d'adresse
  address: string;
  postal_code: string;
  city: string;
  country: string;
  // Informations de contact
  email: string;
  phone: string;
  website: string | null;
}

export type IUpdateCompanyRequest = Partial<ICreateCompanyRequest> 