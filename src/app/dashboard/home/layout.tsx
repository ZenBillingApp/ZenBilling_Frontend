import React from "react";
import type { Metadata } from "next";

type Props = {
  children: React.ReactNode;
};

export const metadata: Metadata = {
  title: "Tableau de bord - ZenBilling",
  description:
    "Tableau de bord de ZenBilling pour la gestion des factures et des clients.",
  keywords: "dashboard, invoices, payments, clients, gestion des factures",
  openGraph: {
    title: "Tableau de bord - ZenBilling",
    description:
      "Tableau de bord de ZenBilling pour la gestion des factures et des clients.",
    type: "website",
    locale: "fr_FR",
    url: "https://zenbilling.dynamicwebforge.fr/dashboard/home",
    siteName: "ZenBilling",
  },
};

export default function LayoutHome({ children }: Props) {
  return <>{children}</>;
}
