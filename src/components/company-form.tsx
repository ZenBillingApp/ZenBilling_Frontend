"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { ICreateCompanyRequest } from "@/types/Company.request.interface";
import { useCreateCompany } from "@/hooks/useCompany";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { GalleryVerticalEnd } from "lucide-react";
import { ICompanyLegalForm } from "@/types/Company.interface";

const companySchema = z.object({
    name: z.string().min(1, "Le nom est requis"),
    siret: z.string().length(14, "Le SIRET doit contenir 14 caractères"),
    tva_intra: z.string().optional().nullable(),
    tva_applicable: z.boolean(),
    RCS_number: z.string().min(1, "Le numéro RCS est requis"),
    RCS_city: z.string().min(1, "La ville RCS est requise"),
    capital: z.string().optional(),
    siren: z.string().length(9, "Le SIREN doit contenir 9 caractères"),
    legal_form: z.enum(['SAS', 'SARL', 'EURL', 'SASU', 'SA', 'SNC', 'SOCIETE_CIVILE', 'ENTREPRISE_INDIVIDUELLE'], {
        required_error: "La forme juridique est requise",
    }),
    address: z.string().min(1, "L'adresse est requise"),
    postal_code: z.string().min(1, "Le code postal est requis"),
    city: z.string().min(1, "La ville est requise"),
    country: z.string().min(1, "Le pays est requis"),
    email: z.string().email("Email invalide").optional(),
    phone: z.string().optional(),
    website: z.string().url("URL invalide").optional().nullable(),
});

export function CompanyForm() {
    const handleCreateCompany = useCreateCompany();

    const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<ICreateCompanyRequest>({
        resolver: zodResolver(companySchema),
        defaultValues: {
            tva_applicable: false,
            tva_intra: undefined,
        },
    });

    const onSubmit = (data: ICreateCompanyRequest) => {
        const formattedData = {
            ...data,
            tva_intra: data.tva_intra === "" ? undefined : data.tva_intra
        };
        handleCreateCompany.mutate(formattedData);
    }

    const legalForm = watch("legal_form");

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <div className="flex flex-col gap-6">
                <div className="flex flex-col items-center gap-2 mb-2">
                    <a href="#" className="flex flex-col items-center gap-2 font-medium">
                        <div className="flex h-8 w-8 items-center justify-center rounded-md">
                            <GalleryVerticalEnd className="size-6" />
                        </div>
                        <span className="sr-only">ZenBilling</span>
                    </a>
                    <h1 className="text-xl font-bold text-center">Informations de votre entreprise</h1>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col items-start gap-2">
                        <Label htmlFor="name">Nom de l&apos;entreprise</Label>
                        <Input id="name" {...register("name")} />
                        {errors.name && <p className="text-red-500 text-xs italic">{errors.name.message}</p>}
                    </div>

                    <div className="flex flex-col items-start gap-2">
                        <Label htmlFor="legal_form">Forme juridique</Label>
                        <Select 
                            value={legalForm} 
                            onValueChange={(value) => setValue("legal_form", value as ICompanyLegalForm, { shouldValidate: true })}
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Sélectionnez..." />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="SARL">SARL</SelectItem>
                                <SelectItem value="SAS">SAS</SelectItem>
                                <SelectItem value="SASU">SASU</SelectItem>
                                <SelectItem value="EURL">EURL</SelectItem>
                                <SelectItem value="SA">SA</SelectItem>
                                <SelectItem value="SNC">SNC</SelectItem>
                                <SelectItem value="SOCIETE_CIVILE">Société Civile</SelectItem>
                                <SelectItem value="ENTREPRISE_INDIVIDUELLE">Entreprise Individuelle</SelectItem>
                                
                            </SelectContent>
                        </Select>
                        {errors.legal_form && <p className="text-red-500 text-xs italic">{errors.legal_form.message}</p>}
                    </div>

                    <div className="flex flex-col items-start gap-2">
                        <Label htmlFor="siret">SIRET</Label>
                        <Input id="siret" {...register("siret")} />
                        {errors.siret && <p className="text-red-500 text-xs italic">{errors.siret.message}</p>}
                    </div>

                    <div className="flex flex-col items-start gap-2">
                        <Label htmlFor="siren">SIREN</Label>
                        <Input id="siren" {...register("siren")} />
                        {errors.siren && <p className="text-red-500 text-xs italic">{errors.siren.message}</p>}
                    </div>

                    <div className="flex flex-col items-start gap-2">
                        <Label htmlFor="RCS_number">Numéro RCS</Label>
                        <Input id="RCS_number" {...register("RCS_number")} />
                        {errors.RCS_number && <p className="text-red-500 text-xs italic">{errors.RCS_number.message}</p>}
                    </div>

                    <div className="flex flex-col items-start gap-2">
                        <Label htmlFor="RCS_city">Ville RCS</Label>
                        <Input id="RCS_city" {...register("RCS_city")} />
                        {errors.RCS_city && <p className="text-red-500 text-xs italic">{errors.RCS_city.message}</p>}
                    </div>

                    <div className="flex flex-col items-start gap-2">
                        <Label htmlFor="capital">Capital</Label>
                        <Input id="capital" type="number" {...register("capital")} />
                        {errors.capital && <p className="text-red-500 text-xs italic">{errors.capital.message}</p>}
                    </div>

                    <div className="flex items-center gap-2">
                        <Checkbox id="tva_applicable" {...register("tva_applicable")} />
                        <Label htmlFor="tva_applicable">TVA Applicable</Label>
                    </div>

                    <div className="flex flex-col items-start gap-2">
                        <Label htmlFor="tva_intra">Numéro de TVA Intracommunautaire</Label>
                        <Input id="tva_intra" {...register("tva_intra")} />
                        {errors.tva_intra && <p className="text-red-500 text-xs italic">{errors.tva_intra.message}</p>}
                    </div>
                </div>

                <h2 className="text-lg font-semibold mt-2">Adresse</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2 flex flex-col items-start gap-2">
                        <Label htmlFor="address">Adresse</Label>
                        <Input id="address" {...register("address")} />
                        {errors.address && <p className="text-red-500 text-xs italic">{errors.address.message}</p>}
                    </div>

                    <div className="flex flex-col items-start gap-2">
                        <Label htmlFor="postal_code">Code postal</Label>
                        <Input id="postal_code" {...register("postal_code")} />
                        {errors.postal_code && <p className="text-red-500 text-xs italic">{errors.postal_code.message}</p>}
                    </div>

                    <div className="flex flex-col items-start gap-2">
                        <Label htmlFor="city">Ville</Label>
                        <Input id="city" {...register("city")} />
                        {errors.city && <p className="text-red-500 text-xs italic">{errors.city.message}</p>}
                    </div>

                    <div className="flex flex-col items-start gap-2">
                        <Label htmlFor="country">Pays</Label>
                        <Input id="country" {...register("country")} />
                        {errors.country && <p className="text-red-500 text-xs italic">{errors.country.message}</p>}
                    </div>
                </div>

                <h2 className="text-lg font-semibold mt-2">Contact</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col items-start gap-2">
                        <Label htmlFor="email">Email</Label>
                        <Input type="email" id="email" {...register("email")} />
                        {errors.email && <p className="text-red-500 text-xs italic">{errors.email.message}</p>}
                    </div>

                    <div className="flex flex-col items-start gap-2">
                        <Label htmlFor="phone">Téléphone</Label>
                        <Input id="phone" {...register("phone")} />
                        {errors.phone && <p className="text-red-500 text-xs italic">{errors.phone.message}</p>}
                    </div>

                    <div className="sm:col-span-2 flex flex-col items-start gap-2">
                        <Label htmlFor="website">Site web</Label>
                        <Input id="website" {...register("website")} />
                        {errors.website && <p className="text-red-500 text-xs italic">{errors.website.message}</p>}
                    </div>
                </div>

                <Button type="submit" className="mt-4" disabled={handleCreateCompany.isPending}>
                    {handleCreateCompany.isPending ? "Création en cours..." : "Créer l'entreprise"}
                </Button>
            </div>
        </form>
    )
} 