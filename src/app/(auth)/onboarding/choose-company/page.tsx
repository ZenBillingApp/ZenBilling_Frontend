"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { Company } from "@/types/Company";
import { useDebounce } from "@/hooks/use-debounce";

import { useAuthStore } from "@/store/authStore";

import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Label } from "@/components/ui/label";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    ArrowLeftIcon,
    ArrowRightIcon,
    BuildingIcon,
    SearchIcon,
    Loader2Icon,
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
    categorie_entreprise?: string;
    activite_principale?: string;
    date_creation?: Date;
    date_mise_a_jour?: String;
    nature_juridique?: string;
}

export default function CompanySignupPage() {
    const router = useRouter();
    const { toast } = useToast();
    const { signOut } = useAuthStore();
    const [open, setOpen] = React.useState(false);
    const [isLoading, setIsLoading] = React.useState(false);
    const [isSearching, setIsSearching] = React.useState(false);
    const [inputValue, setInputValue] = React.useState("");
    const [searchResults, setSearchResults] = React.useState<
        CompanySearchResult[]
    >([]);
    const [selectedCompany, setSelectedCompany] =
        React.useState<Company | null>(null);

    const debouncedSearch = useDebounce(inputValue, 300);

    const {
        handleSubmit,
        setValue,
        getValues,
        formState: { isValid },
    } = useForm<Company>({
        defaultValues: {
            name: "",
            street_address: "",
            city: "",
            postal_code: "",
            country: "",
            email: "",
            phone: "",
            vat_number: "",
            siret_number: "",
            siren_number: "",
            category: "",
            activity: "",
            date_creation: new Date(),
            date_mise_a_jour: "",
            nature_juridique: "",
        },
    });

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

    React.useEffect(() => {
        searchCompanies(debouncedSearch);
    }, [debouncedSearch, searchCompanies]);

    const handleCompanySelect = async (companyData: CompanySearchResult) => {
        try {
            setIsLoading(true);
            setOpen(false);

            const siren = companyData.siren;
            const tvaNumber = `FR${
                (12 + 3 * (Number(siren) % 97)) % 97
            }${siren}`;

            setValue("name", companyData.nom_complet);
            setValue(
                "street_address",
                `${companyData.siege.numero_voie || ""} ${
                    companyData.siege.type_voie || ""
                } ${companyData.siege.libelle_voie || ""}`
            );
            setValue("city", companyData.siege.libelle_commune || "");
            setValue("postal_code", companyData.siege.code_postal || "");
            setValue("country", "France");
            setValue("siren_number", companyData.siren);
            setValue("siret_number", companyData.siege.siret);
            setValue("vat_number", tvaNumber);
            setValue("category", companyData.categorie_entreprise || "");
            setValue("activity", companyData.activite_principale || "");
            setValue("date_creation", companyData.date_creation || new Date());
            setValue("date_mise_a_jour", companyData.date_mise_a_jour || "");
            setValue("nature_juridique", companyData.nature_juridique || "");

            setSelectedCompany(getValues());

            toast({
                title: "Entreprise sélectionnée",
                description: "Les informations ont été pré-remplies",
            });
        } catch (error) {
            console.error("Erreur lors de la sélection:", error);
            toast({
                title: "Erreur",
                description:
                    "Impossible de charger les détails de l'entreprise",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleBackToSearch = () => {
        setSelectedCompany(null);
        setInputValue("");
        setSearchResults([]);
    };

    const onSubmit = async (data: Company) => {
        try {
            setIsLoading(true);
            await api.post("/company", data);

            toast({
                title: "Inscription réussie",
                description: "Votre entreprise a été enregistrée avec succès",
            });

            router.push("/onboarding/contact-info");
        } catch (error: any) {
            console.error("Erreur lors de l'inscription:", error);
            toast({
                title: "Erreur d'inscription",
                description:
                    error.response?.data?.message || "Une erreur est survenue",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleSignOut = () => {
        signOut();
        router.push("/login");
    };

    return (
        <div className="container max-w-4xl p-8">
            <div className="flex flex-col gap-2 items-center justify-between mb-8 md:flex-row">
                <h1 className="text-2xl font-bold">
                    Enregistrement de votre entreprise
                </h1>
                <Button
                    variant="outline"
                    onClick={handleSignOut}
                    className="flex justify-end"
                >
                    Déconnexion
                </Button>
            </div>
            {!selectedCompany ? (
                <Card>
                    <CardHeader>
                        <CardTitle>Rechercher votre entreprise</CardTitle>
                        <CardDescription>
                            Entrez le nom ou le SIRET de votre entreprise pour
                            commencer
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Popover open={open} onOpenChange={setOpen}>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    role="combobox"
                                    aria-expanded={open}
                                    aria-label="Sélectionner une entreprise"
                                    className="relative w-full justify-between overflow-hidden truncate"
                                >
                                    {inputValue ||
                                        "Rechercher une entreprise..."}
                                    {isSearching ? (
                                        <Loader2Icon className="ml-2 h-4 w-4 animate-spin absolute right-2 top-3 " />
                                    ) : (
                                        <SearchIcon className="ml-2 h-4 w-4 shrink-0 opacity-50 absolute right-2 top-1/2 transform -translate-y-1/2" />
                                    )}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-full">
                                <Command shouldFilter={false}>
                                    <CommandInput
                                        placeholder="Entrez le nom ou SIRET..."
                                        value={inputValue}
                                        onValueChange={setInputValue}
                                    />

                                    <CommandList>
                                        {searchResults.length === 0 ? (
                                            <CommandEmpty>
                                                Aucune entreprise trouvée
                                            </CommandEmpty>
                                        ) : (
                                            <CommandGroup>
                                                <ScrollArea className="h-72">
                                                    {searchResults.map(
                                                        (result) => (
                                                            <CommandItem
                                                                key={
                                                                    result.siren
                                                                }
                                                                onSelect={() =>
                                                                    handleCompanySelect(
                                                                        result
                                                                    )
                                                                }
                                                                className="flex flex-col items-start gap-1 p-2"
                                                            >
                                                                <div className="flex items-center gap-2 font-medium">
                                                                    <BuildingIcon className="h-4 w-4" />
                                                                    {
                                                                        result.nom_complet
                                                                    }
                                                                </div>
                                                                <div className="text-sm text-muted-foreground">
                                                                    {result
                                                                        .siege
                                                                        .libelle_voie &&
                                                                        `${result.siege.libelle_voie}, `}
                                                                    {
                                                                        result
                                                                            .siege
                                                                            .code_postal
                                                                    }{" "}
                                                                    {
                                                                        result
                                                                            .siege
                                                                            .libelle_commune
                                                                    }
                                                                </div>
                                                            </CommandItem>
                                                        )
                                                    )}
                                                </ScrollArea>
                                            </CommandGroup>
                                        )}
                                    </CommandList>
                                </Command>
                            </PopoverContent>
                        </Popover>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-6">
                    <div className="flex items-center space-x-4">
                        <Button
                            variant="outline"
                            onClick={handleBackToSearch}
                            className="flex items-center"
                            disabled={isLoading}
                        >
                            <ArrowLeftIcon className="mr-2 h-4 w-4" />
                            Retour à la recherche
                        </Button>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>
                                Informations de l&apos;entreprise
                            </CardTitle>
                            <CardDescription>
                                Vérifiez les informations avant de continuer
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 gap-6">
                                <div className="space-y-1">
                                    <Label>Nom</Label>
                                    <p className="text-sm font-medium">
                                        {getValues("name")}
                                    </p>
                                </div>
                                <div className="space-y-1">
                                    <Label>Adresse</Label>
                                    <p className="text-sm font-medium">
                                        {getValues("street_address")},{" "}
                                        {getValues("postal_code")}{" "}
                                        {getValues("city")}
                                    </p>
                                </div>
                                <div className="space-y-1">
                                    <Label>SIREN</Label>
                                    <p className="text-sm font-medium">
                                        {getValues("siren_number")}
                                    </p>
                                </div>
                                <div className="space-y-1">
                                    <Label>SIRET</Label>
                                    <p className="text-sm font-medium">
                                        {getValues("siret_number")}
                                    </p>
                                </div>
                                <div className="space-y-1">
                                    <Label>N° TVA</Label>
                                    <p className="text-sm font-medium">
                                        {getValues("vat_number")}
                                    </p>
                                </div>

                                {/* <div className="space-y-1">
                  <Label>Activité principale</Label>
                  <p className="text-sm font-medium">{getValues("activity")}</p>
                </div>
                <div className="space-y-1">
                  <Label>Catégorie</Label>
                  <p className="text-sm font-medium">{getValues("category")}</p>
                </div> */}
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Alert>
                                <AlertTitle>
                                    Vérifiez les informations
                                </AlertTitle>
                                <AlertDescription>
                                    Assurez-vous que toutes les informations
                                    sont correctes avant de continuer.
                                </AlertDescription>
                            </Alert>
                        </CardFooter>
                    </Card>

                    <Button
                        className="w-full"
                        disabled={isLoading || !isValid}
                        onClick={handleSubmit(onSubmit)}
                    >
                        {isLoading ? (
                            <>
                                <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                                Chargement...
                            </>
                        ) : (
                            <>
                                Valider
                                <ArrowRightIcon className="ml-2 h-4 w-4" />
                            </>
                        )}
                    </Button>
                </div>
            )}
        </div>
    );
}
