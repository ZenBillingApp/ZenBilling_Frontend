import { useFormatter } from "next-intl";

interface FormatPercentOptions {
    minimumFractionDigits?: number;
    maximumFractionDigits?: number;
}

export default function useFormattedPercent() {
    const formatter = useFormatter();

    const formatPercent = (
        percent: number,
        options: FormatPercentOptions = {}
    ): string => {
        return formatter.number(percent, {
            style: "percent",
            minimumFractionDigits: options.minimumFractionDigits ?? 2,
            maximumFractionDigits: options.maximumFractionDigits ?? 2,
        });
    };

    return { formatPercent };
}
