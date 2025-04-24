"use client";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { useCompany, useUpdateCompany, useLegalForm } from "@/hooks/useCompany";
import { IUpdateCompanyRequest } from "@/types/Company.request.interface";
import { LegalForm } from "@/types/Company.interface";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Loader2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const companySchema = z.object({
  name: z.string().min(1, "Le nom est requis"),
  siret: z.string().length(14, "Le SIRET doit contenir 14 caractères"),
  tva_intra: z.string().optional(),
  tva_applicable: z.boolean(),
  RCS_number: z.string().min(1, "Le numéro RCS est requis"),
  RCS_city: z.string().min(1, "La ville RCS est requise"),
  capital: z.coerce.number().optional(),
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
  website: z.string().url("URL invalide").optional(),
});

export function CompanyDetails() {
  const [isEditing, setIsEditing] = useState(false);
  const { data: companyData, isLoading: isCompanyLoading } = useCompany();
  const { data: legalForm } = useLegalForm();
  const updateCompany = useUpdateCompany();

  const { register, handleSubmit, formState: { errors }, setValue, watch, reset } = useForm<IUpdateCompanyRequest>({
    resolver: zodResolver(companySchema),
    defaultValues: {
      tva_applicable: false,
    },
  });

  // Initialisation du formulaire avec les données existantes
  useEffect(() => {
    if (companyData?.data) {
      const { website, tva_intra, ...rest } = companyData.data;
      reset({
        ...rest,
        capital: rest.capital || undefined,
        tva_intra: tva_intra || undefined,
        website: website || undefined,
      });
    }
  }, [companyData, reset]);

  const onSubmit = (data: IUpdateCompanyRequest) => {
    const formattedData = {
      ...data,
      tva_intra: data.tva_intra === "" ? undefined : data.tva_intra,
      website: data.website === "" ? undefined : data.website,
    };
    updateCompany.mutate(formattedData, {
      onSuccess: () => {
        setIsEditing(false);
      }
    });
  };

  if (isCompanyLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Chargement des informations...</span>
      </div>
    );
  }

  if (!companyData?.data) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Erreur</AlertTitle>
        <AlertDescription>
          Impossible de récupérer les informations de l&apos;entreprise.
        </AlertDescription>
      </Alert>
    );
  }

  const company = companyData.data;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Détails de l&apos;entreprise</CardTitle>
        <CardDescription>
          Consultez et modifiez les informations de votre entreprise
        </CardDescription>
        {!isEditing && (
          <Button onClick={() => setIsEditing(true)}>Modifier</Button>
        )}
      </CardHeader>
      <CardContent>
        {updateCompany.error && updateCompany.error.response?.data.errors && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Une erreur est survenue lors de la mise à jour</AlertTitle>
            <AlertDescription>
              <ul className="list-disc pl-5">
                {updateCompany.error.response?.data.errors?.map((error) => (
                  <li key={error.field}>{error.message}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="informations" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="informations">Informations</TabsTrigger>
            <TabsTrigger value="adresse">Adresse</TabsTrigger>
            <TabsTrigger value="contact">Contact</TabsTrigger>
          </TabsList>

          {isEditing ? (
            <form onSubmit={handleSubmit(onSubmit)}>
              <TabsContent value="informations">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col items-start gap-2">
                    <Label htmlFor="name">Nom de l&apos;entreprise</Label>
                    <Input id="name" {...register("name")} />
                    {errors.name && <p className="text-red-500 text-xs italic">{errors.name.message}</p>}
                  </div>

                  <div className="flex flex-col items-start gap-2">
                    <Label htmlFor="legal_form">Forme juridique</Label>
                    <Select 
                      value={watch("legal_form")}
                      onValueChange={(value) => setValue("legal_form", value as LegalForm, { shouldValidate: true })}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Sélectionnez..." />
                      </SelectTrigger>
                      <SelectContent>
                        {legalForm?.data?.legalForms.map((form, index) => (
                          <SelectItem key={index} value={form}>{form}</SelectItem>
                        ))}
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
                    <Checkbox 
                      id="tva_applicable" 
                      checked={watch("tva_applicable")} 
                      onCheckedChange={(checked) => setValue("tva_applicable", checked as boolean)} 
                    />
                    <Label htmlFor="tva_applicable">TVA Applicable</Label>
                  </div>

                  <div className="flex flex-col items-start gap-2">
                    <Label htmlFor="tva_intra">Numéro de TVA Intracommunautaire</Label>
                    <Input id="tva_intra" {...register("tva_intra")} />
                    {errors.tva_intra && <p className="text-red-500 text-xs italic">{errors.tva_intra.message}</p>}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="adresse">
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
              </TabsContent>

              <TabsContent value="contact">
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
              </TabsContent>

              <div className="flex gap-2 mt-6">
                <Button type="submit" disabled={updateCompany.isPending}>
                  {updateCompany.isPending ? "Mise à jour..." : "Enregistrer"}
                </Button>
                <Button type="button" variant="outline" onClick={() => {
                  setIsEditing(false);
                  reset(company);
                }}>
                  Annuler
                </Button>
              </div>
            </form>
          ) : (
            <>
              <TabsContent value="informations">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label className="font-medium">Nom de l&apos;entreprise</Label>
                    <p>{company.name}</p>
                  </div>
                  <div>
                    <Label className="font-medium">Forme juridique</Label>
                    <p>{company.legal_form}</p>
                  </div>
                  <div>
                    <Label className="font-medium">SIRET</Label>
                    <p>{company.siret}</p>
                  </div>
                  <div>
                    <Label className="font-medium">SIREN</Label>
                    <p>{company.siren}</p>
                  </div>
                  <div>
                    <Label className="font-medium">Numéro RCS</Label>
                    <p>{company.RCS_number}</p>
                  </div>
                  <div>
                    <Label className="font-medium">Ville RCS</Label>
                    <p>{company.RCS_city}</p>
                  </div>
                  <div>
                    <Label className="font-medium">Capital</Label>
                    <p>{company.capital || "-"}</p>
                  </div>
                  <div>
                    <Label className="font-medium">TVA Applicable</Label>
                    <p>{company.tva_applicable ? "Oui" : "Non"}</p>
                  </div>
                  {company.tva_applicable && (
                    <div>
                      <Label className="font-medium">TVA Intracommunautaire</Label>
                      <p>{company.tva_intra || "-"}</p>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="adresse">
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <Label className="font-medium">Adresse</Label>
                    <p>{company.address}</p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <Label className="font-medium">Code postal</Label>
                      <p>{company.postal_code}</p>
                    </div>
                    <div>
                      <Label className="font-medium">Ville</Label>
                      <p>{company.city}</p>
                    </div>
                    <div>
                      <Label className="font-medium">Pays</Label>
                      <p>{company.country}</p>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="contact">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label className="font-medium">Email</Label>
                    <p>{company.email || "-"}</p>
                  </div>
                  <div>
                    <Label className="font-medium">Téléphone</Label>
                    <p>{company.phone || "-"}</p>
                  </div>
                  <div className="sm:col-span-2">
                    <Label className="font-medium">Site web</Label>
                    <p>{company.website ? (
                      <a href={company.website} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                        {company.website}
                      </a>
                    ) : "-"}</p>
                  </div>
                </div>
              </TabsContent>
            </>
          )}
        </Tabs>
      </CardContent>
    </Card>
  );
} 