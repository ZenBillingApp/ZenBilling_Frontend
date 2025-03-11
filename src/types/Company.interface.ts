import { IUser } from '@/types/User.interface';

export type ICompanyLegalForm = 'SAS' | 'SARL' | 'EURL' | 'SASU' | 'SA' | 'SNC' | 'SOCIETE_CIVILE' | 'ENTREPRISE_INDIVIDUELLE';

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
  legal_form: ICompanyLegalForm;
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
} 