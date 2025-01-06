import { Metadata } from "next"

export const metadata: Metadata = {
    title: "Gestion des Produits | ZenBilling",
    description: "Gérez votre catalogue de produits et services. Créez et modifiez vos produits facilement avec ZenBilling.",
    openGraph: {
        title: "Gestion des Produits | ZenBilling",
        description: "Gérez votre catalogue de produits et services. Créez et modifiez vos produits facilement avec ZenBilling.",
    },
};

export default function ProductsLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return children;
} 