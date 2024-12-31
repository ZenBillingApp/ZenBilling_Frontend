export interface ICustomer {
  customer_id: number;
  user_id: number;
  company_id: number;
  type: 'individual' | 'company';
  email: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  postal_code: string | null;
  country: string;
  createdAt: Date;
  updatedAt: Date;
} 