import { ICustomer } from './Customer.interface';
import { IQuoteItem } from './QuoteItem.interface';

export type QuoteStatus = 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired';

export interface IQuote {
  quote_id?: number;
  customer_id: number;
  user_id: number;
  company_id: number | null;
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
  Customer?: ICustomer;
  QuoteItems?: IQuoteItem[];
} 