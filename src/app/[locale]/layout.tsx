// File path: /app/layout.tsx

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ThemeProvider } from "next-themes";

import initTranslations from "../i18n";

import TranslationsProvider from "@/components/TranslationsProvider";
import { Toaster } from "@/components/ui/toaster";

import { cn } from "@/lib/utils";

import "../globals.css";

// Initialize the Inter font
const inter = Inter({ subsets: ["latin"] });

// Define the namespaces for i18n
const i18nNamespaces = ["common", "dashboard", "invoices"];

// Metadata for the application
export const metadata: Metadata = {
    title: "ZenBilling",
    description:
        "ZenBilling is a simple billing system that allows you to create and manage invoices",
};

// Define the props for the RootLayout component
type RootLayoutProps = {
    children: React.ReactNode;
    params: {
        locale: string;
    };
};

// The main RootLayout component
export default async function RootLayout({
    children,
    params: { locale },
}: RootLayoutProps) {
    // Initialize translations for the given locale
    const { resources } = await initTranslations(locale, i18nNamespaces);

    return (
        <html lang="en" suppressHydrationWarning>
            <body
                className={cn(
                    "font-SpaceGrotesk",
                    process.env.NODE_ENV === "production"
                        ? null
                        : "debug-screens",
                    inter.className
                )}
            >
                <ThemeProvider
                    attribute="class"
                    defaultTheme="system"
                    enableSystem
                    disableTransitionOnChange
                >
                    <TranslationsProvider
                        namespaces={i18nNamespaces}
                        locale={locale}
                        resources={resources}
                    >
                        {children}
                        <Toaster />
                    </TranslationsProvider>
                </ThemeProvider>
            </body>
        </html>
    );
}
