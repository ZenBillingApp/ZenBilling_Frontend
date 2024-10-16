import React from "react";
import type { Metadata } from "next";

type Props = {
  children: React.ReactNode;
};

export const metadata: Metadata = {
  title: "Client - ZenBilling",
  description: "Détails du client dans ZenBilling",
  keywords: "client, détails, ZenBilling",
  openGraph: {
    title: "Client - ZenBilling",
    description: "Détails du client dans ZenBilling",
    type: "website",
    locale: "fr_FR",
    url: "https://zenbilling.dynamicwebforge.fr/dashboard/customers/[id]",
    siteName: "ZenBilling",
  },
};

export default function layoutDetailsCustomer({ children }: Props) {
  return <>{children}</>;
}
