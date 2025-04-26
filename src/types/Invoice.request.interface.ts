import { VatRate } from './Product.interface';
import { InvoiceStatus } from './Invoice.interface';
import { PaymentMethod } from './Payment.interface';

export interface IInvoiceQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: InvoiceStatus;
  customer_id?: string;
  start_date?: string;
  end_date?: string;
  min_amount?: number;
  max_amount?: number;
  sortBy?: 'invoice_date' | 'due_date' | 'amount_including_tax' | 'status' | 'invoice_number';
  sortOrder?: 'ASC' | 'DESC';
}

export interface IInvoiceItem {
  product_id?: string;
  name?: string;
  description?: string;
  quantity: number;
  unit_price_excluding_tax: number;
  vat_rate: VatRate;
  save_as_product?: boolean;
}

export interface ICreateInvoiceRequest {
  customer_id: string;
  invoice_date: Date;
  due_date: Date;
  items: IInvoiceItem[];
  conditions?: string;
  late_payment_penalty?: string;
}

export interface IUpdateInvoiceRequest {
  invoice_date?: Date;
  due_date?: Date;
  status?: InvoiceStatus;
  conditions?: string;
  late_payment_penalty?: string;
}

export interface ICreatePaymentRequest {
  payment_date: Date;
  amount: number;
  payment_method: PaymentMethod;
  description?: string;
  reference?: string;
} 
