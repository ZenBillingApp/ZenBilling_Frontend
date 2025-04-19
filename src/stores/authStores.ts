"use client"
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { IUser,IOnboardingStep } from "@/types/User.interface";

import { getCookie, setCookie, deleteCookie } from '@/lib/serverCookies';



interface IAuthState {
  user: Partial<IUser> | null;
  isAuthenticated: boolean;
}

interface IAuthActions {
  setAuth: (data: IUser) => void;
  updateUser: (data: IUser) => void;
  clearAuth: () => void;
}
const cookieStorage = createJSONStorage(() => ({
  getItem: async (name): Promise<string | null> => {
    const value = await getCookie(name);
    return value ?? null;
  },
  setItem: async (name, value) => {
    setCookie(name, value, { path: "/", sameSite: "strict", secure: true, maxAge: 60 * 60 });
  },
  removeItem: async (name) => {
      deleteCookie(name);
  },
}));
export const useAuthStore = create<IAuthState & IAuthActions>()(
  persist(
    (set) => ({
      // État initial
      user: null,
      isAuthenticated: false,

      // Actions
      setAuth: (data: IUser) => {
        set({
          user: {
            user_id: data.user_id,
            email: data.email,
            first_name: data.first_name,
            last_name: data.last_name,
            company_id: data.company_id,
            onboarding_completed: data.onboarding_completed,
            onboarding_step: data.onboarding_step as IOnboardingStep
          },
          isAuthenticated: true,
        });
      },
      updateUser: (data: Partial<IUser>) => {
        set((state) => ({
          user: {
            ...state.user,
            ...data,
          },
        }));
      },

      clearAuth: () => {
        set({
          user: null,
          isAuthenticated: false,
        });
        deleteCookie("auth-storage");
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
      storage: cookieStorage,
    }
  )
);








