"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Image from "next/image";
import { redirect } from "next/navigation";
import { ILoginRequest } from "@/types/Auth.interface";
import { useState } from "react";
import { authClient,getErrorMessageFR } from "@/lib/auth-client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

import { Loader2 } from "lucide-react";

import logo from "@/assets/logo.png";

const loginSchema = z.object({
    email: z.string().email("email invalide").min(1, "email est requis"),
    password: z.string().min(8, "mot de passe doit contenir au moins 8 caractères").min(1, "mot de passe est requis"),
});



export function LoginForm() {
    const { toast } = useToast(); 
    const [isLoading, setIsLoading] = useState(false);

    const { register, handleSubmit, formState: { errors } } = useForm<ILoginRequest>({
        resolver: zodResolver(loginSchema),
    });

    const onSubmit = async (data: ILoginRequest) => {
       const{ error } = await authClient.signIn.email({
        email: data.email,
        password: data.password,
       },{
        onRequest:()=>{
            setIsLoading(true);
        },
        onSuccess:()=>{
            setIsLoading(false);
            redirect("/dashboard");
        }
        
       })

       if(error?.code){
        toast({
            title: "Erreur de connexion",
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
                Connexion
            </h1>
            <div className="text-center text-sm">
              Vous n&apos;avez pas de compte?{" "}
              <a href="/register" className="underline underline-offset-4">
                Créer un compte
              </a>
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
                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Connexion"}
                </Button>
            </div>
        </form>
    )

}

