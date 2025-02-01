export interface IPayment {
  payment_id?: string;
  invoice_id: string;
  payment_date: Date;
  amount: number;
  payment_method: 'cash' | 'credit_card' | 'bank_transfer';
  description?: string;
  reference?: string;
} 