"use client"

import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { ModeToggle } from "@/components/theme-toggle"
export default function DashboardLayout({children}: {children: React.ReactNode}) {
    return <SidebarProvider>
    <AppSidebar />
    <main id="main-content" className="flex flex-col w-full h-screen">
      <header role="banner" className="flex w-full justify-between items-center p-2 border-b border-gray-200">
      <SidebarTrigger />
      <ModeToggle />
      </header>
      {children}
    </main>
  </SidebarProvider>
}

