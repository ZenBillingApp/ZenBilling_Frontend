export interface IPayment {
  payment_id?: number;
  invoice_id: number;
  payment_date: Date;
  amount: number;
  payment_method: 'cash' | 'credit_card' | 'bank_transfer';
} 