export interface ICreateCompanyRequest {
  company_id?: number;
  name: string;
  siret: string;
  tva_intra?: string;
  tva_applicable: boolean;
  RCS_number: string;
  RCS_city: string;
  capital?: number;
  siren: string;
  legal_form: 'SAS' | 'SARL' | 'SA' | 'SASU' | 'EURL' | 'SNC' | 'SOCIETE_CIVILE' | 'ENTREPRISE_INDIVIDUELLE';
  // Informations d'adresse
  address: string;
  postal_code: string;
  city: string;
  country: string;
  // Informations de contact
  email?: string;
  phone?: string;
  website?: string;
}

export interface IUpdateCompanyRequest extends Partial<ICreateCompanyRequest> {} 