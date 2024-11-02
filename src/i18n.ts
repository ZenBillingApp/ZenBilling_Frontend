import { getRequestConfig } from "next-intl/server";
import { getUserLocale } from "@/hooks/locale";

const locales = ["en", "fr"];

export default getRequestConfig(async () => {
    // Provide a static locale, fetch a user setting,
    // read from `cookies()`, `headers()`, etc.

    const locale = await getUserLocale();

    return {
        locale,
        messages: (await import(`../public/locales/${locale.toLowerCase()}.json`))
            .default,
    };
});
