"use client";
import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import { User } from "@/types/User";

import { HiBuildingStorefront } from "react-icons/hi2";

import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getCookie, deleteCookie } from "cookies-next";

import { cn } from "@/lib/utils";

type Props = {
  items: Array<{ icon: JSX.Element; label: string; link: string }>;
};

export default function Sidebar({ items }: Props) {
  const page = usePathname().split("/")[2];
  const router = useRouter();

  const [user, setUser] = React.useState<User | null>(null);
  React.useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch(
          process.env.NEXT_PUBLIC_API_URL + "/api/auth/profile",
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${getCookie("token")}`,
            },
          }
        );
        const data = await response.json();
        setUser(data);
      } catch (error) {
        console.error(error);
      }
    };

    fetchUser();
  }, []);

  return (
    <div className="flex h-full w-[16rem] items-center flex-col gap-6 border">
      <div className="flex w-full justify-start items-center p-6 gap-2">
        <HiBuildingStorefront size={24} />
        <h1 className="text-xl font-bold">
          <span className={cn("text-xl", "text-primary")}>Z</span>
          ENBILLING
        </h1>
      </div>
      <div className="flex flex-col justify-between w-full h-full ">
        <ul className="flex flex-col w-full p-2 gap-2">
          {items.map((item) => (
            <li key={item.label}>
              <Link className="w-full" href={item.link}>
                <Button
                  variant={
                    page === item.link.split("/")[2] ? "default" : "ghost"
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
        {user ? (
          <DropdownMenu>
            <DropdownMenuTrigger className="flex w-full gap-2 p-2">
              <Button variant="ghost" className="flex w-full gap-2  p-2">
                <div className="flex rounded-full w-8 h-8 bg-primary justify-center items-center">
                  <span className="text-white">
                    {user?.first_name?.charAt(0)}
                    {user?.last_name?.charAt(0)}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-sm">
                    {user?.first_name} {user?.last_name}
                  </span>
                  <span className="text-xs text-gray-500">
                    {user?.company?.name}
                  </span>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel className="flex w-full gap-2 p-2 items-center">
                <div className="flex rounded-full w-8 h-8 bg-primary justify-center items-center">
                  <span className="text-white">
                    {user?.first_name?.charAt(0)}
                    {user?.last_name?.charAt(0)}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-sm">
                    {user?.first_name} {user?.last_name}
                  </span>
                  <span className="text-xs text-gray-500">
                    {user?.company?.name}
                  </span>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className=" cursor-pointer"
                onClick={() => router.push("/dashboard/profile")}
              >
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem
                className=" hover:bg-red-300 text-red-500 cursor-pointer"
                onClick={() => {
                  deleteCookie("token");
                  router.replace("/login");
                }}
              >
                <span className="text-red-500">Sign Out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <div className="flex flex-col w-full p-2 gap-2">
            <Button
              variant={"ghost"}
              onClick={() => {
                deleteCookie("token");
                router.replace("/login");
              }}
            >
              Sign Out
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
