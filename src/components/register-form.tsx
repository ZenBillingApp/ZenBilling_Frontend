"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Image from "next/image";
import { useState } from "react";

import { IRegisterRequest } from "@/types/Auth.interface";

import { authClient, getErrorMessageFR } from "@/lib/auth-client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { redirect } from "next/navigation";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

import { Loader2 } from "lucide-react";

import logo from "@/assets/logo.png";

const registerSchema = z.object({
    email: z.string().email("email invalide").min(1, "email est requis"),
    password: z.string().min(8, "mot de passe doit contenir au moins 8 caractères").min(1, "mot de passe est requis"),
    first_name: z.string().min(1, "prénom est requis"),
    last_name: z.string().min(1, "nom est requis"),
});



export function RegisterForm() {
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    
    const form = useForm<IRegisterRequest>({
        resolver: zodResolver(registerSchema),
    });

    const onSubmit = async (data: IRegisterRequest) => {
        const { error } = await authClient.signUp.email({
          email: data.email,
          password: data.password,
          first_name: data.first_name,
          last_name: data.last_name,
          name: `${data.first_name} ${data.last_name}`,
          
        },{
          onRequest: () => {
            setIsLoading(true);
          },
          onSuccess: () => {
            setIsLoading(false);
            toast({
              title: "Compte créé avec succès",
              description: "Votre compte a été créé avec succès",
              
            })
            redirect('/dashboard')
          },
          onError:()=>{
            setIsLoading(false);
          }
        })
        if(error?.code){
            toast({
                title: "Erreur de création de compte",
                description: getErrorMessageFR(error.code),
                variant: "destructive"
            })
    }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-6">
                <div className="flex flex-col items-center gap-2">
                    <a
                        href="#"
                        className="flex flex-col items-center gap-2 font-medium"
                    >
                        <div className="flex h-8 w-8 items-center justify-center rounded-md">
                            <Image src={logo} alt="zenbilling logo" width={32} height={32} />
                        </div>
                        <span className="sr-only">
                            ZenBilling  
                        </span>
                    </a>
                    <h1 className="text-xl font-bold">
                        Créer un compte
                    </h1>
                    <div className="text-center text-sm">
                        Vous avez déjà un compte?{" "}
                        <a href="/login" className="underline underline-offset-4">
                            Connexion
                        </a>
                    </div>
                </div>

                <div className="flex gap-2">
                    <FormField
                        control={form.control}
                        name="first_name"
                        render={({ field }) => (
                            <FormItem className="w-1/2">
                                <FormLabel>Prénom</FormLabel>
                                <FormControl>
                                    <Input autoComplete="given-name" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    
                    <FormField
                        control={form.control}
                        name="last_name"
                        render={({ field }) => (
                            <FormItem className="w-1/2">
                                <FormLabel>Nom</FormLabel>
                                <FormControl>
                                    <Input autoComplete="family-name" {...field} />
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
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                                <Input type="email" autoComplete="email" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                
                <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Mot de passe</FormLabel>
                            <FormControl>
                                <Input type="password" autoComplete="new-password" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                
                <Button type="submit" disabled={isLoading}>
                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "S'inscrire"}
                </Button>
            </form>
        </Form>
    )
}

