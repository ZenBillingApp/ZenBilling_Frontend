import { ICustomer } from './Customer.interface';
import { IInvoiceItem } from './InvoiceItem.interface';
import { IPayment } from './Payment.interface';
import { ICompany } from './Company.interface';
import { IPagination } from './pagination.interface';
export type InvoiceStatus = 'pending' | 'sent' | 'paid' | 'cancelled' | 'late';

export interface IInvoice {
  invoice_id?: string;
  customer_id: string | null;
  user_id: string;
  company_id: string | null;
  invoice_number: string;
  invoice_date: Date;
  due_date: Date;
  amount_excluding_tax: number;
  tax: number;
  amount_including_tax: number;
  status: InvoiceStatus;
  conditions?: string;
  late_payment_penalty?: string;
  
  // Relations
  customer?: ICustomer;
  items?: IInvoiceItem[];
  payments?: IPayment[];
  company?: ICompany;
  createdAt: Date;
  updatedAt: Date;
} 


export interface IInvoicePagination {
  invoices: IInvoice[];
  pagination: IPagination;
}