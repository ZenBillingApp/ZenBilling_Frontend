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

export interface IProduct {
  product_id?: number;
  company_id: number;
  name: string;
  description: string | null;
  price_excluding_tax: number;
  vat_rate: number;
  unit: ProductUnit;
  createdAt?: Date;
  updatedAt?: Date;
} 