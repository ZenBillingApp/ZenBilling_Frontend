import { ProductUnit, VatRate } from './Product.interface';

export interface ICreateProductRequest {
  name: string;
  description?: string;
  price_excluding_tax: number;
  vat_rate: VatRate;
  unit?: ProductUnit;
}

export type IUpdateProductRequest = Partial<ICreateProductRequest>

export interface IProductQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  minVatRate?: number;
  maxVatRate?: number;
  sortBy?: 'name' | 'price_excluding_tax' | 'vat_rate' | 'createdAt';
  sortOrder?: 'ASC' | 'DESC';
} 