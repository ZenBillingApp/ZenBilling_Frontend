import React from "react";
import type { Metadata } from "next";

type Props = {
  children: React.ReactNode;
};

export const metadata: Metadata = {
  title: "Mon entreprise - ZenBilling",
  description: "Informations sur mon entreprise",
  keywords: "entreprise, ZenBilling",
  openGraph: {
    title: "Mon entreprise - ZenBilling",
    description: "Informations sur mon entreprise",
    type: "website",
    locale: "fr_FR",
    url: "https://zenbilling.dynamicwebforge.fr/dashboard/my-company",
    siteName: "ZenBilling",
  },
};

export default function layoutCompany({ children }: Props) {
  return <>{children}</>;
}
