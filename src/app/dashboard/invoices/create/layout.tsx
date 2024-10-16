import React from "react";
import type { Metadata } from "next";

type Props = {
  children: React.ReactNode;
};

export const metadata: Metadata = {
  title: "Créer une facture - ZenBilling",
  description: "Créer une facture sur ZenBilling",
  keywords: "facture, créer, client, articles, montant",
  openGraph: {
    title: "Créer une facture - ZenBilling",
    description: "Créer une facture sur ZenBilling",
    type: "website",
    locale: "fr_FR",
    url: "https://zenbilling.dynamicwebforge.fr/dashboard/invoices/create",
    siteName: "ZenBilling",
  },
};

export default function layoutCreateInvoice({ children }: Props) {
  return <>{children}</>;
}
