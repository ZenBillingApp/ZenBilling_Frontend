import { InvoiceStatus } from "@/types/Invoice.interface";

export const getInvoiceStatusBadgeVariant = (status: InvoiceStatus) => {
    switch (status) {
      case "paid":
        return "default";
      case "pending":
        return "secondary";
      case "sent":
        return "secondary";
      case "late":
        return "destructive";
      case "cancelled":
        return "destructive";
      default:
        return "secondary";
    }
  };

export const getInvoiceStatusLabel = (status: InvoiceStatus) => {
    switch (status) {
      case "pending":
        return "En attente";
      case "sent":
        return "Envoyée";
      case "paid":
        return "Payée";
      case "late":
        return "En retard";
      case "cancelled":
        return "Annulée";
      default:
        return status;
    }
  };