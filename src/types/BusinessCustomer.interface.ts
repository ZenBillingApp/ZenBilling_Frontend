export interface IBusinessCustomer {
  customer_id: number;
  name: string;
  siret: string;
  siren: string;
  tva_intra: string | null;
  tva_applicable: boolean;
} 