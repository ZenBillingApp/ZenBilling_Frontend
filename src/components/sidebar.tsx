"use client";
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { AiFillAliwangwang } from "react-icons/ai";

import { Button } from "./ui/button";

import { cn } from "@/lib/utils";

type Props = {
  items: Array<{ icon: JSX.Element; label: string; link: string }>;
};

export default function Sidebar({ items }: Props) {
  const page = usePathname().replace("/", "");

  return (
    <div className="flex h-full w-[16rem] items-center flex-col gap-6 border">
      <div className="flex w-full justify-start items-center p-4 gap-1">
        <AiFillAliwangwang size={32} />
        <h1 className="text-xl font-bold">
          <span className={cn("text-xl", "text-primary")}>Z</span>
          ENBILLING
        </h1>
      </div>
      <div className="flex flex-col w-full h-full ">
        <ul className="flex flex-col w-full p-2 gap-2">
          {items.map((item) => (
            <li key={item.label}>
              <Link className="w-full" href={item.link}>
                <Button
                  variant={
                    page === item.link.replace("/", "") ? "default" : "ghost"
                  }
                  className={cn("flex", "w-full", "justify-start", "gap-2")}
                >
                  {item.icon}
                  <span className="">{item.label}</span>
                </Button>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
