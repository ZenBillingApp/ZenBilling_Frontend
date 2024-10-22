// File path: /app/layout.tsx

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ThemeProvider } from "next-themes";

import { Toaster } from "@/components/ui/toaster";

import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";

import { cn } from "@/lib/utils";

import "./globals.css";

// Initialize the Inter font
const inter = Inter({ subsets: ["latin"] });

// Define the namespaces for i18n
const i18nNamespaces = ["common", "dashboard", "invoices"];

// Metadata for the application
export const metadata: Metadata = {
  title: "ZenBilling",
  description: "ZenBilling est un gestionnaire de factures simple et efficace.",
  keywords:
    "factures, gestion, ZenBilling, entreprise, comptabilité, gestionnaire, facturation, devis, paiement, clients, produits, services, TVA, taxes,gratuit, open-source, Zen Billing",
  openGraph: {
    title: "ZenBilling",
    description:
      "ZenBilling est un gestionnaire de factures simple et efficace.",
    url: "https://zenbilling.dynamicwebforge.fr",
    type: "website",
    locale: "fr_FR",
    siteName: "ZenBilling",
  },
};

// Define the props for the RootLayout component
type RootLayoutProps = {
  children: React.ReactNode;
};

// The main RootLayout component
export default async function RootLayout({ children }: RootLayoutProps) {
  const locale = await getLocale();

  // Providing all messages to the client
  // side is the easiest way to get started
  const messages = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning>
      <body
        className={cn(
          process.env.NODE_ENV === "production" ? null : "debug-screens",
          inter.className
        )}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <NextIntlClientProvider messages={messages}>
            <div vaul-drawer-wrapper="" className="bg-background">
              {children}
            </div>
          </NextIntlClientProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
