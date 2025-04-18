import { Metadata } from "next"

export const metadata: Metadata = {
    title: "Gestion des Clients | ZenBilling",
    description: "Gérez votre portefeuille clients efficacement. Suivez et organisez vos relations clients avec ZenBilling.",
    openGraph: {
        title: "Gestion des Clients | ZenBilling",
        description: "Gérez votre portefeuille clients efficacement. Suivez et organisez vos relations clients avec ZenBilling.",
    },
};

export default function CustomersLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return children;
} 