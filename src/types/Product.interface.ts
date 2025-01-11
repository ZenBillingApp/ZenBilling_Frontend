export type ProductUnit = 
  | 'unité' 
  | 'kg' 
  | 'g' 
  | 'l' 
  | 'ml' 
  | 'm' 
  | 'cm' 
  | 'm²' 
  | 'cm²' 
  | 'm³' 
  | 'h' 
  | 'jour' 
  | 'mois' 
  | 'année';

export type VatRate = 0.00 | 2.10 | 5.50 | 10.00 | 20.00;

export interface IProduct {
  product_id?: number;
  company_id: number;
  name: string;
  description: string | null;
  price_excluding_tax: number;
  vat_rate: VatRate;
  unit: ProductUnit;
  createdAt?: Date;
  updatedAt?: Date;
} 