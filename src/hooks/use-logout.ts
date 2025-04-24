"use client"

import { useRouter } from "next/navigation"
import { authClient } from "@/lib/auth-client"
import { useAuthStore } from "@/stores/authStores"
import { useQueryClient } from "@tanstack/react-query"
export function useLogout() {
  const router = useRouter()
  const clearAuth = useAuthStore.getState().clearAuth
  const queryClient = useQueryClient()
  const logout = async (redirectTo: string = "/login") => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: async () => {
          await clearAuth()
          queryClient.clear()
          router.push(redirectTo)
        }
      }
    })
  }

  return { logout }
} 