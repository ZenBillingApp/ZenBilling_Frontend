import { Invoice } from './Invoice';

export interface Dashboard {
    numberOfUnpaidInvoices: number;
    numberOfLatePaymentInvoices: number;
    numberOfInvoicesThisMonth: number;
    numberOfClients: number;
    latestInvoices: Invoice[];
    user: {
        first_name: string;
        last_name: string;
    };
}
