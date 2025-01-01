import { IBusinessCustomer } from './BusinessCustomer.interface';
import { IIndividualCustomer } from './IndividualCustomer.interface';

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
  BusinessCustomer?: IBusinessCustomer;
  IndividualCustomer?: IIndividualCustomer;
} 

