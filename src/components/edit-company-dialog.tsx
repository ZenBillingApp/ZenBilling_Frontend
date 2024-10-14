import React, { useEffect } from "react";
import { Company } from "@/types/Company";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Credenza,
  CredenzaContent,
  CredenzaFooter,
  CredenzaHeader,
  CredenzaTitle,
  CredenzaTrigger,
  CredenzaClose,
  CredenzaDescription,
} from "@/components/ui/credenza";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "./ui/use-toast";
import { AlertTriangle } from "lucide-react";
import { MdOutlineEdit } from "react-icons/md";
import api from "@/lib/axios";

type Props = {
  company: Company | null;
  onSave: (updatedCompany: Company) => void;
};

const CompanyEditor: React.FC<Props> = ({ company, onSave }) => {
  const { toast } = useToast();

  const [editCompany, setEditCompany] = React.useState<Company | null>(company);
  const [loading, setLoading] = React.useState<boolean>(false);
  const [open, setOpen] = React.useState<boolean>(false);
  const [error, setError] = React.useState<
    | string
    | [
        {
          msg: string;
        }
      ]
    | null
  >(null);

  const onClose = () => {
    setOpen(false);
    setError(null);
  };

  useEffect(() => {
    if (open) {
      setEditCompany(company);
    }
  }, [open, company]);

  const handleSave = async () => {
    if (editCompany) {
      setLoading(true);
      setError(null);
      try {
        const response = await api.put(`/company`, editCompany);
        onSave(response.data);
        toast({
          title: "Entreprise mise à jour",
          description:
            "Les informations de votre entreprise ont été mises à jour avec succès.",
        });
        setOpen(false);
      } catch (err: any) {
        setError(
          err.response?.data.message ||
            err.response?.data.errors ||
            "Une erreur s'est produite"
        );
        toast({
          variant: "destructive",
          title: "Erreur lors de la sauvegarde",
          description:
            err.response?.data.message ||
            err.response?.data.errors
              .map((e: { msg: string }) => e.msg)
              .join(", ") ||
            "Une erreur s'est produite",
        });
      } finally {
        setLoading(false);
      }
    } else {
      setError("Données de l'entreprise non valides");
    }
  };

  return (
    <Credenza open={open} onOpenChange={setOpen}>
      <CredenzaTrigger>
        <Button
          className="flex items-center gap-2"
          onClick={() => setOpen(true)}
        >
          <MdOutlineEdit size={20} />
          Modifier mon entreprise
        </Button>
      </CredenzaTrigger>
      <CredenzaContent className="h-[80vh] overflow-auto">
        <CredenzaHeader>
          <CredenzaTitle>
            Modifier les informations de votre entreprise
          </CredenzaTitle>
        </CredenzaHeader>
        <CredenzaDescription>
          <p>
            Les informations de votre entreprise sont utilisées pour générer des
            documents tels que les factures et les devis.
          </p>
        </CredenzaDescription>
        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="w-5 h-5" />
            <AlertTitle>
              Une erreur s&apos;est produite lors de la sauvegarde
            </AlertTitle>
            <AlertDescription>
              {typeof error === "string"
                ? error
                : error.map((e) => e.msg).join(", ")}
            </AlertDescription>
          </Alert>
        )}
        <div className="flex flex-col w-full gap-2">
          <Label>Nom de l&apos;entreprise</Label>
          <Input
            type="text"
            value={editCompany?.name || ""}
            onChange={(e) =>
              setEditCompany((prev) =>
                prev ? { ...prev, name: e.target.value } : null
              )
            }
          />
        </div>
        <div className="flex flex-col w-full gap-2">
          <Label>Secteur d&apos;activité</Label>
          <Input
            type="text"
            value={editCompany?.industry || ""}
            onChange={(e) =>
              setEditCompany((prev) =>
                prev ? { ...prev, industry: e.target.value } : null
              )
            }
          />
        </div>
        <div className="flex flex-col w-full gap-2">
          <Label>Adresse</Label>
          <Input
            type="text"
            value={editCompany?.street_address || ""}
            onChange={(e) =>
              setEditCompany((prev) =>
                prev ? { ...prev, street_address: e.target.value } : null
              )
            }
          />
        </div>
        <div className="flex gap-2">
          <div className="flex flex-col w-1/2 gap-2">
            <Label>Ville</Label>
            <Input
              type="text"
              value={editCompany?.city || ""}
              onChange={(e) =>
                setEditCompany((prev) =>
                  prev ? { ...prev, city: e.target.value } : null
                )
              }
            />
          </div>
          <div className="flex flex-col w-1/2 gap-2">
            <Label>État/Région</Label>
            <Input
              type="text"
              value={editCompany?.state || ""}
              onChange={(e) =>
                setEditCompany((prev) =>
                  prev ? { ...prev, state: e.target.value } : null
                )
              }
            />
          </div>
        </div>
        <div className="flex gap-2">
          <div className="flex flex-col w-1/2 gap-2">
            <Label>Code postal</Label>
            <Input
              type="text"
              value={editCompany?.postal_code || ""}
              onChange={(e) =>
                setEditCompany((prev) =>
                  prev ? { ...prev, postal_code: e.target.value } : null
                )
              }
            />
          </div>
          <div className="flex flex-col w-1/2 gap-2">
            <Label>Pays</Label>
            <Input
              type="text"
              value={editCompany?.country || ""}
              onChange={(e) =>
                setEditCompany((prev) =>
                  prev ? { ...prev, country: e.target.value } : null
                )
              }
            />
          </div>
        </div>
        <div className="flex flex-col w-full gap-2">
          <Label>Email</Label>
          <Input
            type="email"
            value={editCompany?.email || ""}
            onChange={(e) =>
              setEditCompany((prev) =>
                prev ? { ...prev, email: e.target.value } : null
              )
            }
          />
        </div>
        <div className="flex flex-col w-full gap-2">
          <Label>Téléphone</Label>
          <Input
            type="tel"
            value={editCompany?.phone || ""}
            onChange={(e) =>
              setEditCompany((prev) =>
                prev ? { ...prev, phone: e.target.value } : null
              )
            }
          />
        </div>
        <div className="flex flex-col w-full gap-2">
          <div className="flex flex-col gap-2">
            <Label>Numéro de TVA</Label>
            <Input
              type="text"
              value={editCompany?.vat_number || ""}
              onChange={(e) =>
                setEditCompany((prev) =>
                  prev ? { ...prev, vat_number: e.target.value } : null
                )
              }
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label>Numéro SIRET</Label>
            <Input
              type="text"
              value={editCompany?.siret_number || ""}
              onChange={(e) =>
                setEditCompany((prev) =>
                  prev ? { ...prev, siret_number: e.target.value } : null
                )
              }
            />
          </div>
        </div>
        <CredenzaFooter>
          <Button
            disabled={
              loading ||
              !editCompany?.name ||
              !editCompany?.industry ||
              !editCompany?.email ||
              !editCompany?.phone ||
              !editCompany?.street_address ||
              !editCompany?.city ||
              !editCompany?.state ||
              !editCompany?.postal_code ||
              !editCompany?.country ||
              !editCompany?.vat_number ||
              !editCompany?.siret_number
            }
            onClick={handleSave}
          >
            {loading ? "Enregistrement..." : "Enregistrer"}
          </Button>
          <CredenzaClose asChild>
            <Button variant="outline" onClick={onClose}>
              Annuler
            </Button>
          </CredenzaClose>
        </CredenzaFooter>
      </CredenzaContent>
    </Credenza>
  );
};

export default CompanyEditor;
