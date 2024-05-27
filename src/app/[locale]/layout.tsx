import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/toaster";

import initTranslations from "../i18n";
import TranslationsProvider from "@/components/TranslationsProvider";

import "../globals.css";
import { cn } from "@/lib/utils";

const inter = Inter({ subsets: ["latin"] });

const i18nNamespaces = ["common", "dashboard", "invoices"];

export const metadata: Metadata = {
  title: "ZenBiling",
  description:
    "ZenBilling is a simple billing system that allows you to create and manage invoices",
};

type RootLayoutProps = {
  children: React.ReactNode;
  params: {
    locale: string;
  };
};

export default async function RootLayout({
  children,
  params: { locale },
}: RootLayoutProps) {
  const { t, resources } = await initTranslations(locale, i18nNamespaces);

  return (
    <>
      <html lang="en" suppressHydrationWarning>
        <body className={cn("h-full", "debug-screens", inter.className)}>
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
    </>
  );
}
