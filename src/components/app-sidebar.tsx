"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"



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
    useSidebar,
  } from "@/components/ui/sidebar"

  import { NavUser } from "@/components/nav-user"
  import { OrganizationSwitcher } from "@/components/organization-switcher"

  import { User2Icon,FileStack,Boxes, FileText, Home, Building2 } from "lucide-react"

  import { cn } from "@/lib/utils"

  
  export function AppSidebar() {
    const pathname = usePathname()
    const { setOpenMobile } = useSidebar()
    return (
      <Sidebar>
        <SidebarHeader >
            <div className="flex items-center justify-center flex-col mb-2">
                <h1 className={cn("text-xl text-left pt-4 mx-auto font-arimo")}    >
                    <span className="font-extralight">Zen</span>
                    <span className="font-bold">Billing</span>
            </h1>
            <p className="text-xs text-left mx-auto font-arimo">Gestion de Facturation Simplifiée</p>
            </div>
            <OrganizationSwitcher />
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupContent className="mt-4">
                <SidebarGroupLabel>Gestion</SidebarGroupLabel>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton asChild isActive={pathname.startsWith("/dashboard")} onClick={() => setOpenMobile(false)}>
                            <Link href="/dashboard">
                                <Home className="w-4 h-4 mr-2" />
                                Dashboard
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                        <SidebarMenuButton asChild isActive={pathname.startsWith("/invoices")} onClick={() => setOpenMobile(false)}>
                            <Link href="/invoices">
                                <FileStack className="w-4 h-4 mr-2" />
                                Factures
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                        <SidebarMenuButton asChild isActive={pathname.startsWith("/quotes")} onClick={() => setOpenMobile(false)}>
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
                        <SidebarMenuButton asChild isActive={pathname.startsWith("/products")} onClick={() => setOpenMobile(false)}>
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
                        <SidebarMenuButton asChild isActive={pathname.startsWith("/customers")} onClick={() => setOpenMobile(false)}>
                            <Link href="/customers">
                                <User2Icon className="w-4 h-4 mr-2" />
                                Clients
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarGroupContent>
            <SidebarGroupContent>
                <SidebarGroupLabel>Paramètres</SidebarGroupLabel>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton asChild isActive={pathname.startsWith("/company")} onClick={() => setOpenMobile(false)}>
                            <Link href="/company">
                                <Building2 className="w-4 h-4 mr-2" />
                                Entreprise
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter >
            <NavUser />
            
        </SidebarFooter>
      </Sidebar>
    )
  }
  