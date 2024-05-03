"use client";
import React, { useState } from "react";
import { File, Users2, Settings, Home } from "lucide-react";
import { Button } from "./ui/button";
import Nav from "./ui/Nav";

type Props = {};

export default function Sidebar({}: Props) {
  return (
    <div className="flex flex-col h-full border-r-2 p-4 gap-6">
      <Nav href="/dashboard">
        <Home className="w-6 h-6" color="red" />
      </Nav>
    </div>
  );
}
