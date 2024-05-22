export interface Customer {
    city: string;
    client_id: number;
    company_id: number;
    country: string;
    email: string;
    first_name: string;
    last_name: string;
    phone: string;
    postal_code: string;
    state: string;
    street_address: string;
    user_id: number;
    invoice_count: number;
    invoices: Array<{
        invoice_id: number;
        invoice_date: string;
        due_date: string;
        total_amount: number;
        status: string;
    }>;
}
