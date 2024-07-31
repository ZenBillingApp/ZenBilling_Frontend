// hooks/useFormattedDate.ts
import { useFormatter } from "next-intl";

interface FormatDateOptions {
    dateStyle?: "full" | "long" | "medium" | "short";
    timeStyle?: "full" | "long" | "medium" | "short";
    timeZone?: string;
}

export default function useFormattedDate() {
    const formatter = useFormatter();

    const formatDate = (
        date: Date | number,
        options: FormatDateOptions = {}
    ): string => {
        // Default options for European format (e.g., day/month/year)
        const defaultOptions = {
            dateStyle: options.dateStyle || "short", // 'short' typically gives day/month/year format
            timeStyle: options.timeStyle,
            timeZone: options.timeZone,
        };

        return formatter.dateTime(date, defaultOptions);
    };

    return { formatDate };
}
