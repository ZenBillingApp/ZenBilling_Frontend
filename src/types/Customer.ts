import { Invoice } from './Invoice';

export interface Customer {
    type: "individual" | "company";
    city: string;
    client_id: number;
    company_id: number;
    country: string;
    email?: string;
    first_name?: string;
    last_name?: string;
    phone?: string;
    postal_code: string;
    street_address: string;
    user_id: number;
    invoice_count?: number;
    Invoices?: Invoice[];
    siret_number?: string;
    vat_number?: string;
    siren_number?: string;
    name?: string;
}
