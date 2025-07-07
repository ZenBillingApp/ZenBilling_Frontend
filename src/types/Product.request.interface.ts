import { ProductUnit, VatRate } from './Product.interface';

export interface ICreateProductRequest {
  name: string;
  description?: string;
  price_excluding_tax: number | null;
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

// Nouvelles interfaces pour l'IA
export interface IGenerateDescriptionRequest {
  productName: string;
  category?: string;
  additionalInfo?: string;
}

export interface IGenerateDescriptionResponse {
  description: string;
  generatedAt: string;
  productName: string;
}

export interface IGenerateDescriptionSuggestionsResponse {
  suggestions: {
    description: string;
    tone: string;
  }[];
  generatedAt: string;
  productName: string;
} 