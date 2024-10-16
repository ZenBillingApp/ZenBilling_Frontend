import React from "react";
import type { Metadata } from "next";

type Props = {
  children: React.ReactNode;
};

export const metadata: Metadata = {
  title: "Clients - ZenBilling",
  description: "Gestion des clients sur ZenBilling",
  keywords: "clients, gestion, ZenBilling",
  openGraph: {
    title: "Clients - ZenBilling",
    description: "Gestion des clients sur ZenBilling",
    type: "website",
    locale: "fr_FR",
    url: "https://zenbilling.dynamicwebforge.fr/dashboard/customers",
    siteName: "ZenBilling",
  },
};

export default function layoutCustomers({ children }: Props) {
  return <>{children}</>;
}
