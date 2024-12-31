export interface IProduct {
  product_id?: number;
  company_id: number;
  name: string;
  description: string | null;
  price_excluding_tax: number;
  vat_rate: number;
  createdAt?: Date;
  updatedAt?: Date;
} 