import React from "react";
import type { Metadata } from "next";

type Props = {
  children: React.ReactNode;
};

export const metadata: Metadata = {
  title: "Factures - ZenBilling",
  description: "Liste des factures de ZenBilling",
  keywords: "factures, paiements, gestion des factures",
  openGraph: {
    title: "Factures - ZenBilling",
    description: "Liste des factures de ZenBilling",
    type: "website",
    locale: "fr_FR",
    url: "https://zenbilling.dynamicwebforge.fr/dashboard/invoices",
    siteName: "ZenBilling",
  },
};

export default function LayoutInvoices({ children }: Props) {
  return <>{children}</>;
}
