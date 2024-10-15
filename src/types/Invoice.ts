import { Item } from "./Item";
export interface Invoice {
    invoice_id: number;
    invoice_date: Date;
    Company: {
        name: string;
        street_address: string;
        city: string;
        state: string;
        postal_code: string;
        country: string;
        phone: string;
        email: string;
        vat_number: string;
    };
    Client: {
        client_id: number;
        first_name: string;
        last_name: string;
        email: string;
        phone: string;
        street_address: string;
        state: string;
        country: string;
        city: string;
        postal_code: string;
    };
    InvoiceItems: Item[];
    status: string;
    total_amount: number;
    due_date: Date;
    Payments: {
        payment_method: "cash" | "credit_card" | "bank_transfer";
        amount: number;
        payment_date: Date;
    };
}
