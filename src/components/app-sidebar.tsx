"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuth } from "@/hooks/useAuth"


import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
  } from "@/components/ui/sidebar"
  import { Button } from "@/components/ui/button"


  import { User2Icon,FileStack,Boxes,LogOut } from "lucide-react"

  import { cn } from "@/lib/utils"

  
  export function AppSidebar() {
    const pathname = usePathname()
    const { logout } = useAuth()
    return (
      <Sidebar>
        <SidebarHeader >
            <h1 className={cn("text-2xl text-center p-2 font-bold font-dmSans")}    > 
                ZenBilling
            </h1>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupContent className="mt-4">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton asChild variant={pathname === "/invoices" ? "outline" : "default"}>
                            <Link href="/invoices">
                                <FileStack className="w-4 h-4 mr-2" />
                                Factures
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                        <SidebarMenuButton asChild variant={pathname === "/products" ? "outline" : "default"}>
                            <Link href="/products" >
                                <Boxes className="w-4 h-4 mr-2" />
                                Produits
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                        <SidebarMenuButton asChild variant={pathname === "/customers" ? "outline" : "default"}>
                            <Link href="/customers">
                                <User2Icon className="w-4 h-4 mr-2" />
                                    Clients
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter >
            <Button variant={"outline"} className="w-full" onClick={logout}>
                <LogOut className="w-4 h-4 mr-2" />
                Déconnexion

            </Button>
        </SidebarFooter>
      </Sidebar>
    )
  }
  