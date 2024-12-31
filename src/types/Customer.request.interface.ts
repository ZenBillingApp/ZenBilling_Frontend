export interface ICreateIndividualCustomerData {
  first_name: string;
  last_name: string;
}

export interface ICreateBusinessCustomerData {
  name: string;
  siret?: string;
  tva_intra?: string;
  tva_applicable?: boolean;
  RCS_number?: string;
  RCS_city?: string;
  capital?: number;
  siren?: string;
  legal_form?: 'SAS' | 'SARL' | 'SA' | 'SASU' | 'EURL' | 'SNC' | 'SOCIETE_CIVILE' | 'ENTREPRISE_INDIVIDUELLE';
}

export interface ICreateCustomerRequest {
  type: 'individual' | 'company';
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  postal_code?: string;
  country?: string;
  individual?: ICreateIndividualCustomerData;
  business?: ICreateBusinessCustomerData;
}

export interface IUpdateCustomerRequest {
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  postal_code?: string;
  country?: string;
  individual?: Partial<ICreateIndividualCustomerData>;
  business?: Partial<ICreateBusinessCustomerData>;
} 