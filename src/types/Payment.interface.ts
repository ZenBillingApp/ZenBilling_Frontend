export type PaymentMethod = 'cash' | 'credit_card' | 'bank_transfer';

export interface IPayment {
  payment_id?: string;
  invoice_id: string;
  payment_date: Date;
  amount: number;
  payment_method: PaymentMethod;
  description?: string;
  reference?: string;
  createdAt: Date;
  updatedAt: Date;
} 