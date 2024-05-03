"use client";
import React from "react";
import Image from "next/image";
import { setCookie } from "cookies-next";
import { useRouter } from "next/navigation";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

type Props = {};

export default function Login({}: Props) {
  const router = useRouter();
  const { toast } = useToast();

  const [loading, setLoading] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      setLoading(true);
      const response = await fetch(
        "http://212.132.111.107:3030/api/auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: e.currentTarget.email.value,
            password: e.currentTarget.password.value,
          }),
        }
      );
      if (!response.ok) {
        const errorData = await response.json(); // Get JSON body of error response
        throw new Error(errorData.message || "Failed to log in"); // Throw an error with a message from the response
      }
      const data = await response.json();
      setCookie("token", data.token, {
        maxAge: 30 * 24 * 60 * 60,
        path: "/",
      });
      router.replace("/dashboard");
      console.log(data);
    } catch (error) {
      console.log(error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "An error occurred. Please try again later " + error,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex w-full">
      <div className="w-1/2 relative">
        <Image
          src="/background_login.jpg"
          alt="Background image"
          objectFit="cover"
          layout="fill"
        />
      </div>
      <div className="flex flex-col justify-center items-center min-h-screen w-1/2 gap-4 overflow-auto">
        <h1 className="text-4xl">Welcome back !</h1>
        <p className="text-l">Please login to continue</p>
        <form
          className="flex flex-col gap-4 mt-4 w-1/2"
          onSubmit={handleSubmit}
        >
          <Input placeholder="Email" name="email" type="email" />
          <Input placeholder="Password" name="password" type="password" />
          <p className=" text-gray-600 text-sm">
            <a
              className=" text-gray-600 font-medium text-sm"
              href="/auth/forgot-password"
            >
              Forgot password ?
            </a>
            {"  "}
            or{" "}
            <a className=" text-gray-600 font-medium" href="/auth/register">
              Register
            </a>
          </p>
          <Button type="submit" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </Button>
        </form>
      </div>
    </div>
  );
}
