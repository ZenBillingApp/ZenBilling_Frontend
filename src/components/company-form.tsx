"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Image from "next/image";

import { ICreateCompanyRequest } from "@/types/Company.request.interface";
import { useCreateCompany, useLegalForm } from "@/hooks/useCompany";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

import { AlertCircle } from "lucide-react";
import logo from "@/assets/logo.png";



const companySchema = z.object({
    name: z.string().min(1, "Le nom est requis"),
    siret: z.string().length(14, "Le SIRET doit contenir 14 caractères").min(1, "Le SIRET est requis"),
    tva_intra: z.string().optional().nullable(),
    tva_applicable: z.boolean(),
    RCS_number: z.string().min(1, "Le numéro RCS est requis"),
    RCS_city: z.string().min(1, "La ville RCS est requise"),
    capital: z.string().optional(),
    siren: z.string().length(9, "Le SIREN doit contenir 9 caractères").min(1, "Le SIREN est requis"),
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
    const { data: legalForm } = useLegalForm();

    const form = useForm<ICreateCompanyRequest>({
        resolver: zodResolver(companySchema),
        defaultValues: {
            tva_applicable: false,
            tva_intra: undefined,
            website: undefined,
        },
    });

    const onSubmit = (data: ICreateCompanyRequest) => {
        handleCreateCompany.mutate(data);
    }


    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-6">
                <div className="flex flex-col items-center gap-2 mb-2">
                    <a href="#" className="flex flex-col items-center gap-2 font-medium">
                        <div className="flex h-8 w-8 items-center justify-center rounded-md">
                            <Image src={logo} alt="zenbilling logo" width={32} height={32} />
                        </div>
                        <span className="sr-only">ZenBilling</span>
                    </a>
                    <h1 className="text-xl font-bold text-center">Informations de votre entreprise</h1>
                </div>
                {handleCreateCompany.error && handleCreateCompany.error.response?.data.errors && (
                        <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertTitle>Une erreur est survenue lors de la création de l&apos;entreprise</AlertTitle>
                            <AlertDescription>
                                <ul className="list-disc pl-5">
                                    {handleCreateCompany.error.response?.data.errors?.map((error) => (
                                        <li key={error.field}>{error.message}</li>
                                    ))}
                                </ul>
                            </AlertDescription>
                        </Alert>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Nom de l&apos;entreprise</FormLabel>
                                <FormControl>
                                    <Input {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="legal_form"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Forme juridique</FormLabel>
                                <Select 
                                    onValueChange={field.onChange}
                                    defaultValue={field.value}
                                >
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Sélectionnez..." />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {legalForm?.data?.legalForms.map((form, index) => (
                                            <SelectItem key={index} value={form}>{form}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="siret"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>SIRET</FormLabel>
                                <FormControl>
                                    <Input {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="siren"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>SIREN</FormLabel>
                                <FormControl>
                                    <Input {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="RCS_number"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Numéro RCS</FormLabel>
                                <FormControl>
                                    <Input {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="RCS_city"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Ville RCS</FormLabel>
                                <FormControl>
                                    <Input {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="capital"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Capital</FormLabel>
                                <FormControl>
                                    <Input type="number" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="tva_applicable"
                        render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0 py-4">
                                <FormControl>
                                    <Checkbox 
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                    />
                                </FormControl>
                                <div className="space-y-1 leading-none">
                                    <FormLabel>TVA Applicable</FormLabel>
                                </div>
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="tva_intra"
                        render={({ field: { value, onChange, ...rest } }) => (
                            <FormItem>
                                <FormLabel>Numéro de TVA Intracommunautaire</FormLabel>
                                <FormControl>
                                    <Input 
                                        {...rest}
                                        value={value || ""}
                                        onChange={onChange}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <h2 className="text-lg font-semibold mt-2">Adresse</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="address"
                        render={({ field }) => (
                            <FormItem className="sm:col-span-2">
                                <FormLabel>Adresse</FormLabel>
                                <FormControl>
                                    <Input {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="postal_code"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Code postal</FormLabel>
                                <FormControl>
                                    <Input {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="city"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Ville</FormLabel>
                                <FormControl>
                                    <Input {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="country"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Pays</FormLabel>
                                <FormControl>
                                    <Input {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <h2 className="text-lg font-semibold mt-2">Contact</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Email</FormLabel>
                                <FormControl>
                                    <Input type="email" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Téléphone</FormLabel>
                                <FormControl>
                                    <Input {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="website"
                        render={({ field: { value, onChange, ...rest } }) => (
                            <FormItem className="sm:col-span-2">
                                <FormLabel>Site web</FormLabel>
                                <FormControl>
                                    <Input 
                                        {...rest}
                                        value={value || ""}
                                        onChange={onChange}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <Button type="submit" className="mt-4" disabled={handleCreateCompany.isPending}>
                    {handleCreateCompany.isPending ? "Création en cours..." : "Créer l'entreprise"}
                </Button>
            </form>
        </Form>
    )
} 