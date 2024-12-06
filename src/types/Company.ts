export interface Company {
    id?: number;
    name: string;
    street_address: string;
    city: string;
    postal_code: string;
    country: string;
    phone: string;
    email: string;
    vat_number: string;
    siret_number: string;
    siren_number: string;
    category: string;
    activity: string;
    date_creation?: Date;
    date_mise_a_jour?: String;
    nature_juridique?: string;
    created_at?: string;
    updated_at?: string;

}
