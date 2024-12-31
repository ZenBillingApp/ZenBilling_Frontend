export interface IBusinessCustomer {
  customer_id: number;
  name: string;
  siret: string | null;
  tva_intra: string | null;
  tva_applicable: boolean | null;
  RCS_number: string | null;
  RCS_city: string | null;
  capital: number | null;
  siren: string | null;
  legal_form: 'SAS' | 'SARL' | 'SA' | 'SASU' | 'EURL' | 'SNC' | 'SOCIETE_CIVILE' | 'ENTREPRISE_INDIVIDUELLE' | null;
} 