"use client";
import { useRouter } from "next/navigation";

import { LogOut, ChevronsUpDown } from "lucide-react";

import { useAuthStore } from "@/store/authStore";

import { useStore } from "@/hooks/use-store";
import { useSidebarToggle } from "@/hooks/use-sidebar-toggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuGroup,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export function UserNav({ mobile = false }) {
  const { user, signOut } = useAuthStore();
  const router = useRouter();
  const sidebar = useStore(useSidebarToggle, (state) => state);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <div className="flex items-center gap-2">
          <Avatar className="h-8 w-8 rounded-lg">
            <AvatarFallback className="rounded-lg">
              {(user?.first_name?.charAt(0).toUpperCase() || "") +
                (user?.last_name?.charAt(0).toUpperCase() || "")}
            </AvatarFallback>
          </Avatar>
          <div
            className={`grid flex-1 text-left text-sm leading-tight ${
              !sidebar?.isOpen && !mobile ? "hidden" : ""
            }`}
          >
            <span className="truncate font-semibold">
              {user?.first_name} {user?.last_name}
            </span>
            <span className="truncate text-xs">{user?.email}</span>
          </div>
          <ChevronsUpDown className="ml-auto size-4" />
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
        side={mobile ? "bottom" : "right"}
        align="end"
        sideOffset={4}
      >
        <DropdownMenuLabel className="p-0 font-normal">
          <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
            <Avatar className="h-8 w-8 rounded-lg">
              <AvatarFallback className="rounded-lg">
                {" "}
                {(user?.first_name?.charAt(0).toUpperCase() || "") +
                  (user?.last_name?.charAt(0).toUpperCase() || "")}
              </AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-semibold">
                {user?.first_name} {user?.last_name}
              </span>
              <span className="truncate text-xs">{user?.email}</span>
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="flex items-center gap-2"
          onClick={() => {
            signOut();
            router.push("/login");
          }}
        >
          <LogOut className="size-4" />
          Déconnexion
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
