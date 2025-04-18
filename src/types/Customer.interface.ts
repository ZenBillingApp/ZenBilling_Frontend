import { IBusinessCustomer } from './BusinessCustomer.interface';
import { IIndividualCustomer } from './IndividualCustomer.interface';
import { IPagination } from './pagination.interface';


export interface ICustomer {
  customer_id?: string;
  user_id: string;
  company_id: string;
  type: 'individual' | 'company';
  email: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  postal_code: string | null;
  country: string;
  created_at: string;
  updated_at: string;
  business?: IBusinessCustomer;
  individual?: IIndividualCustomer;
} 

export interface ICustomerPagination {
  customers: ICustomer[];
  pagination: IPagination;
}


