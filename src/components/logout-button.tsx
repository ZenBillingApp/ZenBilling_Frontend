"use client"

import { LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useLogout } from "@/hooks/use-logout"

export function LogoutButton() {
  const { logout } = useLogout()
  
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => logout()}
      className="h-8 w-8"
    >
      <LogOut className="h-4 w-4" />
      <span className="sr-only">Se déconnecter</span>
    </Button>
  )
} 