export interface ICreateProductRequest {
  name: string;
  description?: string;
  price_excluding_tax: number;
  vat_rate: number;
}

export interface IUpdateProductRequest extends Partial<ICreateProductRequest> {
  // Add at least one member to avoid the interface being equivalent to its supertype
  id?: number;
}

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