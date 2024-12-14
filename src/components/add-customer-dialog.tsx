import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useDebounce } from "@/hooks/use-debounce";
import { Customer } from "@/types/Customer";

import { useToast } from "./ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Credenza,
  CredenzaContent,
  CredenzaTrigger,
  CredenzaHeader,
  CredenzaTitle,
  CredenzaDescription,
  CredenzaFooter,
  CredenzaClose,
  CredenzaBody,
} from "@/components/ui/credenza";
import { FormPhoneInput } from "@/components/ui/phone-input";
import { ScrollArea } from "./ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

import {
  BuildingIcon,
  SearchIcon,
  Loader2Icon,
  RefreshCwIcon,
  XCircleIcon,
  User2Icon,
  MapPinIcon,
  PhoneIcon,
  MailIcon,
  Building2Icon,
} from "lucide-react";

import api from "@/lib/axios";

interface CompanySearchResult {
  siren: string;
  nom_complet: string;
  siege: {
    siret: string;
    libelle_voie?: string;
    code_postal?: string;
    libelle_commune?: string;
    numero_voie?: string;
    type_voie?: string;
  };
}

type Props = {
  trigger: React.ReactNode;
  onSave: (newCustomer: Customer) => void;
};

export default function AddCustomerDialog({ trigger, onSave }: Props) {
  const { toast } = useToast();
  const [open, setOpen] = React.useState<boolean>(false);
  const [loading, setLoading] = React.useState<boolean>(false);
  const [isSearching, setIsSearching] = React.useState(false);
  const [inputValue, setInputValue] = React.useState("");
  const [searchResults, setSearchResults] = React.useState<
    CompanySearchResult[]
  >([]);
  const searchInputRef = React.useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    setValue,
    formState: { errors, isDirty },
    clearErrors,
  } = useForm<Customer>({
    defaultValues: {
      type: "individual",
      country: "France",
      email: undefined,
      phone: undefined,
    },
    mode: "onChange",
  });

  const customerType = watch("type");
  const isCompany = customerType === "company";
  const debouncedSearch = useDebounce(inputValue, 300);

  const searchCompanies = React.useCallback(
    async (search: string) => {
      if (!search || search.length < 3) {
        setSearchResults([]);
        setIsSearching(false);
        return;
      }

      try {
        setIsSearching(true);
        const response = await api.get(`/company/search/${search}`);
        setSearchResults(response.data.results || []);
      } catch (error) {
        console.error("Erreur lors de la recherche:", error);
        toast({
          title: "Erreur de recherche",
          description: "Impossible de rechercher l'entreprise",
          variant: "destructive",
        });
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    },
    [toast]
  );

  const handleCompanySelect = async (companyData: CompanySearchResult) => {
    try {
      const siren = companyData.siren;
      const tvaNumber = `FR${(12 + 3 * (Number(siren) % 97)) % 97}${siren}`;

      setValue("name", companyData.nom_complet, { shouldDirty: true });
      setValue(
        "street_address",
        `${companyData.siege.numero_voie || ""} ${
          companyData.siege.type_voie || ""
        } ${companyData.siege.libelle_voie || ""}`.trim(),
        { shouldDirty: true }
      );
      setValue("city", companyData.siege.libelle_commune || "", {
        shouldDirty: true,
      });
      setValue("postal_code", companyData.siege.code_postal || "", {
        shouldDirty: true,
      });
      setValue("country", "France", { shouldDirty: true });
      setValue("siren_number", companyData.siren, { shouldDirty: true });
      setValue("siret_number", companyData.siege.siret, { shouldDirty: true });
      setValue("vat_number", tvaNumber, { shouldDirty: true });

      clearErrors();
      setInputValue("");
      setSearchResults([]);

      toast({
        title: "Entreprise sélectionnée",
        description: "Les informations ont été pré-remplies",
      });
    } catch (error) {
      console.error("Erreur lors de la sélection:", error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les détails de l'entreprise",
        variant: "destructive",
      });
    }
  };

  const handleReset = () => {
    reset({
      type: "individual",
      country: "France",
      email: "",
      phone: "",
      first_name: "",
      last_name: "",
      street_address: "",
      postal_code: "",
      city: "",
      name: "",
      siret_number: "",
      siren_number: "",
      vat_number: "",
    });
    setInputValue("");
    setSearchResults([]);
    clearErrors();
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };

  const handleOnAdd = async (data: Customer) => {
    try {
      setLoading(true);

      // Filtrer les champs vides
      const formData = Object.entries(data).reduce((acc, [key, value]) => {
        if (value !== "" && value !== null && value !== undefined) {
          acc[key as keyof Customer] = value;
        }
        return acc;
      }, {} as Partial<Customer>);

      const response = await api.post("/customers", formData);
      onSave(response.data);
      toast({
        title: "Client ajouté",
        description: "Le client a été ajouté avec succès",
      });
      setOpen(false);
    } catch (err: any) {
      const description = "Une erreur est survenue lors de l'ajout du client";
      toast({
        variant: "destructive",
        title: "Erreur",
        description,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!open) {
      reset({
        type: "individual",
        country: "France",
        email: "",
        phone: "",
        first_name: "",
        last_name: "",
        street_address: "",
        postal_code: "",
        city: "",
        name: "",
        siret_number: "",
        siren_number: "",
        vat_number: "",
      });
      setInputValue("");
      setSearchResults([]);
      clearErrors();
    }
  }, [open, reset, clearErrors]);

  useEffect(() => {
    if (searchInputRef.current && isCompany) {
      searchInputRef.current.focus();
    }
  }, [isCompany]);

  useEffect(() => {
    searchCompanies(debouncedSearch);
  }, [debouncedSearch, searchCompanies]);

  return (
    <Credenza open={open} onOpenChange={setOpen}>
      <CredenzaTrigger>{trigger}</CredenzaTrigger>
      <CredenzaContent className="max-w-3xl">
        <ScrollArea className="flex w-full max-h-[80vh] overflow-y-auto">
          <form onSubmit={handleSubmit(handleOnAdd)}>
            <div className="flex flex-col w-full p-6 gap-6">
              <CredenzaHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full bg-primary/10">
                      {isCompany ? (
                        <Building2Icon className="w-6 h-6 text-primary" />
                      ) : (
                        <User2Icon className="w-6 h-6 text-primary" />
                      )}
                    </div>
                    <div className="flex flex-col gap-1">
                      <CredenzaTitle>Ajouter un client</CredenzaTitle>
                      <CredenzaDescription>
                        {isCompany
                          ? "Nouvel entreprise"
                          : "Nouveau particulier"}
                      </CredenzaDescription>
                    </div>
                  </div>
                  {isDirty && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={handleReset}
                      className="h-8"
                    >
                      <RefreshCwIcon className="w-4 h-4 mr-2" />
                      Réinitialiser
                    </Button>
                  )}
                </div>
              </CredenzaHeader>

              <div className="flex flex-col gap-2">
                <Label className="text-sm font-medium">Type de client</Label>
                <Select
                  {...register("type")}
                  onValueChange={(value) => {
                    reset({
                      type: value as Customer["type"],
                      country: "France",
                    });
                    setInputValue("");
                    setSearchResults([]);
                  }}
                  defaultValue="individual"
                >
                  <SelectTrigger className="w-full md:w-[260px]">
                    <SelectValue placeholder="Sélectionnez le type de client" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="individual">
                      <div className="flex items-center gap-2">
                        <User2Icon className="w-4 h-4" />
                        <span>Particulier</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="company">
                      <div className="flex items-center gap-2">
                        <BuildingIcon className="w-4 h-4" />
                        <span>Entreprise</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              <CredenzaBody className="flex flex-col space-y-6 p-0">
                {isCompany && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <SearchIcon className="w-4 h-4 text-muted-foreground" />
                      <h3 className="font-medium">
                        Recherche d&apos;entreprise
                      </h3>
                    </div>
                    <div className="relative">
                      <Input
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder="Rechercher par nom ou SIRET..."
                        className="w-full pr-20"
                      />
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                        {inputValue && (
                          <button
                            type="button"
                            onClick={() => setInputValue("")}
                            className="text-muted-foreground hover:text-foreground"
                          >
                            <XCircleIcon className="w-4 h-4" />
                          </button>
                        )}
                        {isSearching ? (
                          <Loader2Icon className="h-4 w-4 animate-spin" />
                        ) : (
                          <SearchIcon className="h-4 w-4 opacity-50" />
                        )}
                      </div>

                      {inputValue.length > 2 && (
                        <Card className="absolute top-full left-0 right-0 z-50 mt-1 border-border/50">
                          <CardContent className="p-0">
                            <ScrollArea className="max-h-[300px]">
                              {searchResults.length === 0 ? (
                                <div className="p-4 text-center text-sm text-muted-foreground">
                                  {isSearching ? (
                                    <div className="flex items-center justify-center gap-2">
                                      <Loader2Icon className="w-4 h-4 animate-spin" />
                                      <span>Recherche en cours...</span>
                                    </div>
                                  ) : (
                                    "Aucune entreprise trouvée"
                                  )}
                                </div>
                              ) : (
                                <div className="p-2">
                                  {searchResults.map((result) => (
                                    <button
                                      key={result.siren}
                                      type="button"
                                      onClick={() =>
                                        handleCompanySelect(result)
                                      }
                                      className="flex w-full flex-col gap-2 rounded-lg p-3 text-left transition-colors hover:bg-accent"
                                    >
                                      <div className="flex items-center gap-2">
                                        <BuildingIcon className="h-4 w-4 shrink-0 text-primary" />
                                        <span className="font-medium">
                                          {result.nom_complet}
                                        </span>
                                      </div>
                                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <MapPinIcon className="w-3 h-3 shrink-0" />
                                        <span>
                                          {[
                                            result.siege.libelle_voie,
                                            result.siege.code_postal,
                                            result.siege.libelle_commune,
                                          ]
                                            .filter(Boolean)
                                            .join(", ")}
                                        </span>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <Badge
                                          variant="outline"
                                          className="text-xs"
                                        >
                                          SIRET: {result.siege.siret}
                                        </Badge>
                                      </div>
                                    </button>
                                  ))}
                                </div>
                              )}
                            </ScrollArea>
                          </CardContent>
                        </Card>
                      )}
                    </div>
                  </div>
                )}

                <div className="space-y-6">
                  <div className="flex items-center gap-2">
                    <User2Icon className="w-4 h-4 text-muted-foreground" />
                    <h3 className="font-medium">Informations principales</h3>
                  </div>

                  {isCompany ? (
                    <div className="grid gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Nom de l&apos;entreprise</Label>
                        <Input
                          {...register("name", {
                            required: "Nom de l'entreprise requis",
                          })}
                          type="text"
                          placeholder="Nom de l'entreprise"
                        />
                        {errors.name?.message && (
                          <p className="text-xs text-destructive">
                            {errors.name.message}
                          </p>
                        )}
                      </div>

                      <div className="grid gap-4 sm:grid-cols-3">
                        <div className="space-y-2">
                          <Label htmlFor="siret_number">SIRET</Label>
                          <Input
                            {...register("siret_number")}
                            placeholder="123 456 789 00012"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="siren_number">SIREN</Label>
                          <Input
                            {...register("siren_number")}
                            placeholder="123 456 789"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="vat_number">N° TVA</Label>
                          <Input
                            {...register("vat_number")}
                            placeholder="FR 12 123456789"
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="first_name">Prénom</Label>
                        <Input
                          {...register("first_name", {
                            required: "Prénom requis",
                          })}
                          placeholder="Prénom"
                        />
                        {errors.first_name?.message && (
                          <p className="text-xs text-destructive">
                            {errors.first_name.message}
                          </p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="last_name">Nom</Label>
                        <Input
                          {...register("last_name", { required: "Nom requis" })}
                          placeholder="Nom"
                        />
                        {errors.last_name?.message && (
                          <p className="text-xs text-destructive">
                            {errors.last_name.message}
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-6">
                  <div className="flex items-center gap-2">
                    <MapPinIcon className="w-4 h-4 text-muted-foreground" />
                    <h3 className="font-medium">Adresse</h3>
                  </div>

                  <div className="grid gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="street_address">Rue</Label>
                      <Input
                        {...register("street_address")}
                        placeholder="Numéro et nom de rue"
                      />
                    </div>

                    <div className="grid gap-4 sm:grid-cols-3">
                      <div className="space-y-2">
                        <Label htmlFor="postal_code">Code postal</Label>
                        <Input
                          {...register("postal_code")}
                          placeholder="75001"
                        />
                      </div>
                      <div className="space-y-2 sm:col-span-2">
                        <Label htmlFor="city">Ville</Label>
                        <Input {...register("city")} placeholder="Paris" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="country">Pays</Label>
                      <Input {...register("country")} defaultValue="France" />
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="flex items-center gap-2">
                    <PhoneIcon className="w-4 h-4 text-muted-foreground" />
                    <h3 className="font-medium">Contact</h3>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="email">
                        <div className="flex items-center gap-2">
                          <MailIcon className="w-4 h-4" />
                          <span>Email</span>
                        </div>
                      </Label>
                      <Input
                        {...register("email")}
                        type="email"
                        placeholder="email@exemple.fr"
                      />
                      {errors.email?.message && (
                        <p className="text-xs text-destructive">
                          {errors.email.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">
                        <div className="flex items-center gap-2">
                          <PhoneIcon className="w-4 h-4" />
                          <span>Téléphone</span>
                        </div>
                      </Label>
                      <FormPhoneInput
                        control={control}
                        name="phone"
                        placeholder="06 12 34 56 78"
                      />
                      {errors.phone?.message && (
                        <p className="text-xs text-destructive">
                          {errors.phone.message}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </CredenzaBody>

              <Separator />

              <CredenzaFooter>
                <CredenzaClose asChild>
                  <Button
                    variant="outline"
                    disabled={loading}
                    className="gap-2"
                  >
                    <XCircleIcon className="w-4 h-4" />
                    Annuler
                  </Button>
                </CredenzaClose>
                <Button
                  type="submit"
                  disabled={loading || !isDirty}
                  className="gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2Icon className="w-4 h-4 animate-spin" />
                      Ajout en cours...
                    </>
                  ) : (
                    <>
                      {isCompany ? (
                        <BuildingIcon className="w-4 h-4" />
                      ) : (
                        <User2Icon className="w-4 h-4" />
                      )}
                      {`Ajouter ${isCompany ? "l'entreprise" : "le client"}`}
                    </>
                  )}
                </Button>
              </CredenzaFooter>
            </div>
          </form>
        </ScrollArea>
      </CredenzaContent>
    </Credenza>
  );
}
