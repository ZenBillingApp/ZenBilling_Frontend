import { Item } from "./Item";
import { Company } from "./Company";
import { Customer } from "./Customer";
export interface Invoice {
    invoice_id: number;
    invoice_date: Date;
    Company:  Company;
    invoice_number: string;
    Client: Customer;
    InvoiceItems: Item[];
    status: string;
    total_amount: number;
    due_date: Date;
    client_id: number;
    Payments: {
        payment_method: "cash" | "credit_card" | "bank_transfer";
        amount: number;
        payment_date: Date;
    };
}
