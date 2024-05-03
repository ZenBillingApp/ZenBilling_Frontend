"use client";
import React, { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Link from "next/link";

import validator from "validator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";

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
      const response = fetch("http://212.132.111.107:3030/api/auth/register", {
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
      });
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
      <div className="flex flex-col justify-center items-center w-1/2 gap-4">
        <h1 className="text-4xl">Welcome to ZenBilling !</h1>
        <p className="text-m">Please register to continue</p>

        <form className="flex flex-col gap-4 w-1/2" onSubmit={handleSubmit}>
          {error && (
            <p className=" text-red-900 p-4 bg-red-300 rounded-xl">{error}</p>
          )}
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
          <p className=" text-gray-600 text-sm">
            Already have an account ?{" "}
            <Link className=" font-medium" href="/auth/login">
              Login
            </Link>
          </p>
          <Button disabled={loading} type="submit">
            {loading ? "Registering..." : "Register"}
          </Button>
        </form>
      </div>
      <div className="w-1/2 relative">
        <Image
          src="/background_register.jpg"
          alt="Background image"
          layout="fill"
          objectFit="cover"
        />
      </div>
    </div>
  );
}
