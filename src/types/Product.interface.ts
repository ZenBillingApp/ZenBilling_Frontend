export type ProductUnit = 
  | 'unite' 
  | 'kg' 
  | 'g' 
  | 'l' 
  | 'ml' 
  | 'm' 
  | 'cm' 
  | 'm2' 
  | 'cm2' 
  | 'm3' 
  | 'h' 
  | 'jour' 
  | 'mois' 
  | 'annee';

  export type VatRate = 
  | 'ZERO'
  | 'REDUCED_1'
  | 'REDUCED_2'
  | 'REDUCED_3'
  | 'STANDARD';

  export const vatRateToNumber = (vatRate: VatRate): number => {
    const mapping = {
      ZERO: 0.00,
      REDUCED_1: 2.10,
      REDUCED_2: 5.50,
      REDUCED_3: 10.00,
      STANDARD: 20.00
    };
    return mapping[vatRate];
  }; 

export interface IProduct {
  product_id?: string;
  company_id: string;
  name: string;
  description: string | null;
  price_excluding_tax: number;
  vat_rate: VatRate;
  unit: ProductUnit;
  created_at: string;
  updated_at: string;
} 