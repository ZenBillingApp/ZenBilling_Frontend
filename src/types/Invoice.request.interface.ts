export type InvoiceStatus = 'pending' | 'paid' | 'cancelled';
export type PaymentMethod = 'cash' | 'credit_card' | 'bank_transfer';

export interface IInvoiceItem {
  product_id?: number;
  name?: string;
  description?: string;
  quantity: number;
  unit_price_excluding_tax: number;
  vat_rate: number;
  save_as_product?: boolean;
}

export interface ICreateInvoiceRequest {
  customer_id: number;
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
} 

export interface IInvoiceQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: InvoiceStatus;
  customer_id?: number;
  start_date?: string;
  end_date?: string;
  min_amount?: number;
  max_amount?: number;
  sortBy?: 'invoice_date' | 'due_date' | 'amount_including_tax' | 'status' | 'invoice_number';
  sortOrder?: 'ASC' | 'DESC';
}