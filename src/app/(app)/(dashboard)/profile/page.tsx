"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";

import { useUser, useUpdateUser } from "@/hooks/useUser";
import { IUpdateUserRequest } from "@/types/User.interface";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, UserIcon, Mail, Save, Edit, X } from "lucide-react";

const profileFormSchema = z.object({
  first_name: z.string().min(2, "Le prénom doit contenir au moins 2 caractères"),
  last_name: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  email: z.string().email("Adresse email invalide"),
});

export default function ProfilePage() {
  const { data: user, isLoading, error } = useUser();
  const updateUserMutation = useUpdateUser();
  const [isEditing, setIsEditing] = useState(false);

  const form = useForm<z.infer<typeof profileFormSchema>>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      first_name: user?.first_name || "",
      last_name: user?.last_name || "",
      email: user?.email || "",
    },
  });

  // Mettre à jour les valeurs du formulaire quand les données de l'utilisateur sont chargées
  if (user && !form.getValues().first_name) {
    form.reset({
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
    });
  }

  const onSubmit = (data: z.infer<typeof profileFormSchema>) => {
    const updateData: IUpdateUserRequest = {
      first_name: data.first_name,
      last_name: data.last_name,
    };

    updateUserMutation.mutate(updateData, {
      onSuccess: () => {
        toast.success("Profil mis à jour avec succès");
        setIsEditing(false);
      },
      onError: (error) => {
        toast.error(`Erreur lors de la mise à jour du profil: ${error.message}`);
      },
    });
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-6 flex justify-center items-center h-[70vh]">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-muted-foreground">Chargement du profil...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-6 flex justify-center items-center h-[70vh]">
        <div className="bg-destructive/10 p-8 rounded-lg text-center">
          <p className="text-destructive font-medium text-lg">Erreur lors du chargement du profil</p>
          <p className="text-muted-foreground mt-2">{error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-xl sm:text-2xl font-bold font-dmSans flex items-center">
          <UserIcon className="w-5 sm:w-6 h-5 sm:h-6 mr-2" />
          Profil Utilisateur
        </h1>
        {!isEditing && (
          <Button 
            onClick={() => setIsEditing(true)}
            className="w-full sm:w-auto flex items-center gap-2"
          >
            <Edit className="w-4 h-4" />
            Modifier le profil
          </Button>
        )}
      </div>

      <Card className="overflow-hidden border shadow-sm hover:shadow-md transition-shadow">
        <CardHeader className="bg-muted/50">
          <CardTitle className="flex items-center gap-2">
            <UserIcon className="h-5 w-5 text-primary" />
            Informations Personnelles
          </CardTitle>
          <CardDescription>
            Consultez et modifiez vos informations personnelles
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6 pt-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="first_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Prénom</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          disabled={!isEditing}
                          className={!isEditing ? "bg-muted/30" : ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="last_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nom</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          disabled={!isEditing}
                          className={!isEditing ? "bg-muted/30" : ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-1">
                      <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                      Email
                    </FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        type="email"
                        disabled={true}
                        className={!isEditing ? "bg-muted/30" : ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {isEditing && (
                <div className="flex justify-end space-x-4 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      form.reset();
                      setIsEditing(false);
                    }}
                    className="gap-2"
                  >
                    <X className="w-4 h-4" />
                    Annuler
                  </Button>
                  <Button 
                    type="submit"
                    disabled={updateUserMutation.isPending}
                    className="gap-2"
                  >
                    {updateUserMutation.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Enregistrement...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        Enregistrer
                      </>
                    )}
                  </Button>
                </div>
              )}
            </form>
          </Form>
        </CardContent>
        
        {!isEditing && (
          <CardFooter className="bg-muted/10 pt-4">
            <div className="text-sm text-muted-foreground">
              <p>Profil utilisateur</p>
            </div>
          </CardFooter>
        )}
      </Card>
    </div>
  );
} 