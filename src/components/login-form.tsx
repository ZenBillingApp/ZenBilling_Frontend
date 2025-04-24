"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ILoginRequest } from "@/types/Auth.interface";
import { useState } from "react";
import { authClient, getErrorMessageFR } from "@/lib/auth-client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

import { Loader2 } from "lucide-react";

import logo from "@/assets/logo.png";

const loginSchema = z.object({
    email: z.string().email("Email invalide").min(1, "Email est requis"),
    password: z.string().min(8, "Le mot de passe doit contenir au moins 8 caractères").min(1, "Mot de passe est requis"),
});

export function LoginForm() {
    const { toast } = useToast(); 
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const { register, handleSubmit, formState: { errors } } = useForm<ILoginRequest>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: "",
            password: ""
        }
    });

    const googleLogin = async () => {
        try {
            const { error } = await authClient.signIn.social({
                provider: "google",
                callbackURL: `${process.env.NEXT_PUBLIC_CLIENT_URL}/dashboard`,
            });
            
            if(error?.code) {
                toast({
                    title: "Erreur de connexion",
                    description: getErrorMessageFR(error.code),
                    variant: "destructive"
                });
            }
        } catch {
            toast({
                title: "Erreur de connexion",
                description: "Une erreur s'est produite lors de la connexion avec Google",
                variant: "destructive"
            });
        }
    }

    const onSubmit = async (data: ILoginRequest) => {
        try {
            const { error } = await authClient.signIn.email({
                email: data.email,
                password: data.password,
            }, {
                onRequest: () => {
                    setIsLoading(true);
                },
                onSuccess: () => {
                    setIsLoading(false);
                    router.push("/dashboard");
                },
                onError: () => {
                    setIsLoading(false);
                }
            });

            if(error?.code) {
                toast({
                    title: "Erreur de connexion",
                    description: getErrorMessageFR(error.code),
                    variant: "destructive"
                });
            }
        } catch {
            setIsLoading(false);
            toast({
                title: "Erreur de connexion",
                description: "Une erreur inattendue s'est produite",
                variant: "destructive"
            });
        }
    }

    return (
        <div className="w-full max-w-md mx-auto space-y-8">
            <div className="flex flex-col items-center gap-4">
                <Link href="/" className="flex flex-col items-center gap-2 font-medium">
                    <div className="flex h-10 w-10 items-center justify-center rounded-md">
                        <Image src={logo} alt="ZenBilling logo" width={40} height={40} />
                    </div>
                    <span className="sr-only">ZenBilling</span>
                </Link>
                <h1 className="text-2xl font-bold">Connexion</h1>
                <div className="text-center text-sm">
                    Vous n&apos;avez pas de compte?{" "}
                    <Link href="/register" className="font-medium text-primary hover:underline underline-offset-4">
                        Créer un compte
                    </Link>
                </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input 
                            type="email" 
                            id="email" 
                            placeholder="votre@email.com"
                            aria-invalid={errors.email ? "true" : "false"}
                            {...register("email")} 
                        />
                        {errors.email && <p className="text-red-500 text-xs italic">{errors.email.message}</p>}
                    </div>
                    
                    <div className="space-y-2">
                        {/* <div className="flex items-center justify-between">
                            <Label htmlFor="password">Mot de passe</Label>
                            <Link href="/forgot-password" className="text-xs font-medium text-primary hover:underline">
                                Mot de passe oublié?
                            </Link>
                        </div> */}
                        <Input 
                            type="password" 
                            id="password" 
                            placeholder="••••••••"
                            aria-invalid={errors.password ? "true" : "false"}
                            {...register("password")} 
                        />
                        {errors.password && <p className="text-red-500 text-xs italic">{errors.password.message}</p>}
                    </div>
                </div>

                <div className="space-y-4">
                    <Button type="submit" className="w-full" disabled={isLoading}>
                        {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                        {isLoading ? "Connexion en cours..." : "Se connecter"}
                    </Button>
                    
                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t"></span>
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-background px-2 text-muted-foreground">Ou continuer avec</span>
                        </div>
                    </div>
                    
                    <Button 
                        type="button"
                        variant="outline" 
                        className="w-full"
                        onClick={googleLogin}
                    >
                        <svg className="mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
                            <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12s5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"></path>
                            <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"></path>
                            <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"></path>
                            <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"></path>
                        </svg>
                        Connexion avec Google
                    </Button>
                </div>
            </form>
        </div>
    );
}

