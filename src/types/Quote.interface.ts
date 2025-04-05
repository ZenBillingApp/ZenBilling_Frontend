import { ICustomer } from './Customer.interface';
import { IQuoteItem } from './QuoteItem.interface';
import { IPagination } from './pagination.interface';
export type QuoteStatus = 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired';

export interface IQuote {
  quote_id?: string;
  customer_id: string;
  user_id: string;
  company_id: string | null;
  quote_number: string;
  quote_date: Date;
  validity_date: Date;
  amount_excluding_tax: number;
  tax: number;
  amount_including_tax: number;
  status: QuoteStatus;
  conditions?: string;
  notes?: string;
  
  // Relations
  customer?: ICustomer;
  items?: IQuoteItem[];
} 

export interface IQuotePagination {
  quotes: IQuote[];
  pagination: IPagination;
}
