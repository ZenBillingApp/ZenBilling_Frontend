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
    SidebarGroupLabel,
  } from "@/components/ui/sidebar"
  import { Button } from "@/components/ui/button"


  import { User2Icon,FileStack,Boxes,LogOut, FileText } from "lucide-react"

  import { cn } from "@/lib/utils"

  
  export function AppSidebar() {
    const pathname = usePathname()
    const { logout } = useAuth()
    return (
      <Sidebar>
        <SidebarHeader >
            <div className="flex items-center justify-center flex-col">
                <h1 className={cn("text-xl text-left pt-4 mx-auto font-arimo")}    > 
                    <span className="font-extralight">Zen</span>
                    <span className="font-bold">Billing</span>
            </h1>
            <p className="text-xs text-left mx-auto font-arimo">Gestion de Facturation Simplifiée</p>
            </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupContent className="mt-4">
                <SidebarGroupLabel>Gestion</SidebarGroupLabel>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton asChild isActive={pathname.startsWith("/invoices")}>
                            <Link href="/invoices">
                                <FileStack className="w-4 h-4 mr-2" />
                                Factures
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                        <SidebarMenuButton asChild isActive={pathname.startsWith("/quotes")}>
                            <Link href="/quotes">
                                <FileText className="w-4 h-4 mr-2" />
                                Devis
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                    
                    
                </SidebarMenu>
            </SidebarGroupContent>
            <SidebarGroupContent>
                <SidebarGroupLabel>Produits</SidebarGroupLabel>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton asChild isActive={pathname.startsWith("/products")}>
                            <Link href="/products">
                                <Boxes className="w-4 h-4 mr-2" />
                                Produits
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarGroupContent>
            <SidebarGroupContent>
                <SidebarGroupLabel>Clients</SidebarGroupLabel>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton asChild isActive={pathname.startsWith("/customers")}>
                            <Link href="/customers">
                                <User2Icon className="w-4 h-4 mr-2" />
                                Clients
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarGroupContent>
            {/* <SidebarGroupContent>
                <SidebarGroupLabel>Paramètres</SidebarGroupLabel>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton asChild isActive={pathname.startsWith("/settings")}>
                            <Link href="/settings">
                                <Settings className="w-4 h-4 mr-2" />
                                Paramètres
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarGroupContent> */}
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
  