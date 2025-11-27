"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useCreateOrganization } from "@/hooks/useOrganization";
import { ICreateOrganizationRequest } from "@/types/Organization.request.interface";
import { organizationFieldsSchema } from "@/validations/organization.validation";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";


type CreateOrganizationFormData = z.infer<typeof organizationFieldsSchema>;

interface CreateOrganizationModalProps {
  children: React.ReactNode;
}

export function CreateOrganizationModal({ children }: CreateOrganizationModalProps) {
  const [open, setOpen] = React.useState(false);
  const { mutate: createOrganization, isPending } = useCreateOrganization();
  const { toast } = useToast();
  const form = useForm<CreateOrganizationFormData>({
    resolver: zodResolver(organizationFieldsSchema),
    defaultValues: {
      name: "",
      slug: "",
      tva_applicable: false,
    },
  });

  // Réinitialiser le formulaire quand le modal se ferme
  React.useEffect(() => {
    if (!open) {
      form.reset();
    }
  }, [open, form]);

  // Générer le slug automatiquement à partir du nom
  const watchName = form.watch("name");
  React.useEffect(() => {
    // Ne s'exécute que si le modal est ouvert
    if (open && watchName && !form.formState.dirtyFields.slug) {
      const slug = watchName
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
      form.setValue("slug", slug);
    }
  }, [watchName, form, open]);

  const handleClose = () => {
    form.reset();
    setOpen(false);
  };

  const onSubmit = (data: CreateOrganizationFormData) => {
    const organizationData: ICreateOrganizationRequest = {
      ...data,
    };

    createOrganization(organizationData, {
      onSuccess: () => {
        form.reset();
        setOpen(false);
      },
      onError: (error: Error) => {
        toast({
          variant: "destructive",
          title: "Erreur lors de la création",
          description: error.message,
        });
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] p-0">
        <DialogHeader className="px-6 pt-6">
          <DialogTitle>Créer une nouvelle organisation</DialogTitle>
          <DialogDescription>
            Remplissez les informations de votre organisation pour commencer.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-8rem)]">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 px-6 pb-6">
            {/* Informations de base */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium">Informations de base</h3>

              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nom de l&apos;organisation</FormLabel>
                    <FormControl>
                      <Input placeholder="Ma société" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="slug"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Slug (identifiant unique)</FormLabel>
                    <FormControl>
                      <Input placeholder="ma-societe" {...field} />
                    </FormControl>
                    <FormDescription>
                      Utilisé pour l&apos;URL de votre organisation
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Informations légales */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium">Informations légales</h3>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="siren"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>SIREN</FormLabel>
                      <FormControl>
                        <Input placeholder="123456789" maxLength={9} {...field} />
                      </FormControl>
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
                        <Input placeholder="12345678900001" maxLength={14} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="legal_form"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Forme juridique</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionnez une forme juridique" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="SAS">SAS</SelectItem>
                        <SelectItem value="SARL">SARL</SelectItem>
                        <SelectItem value="SA">SA</SelectItem>
                        <SelectItem value="SASU">SASU</SelectItem>
                        <SelectItem value="EURL">EURL</SelectItem>
                        <SelectItem value="SNC">SNC</SelectItem>
                        <SelectItem value="SOCIETE_CIVILE">Société Civile</SelectItem>
                        <SelectItem value="ENTREPRISE_INDIVIDUELLE">
                          Entreprise Individuelle
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="RCS_number"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Numéro RCS</FormLabel>
                      <FormControl>
                        <Input placeholder="123 456 789" {...field} />
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
                        <Input placeholder="Paris" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="capital"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Capital social (optionnel)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="10000"
                        {...field}
                        onChange={(e) =>
                          field.onChange(e.target.value ? parseFloat(e.target.value) : null)
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* TVA */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium">TVA</h3>

              <FormField
                control={form.control}
                name="tva_applicable"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>TVA applicable</FormLabel>
                      <FormDescription>
                        Cochez si votre organisation est assujettie à la TVA
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="tva_intra"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Numéro de TVA intracommunautaire (optionnel)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="FR12345678901"
                        {...field}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Adresse */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium">Adresse</h3>

              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Adresse</FormLabel>
                    <FormControl>
                      <Input placeholder="123 rue de la République" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="postal_code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Code postal</FormLabel>
                      <FormControl>
                        <Input placeholder="75001" maxLength={5} {...field} />
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
                        <Input placeholder="Paris" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="country"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pays</FormLabel>
                    <FormControl>
                      <Input placeholder="France" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Contact */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium">Contact (optionnel)</h3>

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="contact@example.com"
                        {...field}
                        value={field.value || ""}
                      />
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
                      <Input
                        placeholder="+33123456789"
                        {...field}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="website"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Site web</FormLabel>
                    <FormControl>
                      <Input
                        type="url"
                        placeholder="https://example.com"
                        {...field}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isPending}
              >
                Annuler
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Créer l&apos;organisation
              </Button>
            </div>
          </form>
        </Form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
