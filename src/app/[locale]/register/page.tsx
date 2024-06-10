"use client";
import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { User } from "@/types/User";

import { useToast } from "@/components/ui/use-toast";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
    CardContent,
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";
import { setCookie } from "cookies-next";

import { cn } from "@/lib/utils";

export default function SignupPage() {
    const router = useRouter();

    const [user, setUser] = useState<User>({
        first_name: "",
        last_name: "",
        email: "",
        password: "",
        phone: "",
        street_address: "",
        city: "",
        state: "",
        postal_code: "",
        country: "",
        company: {
            name: "",
            industry: "",
            street_address: "",
            city: "",
            state: "",
            postal_code: "",
            country: "",
            email: "",
            phone: "",
            vat_number: "",
        },
        is_freelancer: false,
    });

    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<boolean>(false);

    const { toast } = useToast();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        if (name.startsWith("company.")) {
            setUser((prevUser) => ({
                ...prevUser,
                company: {
                    ...prevUser.company,
                    [name.replace("company.", "")]: value,
                },
            }));
        } else {
            setUser((prevUser) => ({
                ...prevUser,
                [name]: value,
            }));
        }
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        try {
            setLoading(true);
            setError(false);
            const response = await fetch(
                process.env.NEXT_PUBLIC_API_URL + "/api/auth/register",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(user),
                }
            );
            if (!response.ok) {
                throw new Error("Failed to sign up");
            }
            const data = await response.json();

            toast({
                title: "Account created.",
                description: "You have successfully signed up.",
            });
            setCookie("token", data.token, {
                maxAge: 3600,
                path: "/",
            });
            router.push("/dashboard");
        } catch (error) {
            console.error(error);
            setError(true);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex w-full justify-center p-6 sm:px-6 lg:px-8">
            <div className="w-full max-w-4xl space-y-2">
                <div className="text-center">
                    <h2 className="text-3xl font-bold ">
                        Sign up for an account
                    </h2>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                        Already have an account?
                        <Link
                            href="/login"
                            className={cn("text-primary", "hover:underline")}
                        >
                            {" "}
                            Sign in
                        </Link>
                    </p>
                </div>

                <form onSubmit={handleSubmit}>
                    {error && (
                        <Alert variant="destructive">
                            <AlertTriangle className="w-5 h-5" />
                            <AlertTitle>Failed to sign up</AlertTitle>
                            <AlertDescription>
                                Please check your information and try again.
                            </AlertDescription>
                        </Alert>
                    )}
                    <Card className="flex flex-col w-full gap-2 p-4 mb-4">
                        <div className="flex gap-2">
                            <Card className="w-1/2 m-2">
                                <CardHeader>
                                    <CardTitle>Personal Information</CardTitle>
                                    <CardDescription>
                                        Enter your personal information
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="first_name">
                                            First Name
                                        </Label>
                                        <Input
                                            required
                                            id="first_name"
                                            name="first_name"
                                            placeholder="First Name"
                                            type="text"
                                            value={user.first_name}
                                            onChange={handleChange}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="last_name">
                                            Last Name
                                        </Label>
                                        <Input
                                            required
                                            id="last_name"
                                            name="last_name"
                                            placeholder="Last Name"
                                            type="text"
                                            value={user.last_name}
                                            onChange={handleChange}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="email">Email</Label>
                                        <Input
                                            required
                                            id="email"
                                            name="email"
                                            placeholder="name@example.com"
                                            type="email"
                                            value={user.email}
                                            onChange={handleChange}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="password">
                                            Password
                                        </Label>
                                        <Input
                                            required
                                            id="password"
                                            name="password"
                                            placeholder="Password"
                                            type="password"
                                            value={user.password}
                                            onChange={handleChange}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="phone">Phone</Label>
                                        <Input
                                            required
                                            id="phone"
                                            name="phone"
                                            placeholder="Phone"
                                            type="text"
                                            value={user.phone}
                                            onChange={handleChange}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="street_address">
                                            Street Address
                                        </Label>
                                        <Input
                                            required
                                            id="street_address"
                                            name="street_address"
                                            placeholder="Street Address"
                                            type="text"
                                            value={user.street_address}
                                            onChange={handleChange}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="city">City</Label>
                                        <Input
                                            required
                                            id="city"
                                            name="city"
                                            placeholder="City"
                                            type="text"
                                            value={user.city}
                                            onChange={handleChange}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="state">State</Label>
                                        <Input
                                            required
                                            id="state"
                                            name="state"
                                            placeholder="State"
                                            type="text"
                                            value={user.state}
                                            onChange={handleChange}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="postal_code">
                                            Postal Code
                                        </Label>
                                        <Input
                                            required
                                            id="postal_code"
                                            name="postal_code"
                                            placeholder="Postal Code"
                                            type="text"
                                            value={user.postal_code}
                                            onChange={handleChange}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="country">Country</Label>
                                        <Input
                                            required
                                            id="country"
                                            name="country"
                                            placeholder="Country"
                                            type="text"
                                            value={user.country}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="w-1/2 m-2">
                                <CardHeader>
                                    <CardTitle>Company Information</CardTitle>
                                    <CardDescription>
                                        Enter your company information
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="company.name">
                                            Company Name
                                        </Label>
                                        <Input
                                            required
                                            id="company.name"
                                            name="company.name"
                                            placeholder="Company Name"
                                            type="text"
                                            value={user.company.name}
                                            onChange={handleChange}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="company.industry">
                                            Industry
                                        </Label>
                                        <Input
                                            required
                                            id="company.industry"
                                            name="company.industry"
                                            placeholder="Industry"
                                            type="text"
                                            value={user.company.industry}
                                            onChange={handleChange}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="company.street_address">
                                            Street Address
                                        </Label>
                                        <Input
                                            required
                                            id="company.street_address"
                                            name="company.street_address"
                                            placeholder="Street Address"
                                            type="text"
                                            value={user.company.street_address}
                                            onChange={handleChange}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="company.city">
                                            City
                                        </Label>
                                        <Input
                                            required
                                            id="company.city"
                                            name="company.city"
                                            placeholder="City"
                                            type="text"
                                            value={user.company.city}
                                            onChange={handleChange}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="company.state">
                                            State
                                        </Label>
                                        <Input
                                            required
                                            id="company.state"
                                            name="company.state"
                                            placeholder="State"
                                            type="text"
                                            value={user.company.state}
                                            onChange={handleChange}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="company.postal_code">
                                            Postal Code
                                        </Label>
                                        <Input
                                            required
                                            id="company.postal_code"
                                            name="company.postal_code"
                                            placeholder="Postal Code"
                                            type="text"
                                            value={user.company.postal_code}
                                            onChange={handleChange}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="company.country">
                                            Country
                                        </Label>
                                        <Input
                                            required
                                            id="company.country"
                                            name="company.country"
                                            placeholder="Country"
                                            type="text"
                                            value={user.company.country}
                                            onChange={handleChange}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="company.email">
                                            Email
                                        </Label>
                                        <Input
                                            required
                                            id="company.email"
                                            name="company.email"
                                            placeholder="Email"
                                            type="email"
                                            value={user.company.email}
                                            onChange={handleChange}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="company.phone">
                                            Phone
                                        </Label>
                                        <Input
                                            required
                                            id="company.phone"
                                            name="company.phone"
                                            placeholder="Phone"
                                            type="text"
                                            value={user.company.phone}
                                            onChange={handleChange}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="company.vat_number">
                                            VAT Number
                                        </Label>
                                        <Input
                                            required
                                            id="company.vat_number"
                                            name="company.vat_number"
                                            placeholder="VAT Number"
                                            type="text"
                                            value={user.company.vat_number}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                        <Button
                            className="w-full"
                            type="submit"
                            disabled={loading}
                        >
                            {loading ? "Signing up..." : "Sign up"}
                        </Button>
                    </Card>
                </form>
            </div>
        </div>
    );
}
