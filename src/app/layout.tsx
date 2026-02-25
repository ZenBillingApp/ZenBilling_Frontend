import type { Metadata } from "next";
import { DM_Sans,Roboto,Arimo } from "next/font/google";
import "./globals.css";
import { QueryProvider } from "@/providers/QueryProvider";
import { NiceModalProvider } from "@/providers/NiceModalProvider";
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { SkipLink } from "@/components/ui/skip-link"
import { AccessibilityAnnouncer } from "@/components/ui/announcer"


const arimo = Arimo({
  weight: ["400", "500", "700"],
  style: ["normal", "italic"],
  variable: "--font-arimo",
  subsets: ["latin"],
});


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
  icons: {
    icon: "/favicon.png",
  },
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
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.png" type="image/png" sizes="32x32" />
        <script defer src="https://cloud.umami.is/script.js" data-website-id="593cad2b-493c-48ad-acd4-4fbdc5aebe54"></script>
      </head>
      <body suppressHydrationWarning className={`${dmSans.variable} ${roboto.variable} ${arimo.variable} antialiased`}>
      <SkipLink />
      <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
          <AccessibilityAnnouncer>
            <QueryProvider>
              <NiceModalProvider>{children}</NiceModalProvider>
              <Toaster />
            </QueryProvider>
          </AccessibilityAnnouncer>
        </ThemeProvider>
      </body>
    </html>
  );
}
