import { QuoteStatus } from "@/types/Quote.interface";

export const getQuoteStatusBadgeVariant = (status: QuoteStatus) => {
    switch (status) {
      case "accepted":
        return "default";
      case "sent":
        return "secondary";
      case "draft":
        return "outline";
      case "rejected":
        return "destructive";
      case "expired":
        return "destructive";
      default:
        return "secondary";
    }
  };

export const getQuoteStatusLabel = (status: QuoteStatus) => {
    switch (status) {
      case "draft":
        return "Brouillon";
      case "sent":
        return "Envoyé";
      case "accepted":
        return "Accepté";
      case "rejected":
        return "Refusé";
      case "expired":
        return "Expiré";
      default:
        return status;
    }
  };