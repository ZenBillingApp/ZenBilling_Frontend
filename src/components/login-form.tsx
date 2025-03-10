"use client";

import { GalleryVerticalEnd } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

import { useLogin } from "@/hooks/useAuth";
import { z } from "zod"
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { ILoginRequest } from "@/types/Auth.interface"


const loginSchema = z.object({
  email: z.string().email("email invalide").min(1, "email est requis"),
  password: z.string().min(8, "mot de passe doit contenir au moins 8 caractères").min(1, "mot de passe est requis"),
});




export function LoginForm() {
    const login = useLogin();

    const { register, handleSubmit, formState: { errors } } = useForm<ILoginRequest>({
        resolver: zodResolver(loginSchema),
    });

    const onSubmit = (data: ILoginRequest) => {
        login.mutate(data);
    }



  return (
    <div className="flex flex-col gap-6">
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="flex flex-col gap-6">
          <div className="flex flex-col items-center gap-2">
            <a
              href="#"
              className="flex flex-col items-center gap-2 font-medium"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-md">
                <GalleryVerticalEnd className="size-6" />
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
          <div className="flex flex-col gap-6">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                {...register("email", { required: "email est requis" })}
                id="email"
                type="email"
                placeholder="m@example.com"
              />
               {errors.email && <p className="text-red-500 text-xs italic">{errors.email.message}</p>}
            </div>
           
            <div className="grid gap-2">
                <Label htmlFor="password">Mot de passe</Label>
                <Input
                    {...register("password", { required: "mot de passe est requis" })}
                    id="password"
                    type="password"
                    placeholder="********"
                />
                {errors.password && <p className="text-red-500 text-xs italic">{errors.password.message}</p>}
            </div>
            

            <Button type="submit" className="w-full" disabled={login.isPending} >
              {login.isPending ? "Connexion en cours..." : "Connexion"}
            </Button>
          </div>
          
        </div>
      </form>
    </div>
  )
}
