"use client";
import React, { useState } from "react";
import Image from "next/image";
import { useRouter, useParams } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";

type Props = {};

export default function ResetPassword({}: Props) {
  const { token } = useParams();
  const router = useRouter();
  const { toast } = useToast();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!password || !confirmPassword) {
      setError("Please fill in all fields");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long");
      return;
    }

    try {
      const response = fetch(
        `http://212.132.111.107:3030/api/auth/password-reset-confirm`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            token: token,
            password: password,
          }),
        }
      );
      if (!(await response).ok) {
        const errorData = await (await response).json();
        throw new Error(errorData.message || "Failed to reset password");
      }
      const data = await (await response).json();

      toast({
        title: "Password reset successful",
        description:
          "You can now login with your new password you are redirected to the login page in few seconds",
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
    }
  };
  return (
    <div className="flex w-full">
      <div className="flex flex-col justify-center items-center w-1/2 gap-4">
        <h1 className="text-4xl">Reset your password</h1>
        <p className="text-m">Enter your new password</p>
        <form
          className="flex flex-col gap-4 mt-4 w-1/2"
          onSubmit={handleSubmit}
        >
          {error && (
            <p className="text-red-900 bg-red-300 p-4 rounded-xl">{error}</p>
          )}
          <Input
            placeholder="Password"
            name="password"
            type="password"
            onChange={(e) => setPassword(e.target.value)}
          />
          <Input
            placeholder="Confirm Password"
            name="confirmPassword"
            type="password"
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          <Button type="submit">Reset password</Button>
        </form>
      </div>
      <div className="w-1/2 relative">
        <Image
          src="/background_password.jpg"
          alt="Background image"
          objectFit="cover"
          layout="fill"
        />
      </div>
    </div>
  );
}
