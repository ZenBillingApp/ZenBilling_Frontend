import { ICustomer } from './Customer.interface';
import { IInvoiceItem } from './InvoiceItem.interface';
import { IPayment } from './Payment.interface';
import { ICompany } from './Company.interface';

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
  status: 'pending' | 'sent' | 'paid' | 'cancelled' | 'late';
  conditions?: string;
  late_payment_penalty?: string;
  
  // Relations
  Customer?: ICustomer;
  InvoiceItems?: IInvoiceItem[];
  Payments?: IPayment[];
  Company?: ICompany;
} 