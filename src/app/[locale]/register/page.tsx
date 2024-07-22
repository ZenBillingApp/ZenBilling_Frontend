"use client";
import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { ArrowRightIcon } from "lucide-react";

import { User } from "@/types/User";

import { useToast } from "@/components/ui/use-toast";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { PhoneInput } from "@/components/ui/phone-input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";
import { setCookie } from "cookies-next";
import SearchAddress from "@/components/ui/search-address";

import { cn } from "@/lib/utils";

export default function SignupPage() {
    const router = useRouter();

    const [confirmPassword, setConfirmPassword] = useState<string>("");

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
    const [errorMessage, setErrorMessage] = useState<string>("");

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
        if (user.password !== confirmPassword) {
            setErrorMessage("Passwords do not match.");
            setError(true);
            return;
        }

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
                const error = await response.json();
                throw new Error(error.message);
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
            if (error instanceof Error) {
                setErrorMessage(error.message);
            }
            setError(true);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex w-full justify-center p-6 sm:px-6 lg:px-8">
            <div className="w-full max-w-4xl space-y-2">
                <div className="text-center">
                    <h2 className="text-3xl font-bo ld ">
                        <span className="text-primary">C</span>
                        reate your account 🚀
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        Already have an account?
                        <Button
                            variant="linkHover2"
                            onClick={() => router.push("/login")}
                            className={cn("text-primary", "p-2")}
                        >
                            {" "}
                            Sign in
                        </Button>
                    </p>
                </div>

                <form className="w-full space-y-4" onSubmit={handleSubmit}>
                    {error && (
                        <Alert variant="destructive">
                            <AlertTriangle className="w-5 h-5" />
                            <AlertTitle>Failed to sign up</AlertTitle>
                            <AlertDescription>
                                {errorMessage ||
                                    "Please check your information and try again."}
                            </AlertDescription>
                        </Alert>
                    )}

                    <div className="flex flex-col space-y-4">
                        <div className="w-full space-y-4">
                            <div>
                                <h1 className="text-2xl">
                                    <span className="text-primary">P</span>
                                    ersonal Information
                                </h1>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    Enter your personal information
                                </p>
                            </div>
                            <div className="space-y-4">
                                <div className="flex flex-col w-full space-y-2 lg:flex-row lg:space-x-4 lg:space-y-0">
                                    <div className="w-full space-y-2">
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
                                    <div className="w-full space-y-2">
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
                                <div className="flex flex-col w-full space-y-2 lg:flex-row lg:space-x-4 lg:space-y-0">
                                    <div className="w-full space-y-2">
                                        <Label htmlFor="password">
                                            Password
                                        </Label>
                                        <PasswordInput
                                            required
                                            id="password"
                                            placeholder="Password"
                                            value={user.password}
                                            autoComplete="new-password"
                                            onChange={(e) =>
                                                setUser((prevUser) => ({
                                                    ...prevUser,
                                                    password: e.target.value,
                                                }))
                                            }
                                        />
                                    </div>
                                    <div className="w-full space-y-2">
                                        <Label htmlFor="password">
                                            Confirm Password
                                        </Label>
                                        <PasswordInput
                                            required
                                            id="password"
                                            placeholder="Confirm Password"
                                            value={confirmPassword}
                                            autoComplete="new-password"
                                            onChange={(e) =>
                                                setConfirmPassword(
                                                    e.target.value
                                                )
                                            }
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="phone">Phone</Label>
                                    <PhoneInput
                                        required
                                        value={user.phone}
                                        defaultCountry="FR"
                                        onChange={(phone) =>
                                            setUser((prevUser) => ({
                                                ...prevUser,
                                                phone,
                                            }))
                                        }
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="street_address">
                                        Street Address
                                    </Label>
                                    <SearchAddress
                                        onSelectLocation={(location) => {
                                            if (location) {
                                                setUser({
                                                    ...user,
                                                    street_address:
                                                        location?.raw.address
                                                            .house_number +
                                                        " " +
                                                        location?.raw.address
                                                            .road,
                                                    city:
                                                        location?.raw.address
                                                            .town ||
                                                        location?.raw.address
                                                            .municipality,
                                                    state: location?.raw.address
                                                        .state,
                                                    postal_code:
                                                        location.raw.address
                                                            .postcode,
                                                    country:
                                                        location.raw.address
                                                            .country,
                                                });
                                            }
                                        }}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="w-full  space-y-4">
                            <div>
                                <h1 className="text-2xl">
                                    <span className="text-primary">C</span>
                                    ompany Information
                                </h1>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    Enter your company information
                                </p>
                            </div>
                            <div className="space-y-4">
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
                                    <SearchAddress
                                        onSelectLocation={(location) => {
                                            if (location) {
                                                setUser({
                                                    ...user,
                                                    company: {
                                                        ...user.company,
                                                        street_address:
                                                            location?.raw
                                                                .address
                                                                .house_number +
                                                            " " +
                                                            location?.raw
                                                                .address.road,
                                                        city:
                                                            location?.raw
                                                                .address.town ||
                                                            location?.raw
                                                                .address
                                                                .municipality,
                                                        state: location?.raw
                                                            .address.state,
                                                        postal_code:
                                                            location.raw.address
                                                                .postcode,
                                                        country:
                                                            location.raw.address
                                                                .country,
                                                    },
                                                });
                                            }
                                        }}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="company.email">Email</Label>
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
                                    <Label htmlFor="company.phone">Phone</Label>
                                    <PhoneInput
                                        required
                                        id="company.phone"
                                        name="company.phone"
                                        placeholder="Phone"
                                        type="text"
                                        value={user.company.phone}
                                        defaultCountry="FR"
                                        onChange={(phone) =>
                                            setUser((prevUser) => ({
                                                ...prevUser,
                                                company: {
                                                    ...prevUser.company,
                                                    phone,
                                                },
                                            }))
                                        }
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
                            </div>
                        </div>
                    </div>
                    <Button
                        variant="expandIcon"
                        Icon={ArrowRightIcon}
                        iconPlacement="right"
                        type="submit"
                        disabled={loading}
                        className="w-full"
                    >
                        {loading ? "Signing up..." : "Sign up"}
                    </Button>
                </form>
            </div>
        </div>
    );
}
