import React from "react";
import type { Metadata } from "next";

type Props = {
  children: React.ReactNode;
};

export const metadata: Metadata = {
  title: "Facture - ZenBilling",
  description: "Détails de la facture sur ZenBilling",
  keywords: "facture, détails, ZenBilling",
  openGraph: {
    title: "Facture - ZenBilling",
    description: "Détails de la facture sur ZenBilling",
    type: "website",
    locale: "fr_FR",
    url: "https://zenbilling.dynamicwebforge.fr/dashboard/invoices/[id]",
    siteName: "ZenBilling",
  },
};

export default function layoutInvoiceDetails({ children }: Props) {
  return <>{children}</>;
}
