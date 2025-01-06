import { Metadata } from "next"

export const metadata: Metadata = {
    title: "Gestion des Factures | ZenBilling",
    description: "Gérez vos factures en toute simplicité. Créez, modifiez et suivez vos factures en temps réel avec ZenBilling.",
    openGraph: {
        title: "Gestion des Factures | ZenBilling",
        description: "Gérez vos factures en toute simplicité. Créez, modifiez et suivez vos factures en temps réel avec ZenBilling.",
    },
};

export default function InvoicesLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return children;
} 