import { IUser } from '@/types/User.interface';

export type LegalForm = 'SAS' | 'SARL' | 'EURL' | 'SASU' | 'SA' | 'SNC' | 'SOCIETE_CIVILE' | 'ENTREPRISE_INDIVIDUELLE';

export interface ICompanyLegalForm {
  legalForms: LegalForm [];
}


export interface ICompany {
  company_id: string;
  name: string;
  siret: string;
  tva_intra: string;
  tva_applicable: boolean;
  RCS_number: string;
  RCS_city: string;
  capital: number;
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
  website?: string;
  users?: IUser[];
  createdAt: Date;
  updatedAt: Date;
} 