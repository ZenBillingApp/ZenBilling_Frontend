// hooks/useFormattedAmount.ts
import { useFormatter } from "next-intl";

interface FormatAmountOptions {
    currency?: string;
    minimumFractionDigits?: number;
    maximumFractionDigits?: number;
}

export default function useFormattedAmount() {
    const formatter = useFormatter();

    const formatAmount = (
        amount: number,
        options: FormatAmountOptions = {}
    ): string => {
        return formatter.number(amount, {
            style: "currency",
            currency: options.currency || "EUR",
            minimumFractionDigits: options.minimumFractionDigits ?? 2,
            maximumFractionDigits: options.maximumFractionDigits ?? 2,
        });
    };

    return { formatAmount };
}
