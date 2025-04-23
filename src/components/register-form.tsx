"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Image from "next/image";
import { useState } from "react";

import { IRegisterRequest } from "@/types/Auth.interface";

import { authClient, getErrorMessageFR } from "@/lib/auth-client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { redirect } from "next/navigation";

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
    const { register, handleSubmit, formState: { errors } } = useForm<IRegisterRequest>({
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
        <form onSubmit={handleSubmit(onSubmit)}>
            <div className="flex flex-col gap-6">
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
          {/* {handleRegister.error && handleRegister.error.response?.data.errors && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Une erreur est survenue lors de la création du compte</AlertTitle>
              <AlertDescription>
                <ul className="list-disc pl-5">
                  {handleRegister.error.response?.data.errors.map((error) => (
                    <li key={error.field}>{error.message}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )} */}
                <div className="flex gap-2">
                    <div className="flex flex-col w-1/2 items-start gap-2">
                        <Label htmlFor="first_name">Prénom</Label>
                        <Input type="text" id="first_name" {...register("first_name")} />
                    {errors.first_name && <p className="text-red-500 text-xs italic">{errors.first_name.message}</p>}
                    </div>
                    <div className="flex flex-col w-1/2 items-start gap-2">
                        <Label htmlFor="last_name">Nom</Label>
                        <Input type="text" id="last_name" {...register("last_name")} />
                        {errors.last_name && <p className="text-red-500 text-xs italic">{errors.last_name.message}</p>}
                </div>
                </div>
                <div className="flex flex-col items-start gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input type="email" id="email" {...register("email")} />
                    {errors.email && <p className="text-red-500 text-xs italic">{errors.email.message}</p>}
                </div>
                <div className="flex flex-col items-start gap-2">
                    <Label htmlFor="password">Mot de passe</Label>
                    <Input type="password" id="password" {...register("password")} />
                    {errors.password && <p className="text-red-500 text-xs italic">{errors.password.message}</p>}
                </div>
               
                <Button type="submit" disabled={isLoading}>
                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "S&apos;inscrire"}
                </Button>
            </div>
        </form>
    )

}

