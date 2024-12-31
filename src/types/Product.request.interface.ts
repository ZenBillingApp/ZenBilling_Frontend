export interface ICreateProductRequest {
  name: string;
  description?: string;
  price_excluding_tax: number;
  vat_rate: number;
}

export interface IUpdateProductRequest extends Partial<ICreateProductRequest> {} 