export type Locale = (typeof locales)[number];
import { CountryCode } from "libphonenumber-js";

export const locales = ["US", "FR"] as CountryCode[];
export const defaultLocale: Locale = "US" as CountryCode;
