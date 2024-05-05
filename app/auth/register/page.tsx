"use client";
import React, { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Link from "next/link";

import validator from "validator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";

import { cn } from "@/lib/utils";

type Props = {};

export default function Register({}: Props) {
    const router = useRouter();
    const { toast } = useToast();

    const [name, setName] = useState("");
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();

        if (!name || !username || !email || !password || !confirmPassword) {
            setError("Please fill in all fields");
            return;
        }
        // Validate input fields
        if (!validator.isEmail(email)) {
            setError("Invalid email address");
            return;
        }
        if (password.length < 8) {
            setError("Password must be at least 8 characters long");
            return;
        }
        if (password !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }
        try {
            setLoading(true);
            const response = fetch(
                "http://212.132.111.107:3030/api/auth/register",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        first_name: name,
                        last_name: username,
                        email,
                        password,
                    }),
                }
            );
            if (!(await response).ok) {
                const errorData = await (await response).json();
                throw new Error(errorData.message || "Failed to register");
            }
            const data = (await response).json();

            toast({
                title: "Registration successful",
                description: "You have successfully registered",
            });
            setTimeout(() => {
                router.push("/auth/login");
            }, 3000);
        } catch (error) {
            console.log(error);
            toast({
                variant: "destructive",
                title: "Error",
                description: "An error occurred. Please try again later",
            });
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="flex w-full h-screen">
            <div
                className={cn(
                    "flex flex-col justify-center items-center w-1/2 gap-4 bg-primary overflow-auto"
                )}
            >
                <div className="flex flex-col justify-start w-3/4 gap-4">
                    <div className="flex flex-col justify-start gap-4">
                        <h1
                            className={cn(
                                "text-6xl font-Caveat text-center text-background"
                            )}
                        >
                            Welcome to ZenBilling !
                        </h1>
                        <p className={cn("text-background")}>
                            Please register to continue
                        </p>
                    </div>

                    <form
                        className="flex flex-col gap-4"
                        onSubmit={handleSubmit}
                    >
                        <div className="flex gap-4">
                            <Input
                                placeholder="Name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                type="text"
                            />
                            <Input
                                placeholder="Username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                type="text"
                            />
                        </div>
                        <Input
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            type="email"
                        />
                        <Input
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            type="password"
                        />
                        <Input
                            placeholder="Confirm Password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            type="password"
                        />
                        <p className={cn("text-secondary text-sm")}>
                            Already have an account ?{" "}
                            <Link
                                className={cn(
                                    "text-secondary font-medium hover:text-background"
                                )}
                                href="/auth/login"
                            >
                                Login
                            </Link>
                        </p>
                        <Button
                            disabled={loading}
                            type="submit"
                            className={cn(
                                "w-full bg-background text-primary hover:bg-secondary hover:text-background"
                            )}
                        >
                            {loading ? "Registering..." : "Register"}
                        </Button>
                    </form>
                </div>
            </div>
            <div className="w-1/2 relative">
                <Image
                    src="/assets/images/background_register.png"
                    alt="Background image"
                    layout="fill"
                    objectFit="cover"
                />
            </div>
        </div>
    );
}
