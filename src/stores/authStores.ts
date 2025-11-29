"use client"
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { IUser,IOnboardingStep } from "@/types/User.interface";

interface IAuthState {
  user: Partial<IUser> | null;
  isAuthenticated: boolean;
}

interface IAuthActions {
  setAuth: (data: IUser) => void;
  updateUser: (data: IUser) => void;
  clearAuth: () => void;
}

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
            onboarding_step: data.onboarding_step as IOnboardingStep,
            stripe_account_id: data.stripe_account_id,
            stripe_onboarded: data.stripe_onboarded,
            image: data.image
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
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);








