import { ProductUnit, VatRate } from './Product.interface';
import { QuoteStatus } from './Quote.interface';

export interface IQuoteQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: QuoteStatus;
  customer_id?: number;
  start_date?: string;
  end_date?: string;
  min_amount?: number;
  max_amount?: number;
  sortBy?: 'quote_date' | 'validity_date' | 'amount_including_tax' | 'status' | 'quote_number';
  sortOrder?: 'ASC' | 'DESC';
}

export interface IQuoteItem {
  product_id?: number;
  name?: string;
  description?: string;
  quantity: number;
  unit_price_excluding_tax: number;
  vat_rate: VatRate;
  unit?: ProductUnit;
  save_as_product?: boolean;
}

export interface ICreateQuoteRequest {
  customer_id: number;
  quote_date: Date;
  validity_date: Date;
  items: IQuoteItem[];
  conditions?: string;
  notes?: string;
}

export interface IUpdateQuoteRequest {
  quote_date?: Date;
  validity_date?: Date;
  status?: QuoteStatus;
  conditions?: string;
  notes?: string;
} 