"use client"

import { useUser } from "@/hooks/useUser"
export default function DashboardLayout({children}: {children: React.ReactNode}) {
  useUser()
    return <>{children}</>
}

