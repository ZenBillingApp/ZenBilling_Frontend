import type { Metadata } from "next";
import { DM_Sans,Roboto } from "next/font/google";
import "./globals.css";
import { QueryProvider } from "@/providers/QueryProvider";
import { NiceModalProvider } from "@/providers/NiceModalProvider";
import { ThemeProvider } from "@/components/theme-provider"




const dmSans = DM_Sans({
  weight: ["400", "500", "700"],
  style: ["normal", "italic"],
  variable: "--font-dm-sans",
  subsets: ["latin"],
});

const roboto = Roboto({
  weight: ["400", "500", "700"],
  style: ["normal", "italic"],
  variable: "--font-roboto",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ZenBilling - Gestion de Facturation Simplifiée",
  description: "Gérez facilement vos factures, clients et produits avec ZenBilling. Une solution complète de facturation pour les professionnels et entreprises.",
  keywords: ["facturation", "gestion", "entreprise", "comptabilité", "factures", "clients", "produits"],
  authors: [{ name: "ZenBilling" }],
  creator: "ZenBilling",
  publisher: "ZenBilling",
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: "website",
    locale: "fr_FR",
    title: "ZenBilling - Gestion de Facturation Simplifiée",
    description: "Gérez facilement vos factures, clients et produits avec ZenBilling. Une solution complète de facturation pour les professionnels et entreprises.",
    siteName: "ZenBilling",
  },
  twitter: {
    card: "summary_large_image",
    title: "ZenBilling - Gestion de Facturation Simplifiée",
    description: "Gérez facilement vos factures, clients et produits avec ZenBilling. Une solution complète de facturation pour les professionnels et entreprises.",
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
  },
  themeColor: "#ffffff",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${dmSans.variable} ${roboto.variable} antialiased`}>
      <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
          <QueryProvider>
            <NiceModalProvider>{children}</NiceModalProvider>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
