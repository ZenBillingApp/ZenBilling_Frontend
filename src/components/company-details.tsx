"use client";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { useCompany, useUpdateCompany, useLegalForm } from "@/hooks/useCompany";
import { useStripeConnect, useStripeAccountLink, useStripeCreateDashboardLink } from "@/hooks/useStripe";
import { IUpdateCompanyRequest } from "@/types/Company.request.interface";

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
import { useAuthStore } from "@/stores/authStores";
import { usePathname } from "next/navigation";

const companySchema = z.object({
  name: z.string().min(1, "Le nom est requis"),
  siret: z.string().length(14, "Le SIRET doit contenir 14 caractères"),
  tva_intra: z.string().optional().nullable(),
  tva_applicable: z.boolean(),
  RCS_number: z.string().min(1, "Le numéro RCS est requis"),
  RCS_city: z.string().min(1, "La ville RCS est requise"),
  capital: z.coerce.number().optional().nullable(),
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
  website: z.union([z.string().url("URL invalide"), z.literal("")]).optional().nullable(),
});

export function CompanyDetails() {
  const [isEditing, setIsEditing] = useState(false);
  const { data: companyData, isLoading: isCompanyLoading } = useCompany();
  const { data: legalForm } = useLegalForm();
  const updateCompany = useUpdateCompany();
  const { user } = useAuthStore();
  const pathname = usePathname();
  
  // Stripe hooks
  const stripeConnect = useStripeConnect();
  const stripeAccountLink = useStripeAccountLink(
    process.env.NEXT_PUBLIC_CLIENT_URL + pathname,
    process.env.NEXT_PUBLIC_CLIENT_URL + pathname,
  );
  const stripeCreateDashboardLink = useStripeCreateDashboardLink();

  const form = useForm<IUpdateCompanyRequest>({
    resolver: zodResolver(companySchema),
    defaultValues: {
      tva_applicable: false,
    },
  });

  // Initialisation du formulaire avec les données existantes
  useEffect(() => {
    if (companyData?.data) {
      const { website, tva_intra, ...rest } = companyData.data;
      form.reset({
        ...rest,
        capital: rest.capital || null,
        tva_intra: tva_intra || null,
        website: website || null,
      });
    }
  }, [companyData, form]);

  const onSubmit = (data: IUpdateCompanyRequest) => {
    const formattedData = {
      ...data,
      tva_intra: data.tva_intra === "" ? null : data.tva_intra,
      website: data.website === "" ? null : data.website,
    };
    updateCompany.mutate(formattedData, {
      onSuccess: () => {
        setIsEditing(false);
      }
    });
  };

  // Stripe handlers
  const handleCreateStripeAccount = async () => {
    await stripeConnect.mutateAsync();
  };

  const handleContinueStripeOnboarding = async () => {
    await stripeAccountLink.mutateAsync();
  };

  const handleOpenStripeDashboard = async () => {
    await stripeCreateDashboardLink.mutateAsync();
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
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input {...field} value={field.value || ""} />
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
                            <Input {...field} value={field.value || ""} />
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
                  <Button type="submit" disabled={updateCompany.isPending}>
                    {updateCompany.isPending ? "Mise à jour..." : "Enregistrer"}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => {
                    setIsEditing(false);
                    form.reset(company);
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

              <TabsContent value="stripe">
                <div className="space-y-6">
                  {/* Statut du compte Stripe */}
                  <div className="flex items-center gap-3 p-4 border rounded-lg">
                    <CreditCard className="h-5 w-5 text-muted-foreground" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Compte Stripe</span>
                        {user?.stripe_account_id ? (
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
                        {user?.stripe_account_id 
                          ? `ID: ${user.stripe_account_id}`
                          : "Aucun compte Stripe associé"
                        }
                      </p>
                    </div>
                  </div>

                  {/* Statut de l'onboarding */}
                  <div className="flex items-center gap-3 p-4 border rounded-lg">
                    <CheckCircle2 className="h-5 w-5 text-muted-foreground" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Onboarding Stripe</span>
                        {user?.stripe_onboarded ? (
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
                        {user?.stripe_onboarded 
                          ? "Votre compte est configuré et prêt à recevoir des paiements"
                          : "Complétez l'onboarding pour accepter des paiements"
                        }
                      </p>
                    </div>
                  </div>

                  {/* Actions Stripe */}
                  <div className="space-y-4">
                    <h4 className="font-medium">Actions disponibles</h4>
                    
                    {!user?.stripe_account_id ? (
                      <div className="space-y-3">
                        <p className="text-sm text-muted-foreground">
                          Pour commencer à accepter des paiements, vous devez d&apos;abord créer un compte Stripe.
                        </p>
                        <Button 
                          onClick={handleCreateStripeAccount}
                          disabled={stripeConnect.isPending}
                          className="w-full sm:w-auto"
                        >
                          <CreditCard className="mr-2 h-4 w-4" />
                          {stripeConnect.isPending ? "Création en cours..." : "Créer un compte Stripe"}
                        </Button>
                      </div>
                    ) : (
                      <div className="grid gap-3 sm:grid-cols-2">
                        {!user?.stripe_onboarded && (
                          <Button 
                            onClick={handleContinueStripeOnboarding}
                            disabled={stripeAccountLink.isPending}
                            variant="default"
                          >
                            <CheckCircle2 className="mr-2 h-4 w-4" />
                            {stripeAccountLink.isPending ? "Chargement..." : "Continuer l'onboarding"}
                          </Button>
                        )}
                        
                        <Button 
                          onClick={handleOpenStripeDashboard}
                          disabled={stripeCreateDashboardLink.isPending}
                          variant="outline"
                        >
                          <ExternalLink className="mr-2 h-4 w-4" />
                          {stripeCreateDashboardLink.isPending ? "Ouverture..." : "Ouvrir le dashboard Stripe"}
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* Informations utiles */}
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>À propos de Stripe</AlertTitle>
                    <AlertDescription>
                      Stripe vous permet d&apos;accepter des paiements en ligne directement depuis vos factures. 
                      L&apos;onboarding est nécessaire pour vérifier votre identité et configurer vos méthodes de paiement.
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