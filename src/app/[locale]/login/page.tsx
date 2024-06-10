"use client";
import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { CardContent, CardFooter, Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";
import { setCookie } from "cookies-next";

import { cn } from "@/lib/utils";

export default function Component() {
    const router = useRouter();

    const [email, setEmail] = React.useState<string>("");
    const [password, setPassword] = React.useState<string>("");
    const [loading, setLoading] = React.useState<boolean>(false);
    const [error, setError] = React.useState<boolean>(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        try {
            setLoading(true);
            setError(false);
            const response = await fetch(
                process.env.NEXT_PUBLIC_API_URL + "/api/auth/login",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ email, password }),
                }
            );
            if (!response.ok) {
                throw new Error("Failed to login");
            }
            const data = await response.json();
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
        <div className="flex h-screen w-full items-center justify-center px-4 sm:px-6 lg:px-8">
            <div className="w-full max-w-md space-y-2">
                <div className="text-center">
                    <h2 className="text-3xl font-bold ">
                        Sign in to your account
                    </h2>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                        Don&apos;t have an account?
                        <Link
                            href="/register"
                            className={cn("text-primary", "hover:underline")}
                        >
                            {" "}
                            Sign up
                        </Link>
                    </p>
                </div>
                <Card className="p-4">
                    <form onSubmit={handleSubmit}>
                        <CardContent className="space-y-4">
                            {error && (
                                <Alert variant="destructive">
                                    <AlertTriangle className="w-5 h-5" />
                                    <AlertTitle>Failed to sign in</AlertTitle>
                                    <AlertDescription>
                                        Please check your email and password and
                                        try again.
                                    </AlertDescription>
                                </Alert>
                            )}
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    placeholder="name@example.com"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="password">Password</Label>
                                </div>
                                <Input
                                    id="password"
                                    type="password"
                                    value={password}
                                    onChange={(e) =>
                                        setPassword(e.target.value)
                                    }
                                />
                            </div>
                            {/* <Link
                className={cn(
                  "text-sm",
                  "text-primary",
                  "hover:underline",
                  "text-right"
                )}
                href="/forgot-password"
              >
                Forgot password?
              </Link> */}
                        </CardContent>
                        <CardFooter>
                            <Button
                                className="w-full"
                                type="submit"
                                disabled={loading}
                            >
                                {loading ? "Signing in..." : "Sign in"}
                            </Button>
                        </CardFooter>
                    </form>
                </Card>
            </div>
        </div>
    );
}
