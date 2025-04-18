"use client"

import { useUser } from "@/hooks/useUser"
export default function DashboardLayout({children}: {children: React.ReactNode}) {
  const { data: user } = useUser()
  
  if (!user) {
    return <div>Loading...</div>
  }
  return <>{children}</>
}

