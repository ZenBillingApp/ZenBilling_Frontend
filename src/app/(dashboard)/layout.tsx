import AdminPanelLayout from "@/components/admin-panel/admin-panel-layout";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tableau de bord - ZenBilling",
  description: "Tableau de bord de ZenBilling",
  keywords: "tableau de bord, ZenBilling",
  openGraph: {
    title: "Tableau de bord - ZenBilling",
    description: "Tableau de bord de ZenBilling",
    url: "https://zenbilling.dynamicwebforge.fr/dashboard",
    type: "website",
    locale: "fr_FR",
    siteName: "ZenBilling",
  },
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminPanelLayout>{children}</AdminPanelLayout>;
}
