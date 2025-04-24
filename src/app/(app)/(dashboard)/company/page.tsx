import { CompanyDetails } from "@/components/company-details";

export default function CompanyPage() {
  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6">Informations de l&apos;entreprise</h1>
      <CompanyDetails />
    </div>
  );
} 