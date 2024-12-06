import { create } from "zustand";
import { User } from "@/types/User";
import { setCookie, deleteCookie } from "cookies-next";


interface AuthResponse {
  user: User;
  token: string;
}

interface AuthError {
  message: string;
  code?: string;
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: AuthError | null;
  isAuthenticated: boolean;
  setUser: (user: User) => void;
  signIn: (email: string, password: string) => Promise<boolean>;
  signOut: () => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: false,
  error: null,
  isAuthenticated: false,

  setUser: (user: User) => 
    set({ 
      user, 
      isAuthenticated: true,
      error: null 
    }),

  signIn: async (email: string, password: string) => {
    try {
      set({ isLoading: true, error: null });

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include", // Pour gérer les cookies HttpOnly
          body: JSON.stringify({ email, password }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        set({ 
          error: {
            message: errorData.message || "Une erreur est survenue lors de la connexion",
            code: errorData.code
          },
          isLoading: false,
          isAuthenticated: false 
        });
        
        return false;
      }

      const data: AuthResponse = await response.json();
      
      // Stockage du token
      setCookie("token", data.token, {
        maxAge: 60 * 30, // 30 minutes
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/"
      });

      set({ 
        user: data.user,
        isLoading: false,
        error: null,
        isAuthenticated: true
      });

      return true;
    } catch (error) {
      set({ 
        error: {
          message: "Une erreur réseau est survenue",
          code: "NETWORK_ERROR"
        },
        isLoading: false,
        isAuthenticated: false
      });
      return false;
      
    }
  },

  signOut: async () => {
      try {
      deleteCookie("token");
      set({ 
        user: null, 
        isAuthenticated: false,
        error: null
      });
      return true;
    } catch (error) {
      console.error("Error while signing out", error);
      return false;
    } 
  },
  clearError: () => set({ error: null })
}));

