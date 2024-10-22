import React from "react";
import Header from "@/components/header";
import type { Metadata } from "next";

type Props = {
  children: React.ReactNode;
};

export const metadata: Metadata = {
  title: "Se connecter - ZenBilling",
  description: "Connectez-vous à ZenBilling",
  keywords: "connexion, ZenBilling",
  openGraph: {
    title: "Se connecter - ZenBilling",
    description: "Connectez-vous à ZenBilling",
    url: "https://zenbilling.dynamicwebforge.fr/login",
    type: "website",
    locale: "fr_FR",
    siteName: "ZenBilling",
  },
};

export default function Layout({ children }: Props) {
  return (
    <>
      <div className="h-full w-screen flex flex-col ">
        <div className="w-full min-h-screen dark:bg-black bg-white dark:bg-grid-small-white/[0.2] bg-grid-small-black/[0.2] relative flex flex-col items-center justify-center">
          <Header />
          <div className="flex items-center justify-center flex-1 w-full z-10">
            {children}
          </div>
        </div>
      </div>
    </>
  );
}
