import { Company } from "./Company";
export interface User {
    first_name: string;
    last_name: string;
    email: string;
    is_freelancer: boolean;
    password: string;
    street_address: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
    phone: string;
    company: Company;
}
