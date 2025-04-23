"use client"

import { useRouter } from "next/navigation"
import { authClient } from "@/lib/auth-client"
import { useAuthStore } from "@/stores/authStores"

export function useLogout() {
  const router = useRouter()
  const clearAuth = useAuthStore.getState().clearAuth

  const logout = async (redirectTo: string = "/login") => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: async () => {
          await clearAuth()
          router.push(redirectTo)
        }
      }
    })
  }

  return { logout }
} 