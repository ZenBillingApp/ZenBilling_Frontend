import { ICustomer } from './Customer.interface';
import { IInvoiceItem } from './InvoiceItem.interface';
import { IPayment } from './Payment.interface';

export interface IInvoice {
  invoice_id?: number;
  customer_id: number | null;
  user_id: number;
  company_id: number | null;
  invoice_number: string;
  invoice_date: Date;
  due_date: Date;
  amount_excluding_tax: number;
  tax: number;
  amount_including_tax: number;
  status: 'pending' | 'paid' | 'cancelled';
  conditions?: string;
  late_payment_penalty?: string;
  
  // Relations
  Customer?: ICustomer;
  InvoiceItems?: IInvoiceItem[];
  Payments?: IPayment[];
} 