import Link from "next/link";
import { MenuIcon, FileStack } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Menu } from "@/components/admin-panel/menu";
import {
  Sheet,
  SheetHeader,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { UserNav } from "./user-nav";

export function SheetMenu() {
  return (
    <Sheet>
      <SheetTrigger className="lg:hidden" asChild>
        <Button className="h-8" variant="outline" size="icon">
          <MenuIcon size={20} />
        </Button>
      </SheetTrigger>
      <SheetContent className="sm:w-72 px-3 h-full flex flex-col" side="left">
        <SheetHeader>
          <Button
            className="flex justify-center items-center pb-2 pt-1 hover:bg-transparent"
            variant="ghost"
            asChild
          >
            <Link href="/dashboard" className="flex items-center gap-2">
              <FileStack className="w-6 h-6 mr-1" />
              <h1 className="font-bold text-lg">
                <span className="text-primary">Z</span>enBilling
              </h1>
            </Link>
          </Button>
        </SheetHeader>
        <Menu isOpen />
        <UserNav mobile={true} />
      </SheetContent>
    </Sheet>
  );
}
