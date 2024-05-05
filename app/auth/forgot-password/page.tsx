"use client";
import React, { useState } from "react";
import Image from "next/image";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ToastAction } from "@/components/ui/toast";
import { useToast } from "@/components/ui/use-toast";
import validator from "validator";

import { cn } from "@/lib/utils";

type Props = {};

function ForgotPassword({}: Props) {
    const [email, setEmail] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const { toast } = useToast();

    const handleSubmit = async (
        e: React.FormEvent<HTMLFormElement>
    ): Promise<void> => {
        e.preventDefault();
        setError("");
        if (!email) {
            setError("Please fill in all fields");
            return;
        }
        if (!validator.isEmail(email)) {
            setError("Invalid email address");
            return;
        }
        try {
            setLoading(true);
            const response = await fetch(
                `http://212.132.111.107:3030/api/auth/password-reset`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ email }),
                }
            );
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(
                    errorData.message || "Failed to send password reset link"
                );
            }
            toast({
                title: "Password reset link sent",
                description:
                    "if the email exists, you will receive a password reset link",
            });
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "An error occurred. Please try again later",
                action: (
                    <ToastAction
                        altText="Retry"
                        onClick={() => {
                            setError("");
                            handleSubmit(e);
                        }}
                    >
                        Retry
                    </ToastAction>
                ),
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex w-full">
            <div
                className={cn(
                    "flex flex-col justify-center items-center w-1/2 bg-primary"
                )}
            >
                <div className="flex flex-col w-3/4">
                    <div className=" flex flex-col gap-4">
                        <h1
                            className={cn(
                                "text-6xl font-Caveat text-center text-background"
                            )}
                        >
                            Forgot your password ?
                        </h1>
                        <p className={cn("text-background")}>
                            Enter your email address and we will send you a
                            password reset link
                        </p>
                    </div>
                    <form
                        className="flex flex-col gap-4"
                        onSubmit={handleSubmit}
                    >
                        <Input
                            placeholder="Email"
                            name="email"
                            type="email"
                            onChange={(e) => setEmail(e.target.value)}
                        />
                        <p className={cn("text-secondary text-sm")}>
                            Remembered your password ?{" "}
                            <a
                                className={cn(
                                    "text-secondary font-semibold hover:text-background"
                                )}
                                href="/auth/login"
                            >
                                Login{" "}
                            </a>
                            or
                            <a
                                className={cn(
                                    "text-secondary font-semibold hover:text-background"
                                )}
                                href="/auth/register"
                            >
                                {" "}
                                Register
                            </a>
                        </p>
                        <Button
                            type="submit"
                            disabled={loading}
                            className={cn(
                                "w-full bg-background text-primary hover:bg-secondary hover:text-background"
                            )}
                        >
                            {loading
                                ? "Sending password reset link..."
                                : "Send password reset link"}
                        </Button>
                    </form>
                </div>
            </div>
            <div className="w-1/2 relative">
                <Image
                    src="/assets/images/background_resetpassword.svg"
                    alt="Background image"
                    objectFit="cover"
                    layout="fill"
                />
            </div>
        </div>
    );
}

export default ForgotPassword;
