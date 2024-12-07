"use client";

import React from "react";

import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";

import { useAuthStore } from "@/store/authStore";

type Props = {
  children: React.ReactNode;
};

export default function Layout({ children }: Props) {
  const { signOut } = useAuthStore();
  const router = useRouter();

  const handleSignOut = () => {
    signOut();
    router.push("/login");
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
          className="flex justify-end"
        >
          Déconnexion
        </Button>
      </div>
      {children}
    </div>
  );
}
