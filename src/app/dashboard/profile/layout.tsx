import React from "react";
import type { Metadata } from "next";

type Props = {
  children: React.ReactNode;
};

export const metadata: Metadata = {
  title: "Profil - ZenBilling",
  description: "Mon profil",
  keywords: "profil, ZenBilling",
  openGraph: {
    title: "Profil - ZenBilling",
    description: "Mon profil",
    type: "website",
    locale: "fr_FR",
    url: "https://zenbilling.dynamicwebforge.fr/dashboard/profile",
    siteName: "ZenBilling",
  },
};

export default function layoutProfile({ children }: Props) {
  return <>{children}</>;
}
