export interface Dashboard {
    numberOfUnpaidInvoices: number;
    numberOfLatePaymentInvoices: number;
    numberOfInvoicesThisMonth: number;
    numberOfClients: number;
    latestInvoices: Array<{
        client: {
            first_name: string;
            last_name: string;
        };
        invoice_id: number;
        client_id: number;
        user_id: number;
        company_id: number;
        invoice_date: string;
        due_date: string;
        total_amount: number;
        status: string;
    }>;
    user: {
        first_name: string;
        last_name: string;
    };
}
