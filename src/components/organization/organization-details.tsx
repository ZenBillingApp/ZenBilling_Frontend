"use client";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { useFullOrganization, useUpdateOrganization } from "@/hooks/useOrganization";
import { IUpdateOrganizationRequest } from "@/types/Organization.request.interface";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Loader2, CreditCard, ExternalLink, CheckCircle2, XCircle } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

const organizationSchema = z.object({
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
  website: z.union([z.string().url("URL invalide"), z.literal("")]).optional(),
  logo: z.string().optional(),
});

interface OrganizationDetailsProps {
  organizationId: string;
}

export function OrganizationDetails({ organizationId }: OrganizationDetailsProps) {
  const [isEditing, setIsEditing] = useState(false);
  const { data: organizationData, isLoading: isOrganizationLoading } = useFullOrganization(organizationId);
  const updateOrganization = useUpdateOrganization();

  const legalForms = ['SAS', 'SARL', 'EURL', 'SASU', 'SA', 'SNC', 'SOCIETE_CIVILE', 'ENTREPRISE_INDIVIDUELLE'];

  const form = useForm<Omit<IUpdateOrganizationRequest, 'organizationId'>>({
    resolver: zodResolver(organizationSchema),
    defaultValues: {
      tva_applicable: false,
    },
  });

  // Initialisation du formulaire avec les données existantes
  useEffect(() => {
    if (organizationData) {
      const { website, tva_intra, email, phone, capital, logo, ...rest } = organizationData;
      form.reset({
        ...rest,
        logo: logo || undefined,
        capital: capital || undefined,
        tva_intra: tva_intra || undefined,
        website: website || undefined,
        email: email || undefined,
        phone: phone || undefined,
      });
    }
  }, [organizationData, form]);

  const onSubmit = (data: Omit<IUpdateOrganizationRequest, 'organizationId'>) => {
    const formattedData = {
      organizationId,
      ...data,
      tva_intra: data.tva_intra === "" ? undefined : data.tva_intra,
      website: data.website === "" ? undefined : data.website,
      email: data.email === "" ? undefined : data.email,
      phone: data.phone === "" ? undefined : data.phone,
    };
    updateOrganization.mutate(formattedData, {
      onSuccess: () => {
        setIsEditing(false);
      }
    });
  };

  if (isOrganizationLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Chargement des informations...</span>
      </div>
    );
  }

  if (!organizationData) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Erreur</AlertTitle>
        <AlertDescription>
          Impossible de récupérer les informations de l&apos;organisation.
        </AlertDescription>
      </Alert>
    );
  }

  const organization = organizationData;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Détails de l&apos;organisation</CardTitle>
        <CardDescription>
          Consultez et modifiez les informations de votre organisation
        </CardDescription>
        {!isEditing && (
          <Button onClick={() => setIsEditing(true)}>Modifier</Button>
        )}
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="informations" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="informations">Informations</TabsTrigger>
            <TabsTrigger value="adresse">Adresse</TabsTrigger>
            <TabsTrigger value="contact">Contact</TabsTrigger>
            <TabsTrigger value="stripe">Stripe</TabsTrigger>
          </TabsList>

          {isEditing ? (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <TabsContent value="informations">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nom de l&apos;organisation</FormLabel>
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
                              {legalForms.map((form, index) => (
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
                      render={({ field: { value, onChange, ...rest } }) => (
                        <FormItem>
                          <FormLabel>Capital</FormLabel>
                          <FormControl>
                            <Input type="number" {...rest} value={value || ""} onChange={onChange} />
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
                </TabsContent>

                <TabsContent value="adresse">
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
                </TabsContent>

                <TabsContent value="contact">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field: { value, onChange, ...rest } }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input {...rest} value={value || ""} onChange={onChange} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field: { value, onChange, ...rest } }) => (
                        <FormItem>
                          <FormLabel>Téléphone</FormLabel>
                          <FormControl>
                            <Input {...rest} value={value || ""} onChange={onChange} />
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
                </TabsContent>

                <TabsContent value="stripe">
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">
                      Vous ne pouvez pas modifier les informations Stripe en mode édition.
                    </p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Annulez l&apos;édition pour accéder aux options Stripe.
                    </p>
                  </div>
                </TabsContent>

                <div className="flex gap-2 mt-6">
                  <Button type="submit" disabled={updateOrganization.isPending}>
                    {updateOrganization.isPending ? "Mise à jour..." : "Enregistrer"}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => {
                    setIsEditing(false);
                    form.reset({
                      ...organization,
                      logo: organization.logo || undefined,
                      capital: organization.capital || undefined,
                      tva_intra: organization.tva_intra || undefined,
                      website: organization.website || undefined,
                      email: organization.email || undefined,
                      phone: organization.phone || undefined,
                    });
                  }}>
                    Annuler
                  </Button>
                </div>
              </form>
            </Form>
          ) : (
            <>
              <TabsContent value="informations">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label className="font-medium">Nom de l&apos;organisation</Label>
                    <p>{organization.name}</p>
                  </div>
                  <div>
                    <Label className="font-medium">Forme juridique</Label>
                    <p>{organization.legal_form}</p>
                  </div>
                  <div>
                    <Label className="font-medium">SIRET</Label>
                    <p>{organization.siret}</p>
                  </div>
                  <div>
                    <Label className="font-medium">SIREN</Label>
                    <p>{organization.siren}</p>
                  </div>
                  <div>
                    <Label className="font-medium">Numéro RCS</Label>
                    <p>{organization.RCS_number}</p>
                  </div>
                  <div>
                    <Label className="font-medium">Ville RCS</Label>
                    <p>{organization.RCS_city}</p>
                  </div>
                  <div>
                    <Label className="font-medium">Capital</Label>
                    <p>{organization.capital || "-"}</p>
                  </div>
                  <div>
                    <Label className="font-medium">TVA Applicable</Label>
                    <p>{organization.tva_applicable ? "Oui" : "Non"}</p>
                  </div>
                  {organization.tva_applicable && (
                    <div>
                      <Label className="font-medium">TVA Intracommunautaire</Label>
                      <p>{organization.tva_intra || "-"}</p>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="adresse">
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <Label className="font-medium">Adresse</Label>
                    <p>{organization.address}</p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <Label className="font-medium">Code postal</Label>
                      <p>{organization.postal_code}</p>
                    </div>
                    <div>
                      <Label className="font-medium">Ville</Label>
                      <p>{organization.city}</p>
                    </div>
                    <div>
                      <Label className="font-medium">Pays</Label>
                      <p>{organization.country}</p>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="contact">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label className="font-medium">Email</Label>
                    <p>{organization.email || "-"}</p>
                  </div>
                  <div>
                    <Label className="font-medium">Téléphone</Label>
                    <p>{organization.phone || "-"}</p>
                  </div>
                  <div className="sm:col-span-2">
                    <Label className="font-medium">Site web</Label>
                    <p>{organization.website ? (
                      <a href={organization.website} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                        {organization.website}
                      </a>
                    ) : "-"}</p>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="stripe">
                <div className="space-y-6">
                  <div className="flex items-center gap-3 p-4 border rounded-lg">
                    <CreditCard className="h-5 w-5 text-muted-foreground" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Compte Stripe</span>
                        {organization.stripe_account_id ? (
                          <div className="flex items-center gap-1">
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                            <span className="text-sm text-green-600">Créé</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1">
                            <XCircle className="h-4 w-4 text-red-600" />
                            <span className="text-sm text-red-600">Non créé</span>
                          </div>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {organization.stripe_account_id
                          ? `ID: ${organization.stripe_account_id}`
                          : "Aucun compte Stripe associé"
                        }
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-4 border rounded-lg">
                    <CheckCircle2 className="h-5 w-5 text-muted-foreground" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Onboarding Stripe</span>
                        {organization.stripe_onboarded ? (
                          <div className="flex items-center gap-1">
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                            <span className="text-sm text-green-600">Terminé</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1">
                            <XCircle className="h-4 w-4 text-orange-600" />
                            <span className="text-sm text-orange-600">À compléter</span>
                          </div>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {organization.stripe_onboarded
                          ? "Le compte est configuré et prêt à recevoir des paiements"
                          : "Complétez l'onboarding pour accepter des paiements"
                        }
                      </p>
                    </div>
                  </div>

                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>À propos de Stripe</AlertTitle>
                    <AlertDescription>
                      Les informations Stripe sont en lecture seule. La configuration Stripe est gérée au niveau de l&apos;organisation.
                    </AlertDescription>
                  </Alert>
                </div>
              </TabsContent>
            </>
          )}
        </Tabs>
      </CardContent>
    </Card>
  );
}
