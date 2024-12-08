import Link from "next/link";
import Image from "next/image";

import { cn } from "@/lib/utils";
import { useStore } from "@/hooks/use-store";
import { Button } from "@/components/ui/button";
import { Menu } from "@/components/admin-panel/menu";
import { useSidebarToggle } from "@/hooks/use-sidebar-toggle";
import { SidebarToggle } from "@/components/admin-panel/sidebar-toggle";
import { UserNav } from "./user-nav";

export function Sidebar() {
  const sidebar = useStore(useSidebarToggle, (state) => state);

  if (!sidebar) return null;

  return (
    <aside
      className={cn(
        "fixed top-0 left-0 z-20 h-screen -translate-x-full lg:translate-x-0 transition-[width] ease-in-out duration-300",
        sidebar?.isOpen === false ? "w-[90px]" : "w-72"
      )}
    >
      <SidebarToggle isOpen={sidebar?.isOpen} setIsOpen={sidebar?.setIsOpen} />
      <div className="relative h-full flex flex-col px-3 py-4 overflow-y-auto shadow-md dark:shadow-zinc-800">
        <Button
          className={cn(
            "transition-transform ease-in-out duration-300 mb-1",
            "hover:bg-transparent",
            sidebar?.isOpen === false ? "translate-x-1" : "translate-x-0"
          )}
          variant="ghost"
          asChild
        >
          <Link
            href="/dashboard"
            className={cn(
              "transition-transform ease-in-out duration-300 mb-1",
              sidebar?.isOpen === false ? "translate-x-1" : "translate-x-0",
              "flex items-center gap-2"
            )}
          >
            <Image
              src={"/assets/logo.svg"}
              width={25}
              height={25}
              alt="ZenBilling"
            />
            <h1
              className={cn(
                "font-bold text-lg whitespace-nowrap transition-[transform,opacity,display] ease-in-out duration-300",
                sidebar?.isOpen === false
                  ? "-translate-x-96 opacity-0 hidden"
                  : "translate-x-0 opacity-100"
              )}
            >
              <span className="text-primary">Z</span>enBilling
            </h1>
          </Link>
        </Button>
        <Menu isOpen={sidebar?.isOpen} />
        <UserNav />
      </div>
    </aside>
  );
}
