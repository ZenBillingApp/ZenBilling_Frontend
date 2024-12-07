"use client";
import React from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";

import { useAuthStore } from "@/store/authStore";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { FormPhoneInput } from "@/components/ui/phone-input";
import {
    Card,
    CardContent,
    CardHeader,
    CardFooter,
    CardTitle,
    CardDescription,
} from "@/components/ui/card";

import { ArrowRightIcon } from "lucide-react";

import api from "@/lib/axios";

interface Props {}

interface ContactInfoForm {
    email: string;
    phone: string;
}

function ContactInfo({}: Props) {
    const { toast } = useToast();
    const router = useRouter();
    const { signOut } = useAuthStore();

    const [loading, setLoading] = React.useState<boolean>(false);

    const {
        control,
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<ContactInfoForm>({
        defaultValues: {
            email: "",
            phone: "",
        },
    });

    const handleSignOut = () => {
        signOut();
        router.push("/login");
    };

    const onSubmit = async (data: ContactInfoForm) => {
        try {
            setLoading(true);
            await api.put("/company", data);
            toast({
                title: "Succès",
                description: "Votre compte a été créé avec succès",
            });
            router.push("/dashboard");
        } catch (error: any) {
            console.error(error);
            toast({
                variant: "destructive",
                title: "Erreur",
                description:
                    error?.response?.data?.errors?.map(
                        (e: { msg: string }) => e.msg
                    ) ||
                    "Une erreur s'est produite lors de la création de votre compte",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container max-w-4xl p-8">
            <div className="flex flex-col gap-2 items-center justify-between mb-8 md:flex-row">
                <h1 className="text-2xl font-bold">
                    Enregistrement de votre entreprise
                </h1>
                <Button
                    variant="outline"
                    onClick={handleSignOut}
                    className="flex items-center"
                >
                    Déconnexion
                </Button>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Dernière étape</CardTitle>
                    <CardDescription>
                        Pour finaliser votre inscription, veuillez renseigner
                        les informations de contact de votre entreprise
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    type="email"
                                    id="email"
                                    {...register("email", {
                                        required: "Ce champ est requis",
                                        pattern: {
                                            value: /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$/,
                                            message:
                                                "Veuillez entrer un email valide",
                                        },
                                    })}
                                />
                                {errors.email && (
                                    <p className="text-xs text-red-500 italic">
                                        {errors.email.message}
                                    </p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="phone">Téléphone</Label>
                                <FormPhoneInput
                                    control={control}
                                    name="phone"
                                    rules={{
                                        required:
                                            "Veuillez entrer un numéro de téléphone",
                                    }}
                                />
                                {errors.phone && (
                                    <p className="text-xs text-red-500 italic">
                                        {errors.phone.message}
                                    </p>
                                )}
                            </div>
                        </div>
                    </form>
                </CardContent>
                <CardFooter>
                    <Button onClick={handleSubmit(onSubmit)}>
                        {loading ? (
                            "Chargement..."
                        ) : (
                            <>
                                finaliser l&apos;inscription
                                <ArrowRightIcon className="ml-2 h-4 w-4" />
                            </>
                        )}
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}

export default ContactInfo;
