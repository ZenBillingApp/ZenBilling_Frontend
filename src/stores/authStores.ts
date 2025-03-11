import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { IAuthResponse } from "@/types/Auth.interface";
import type { IUser } from "@/types/User.interface";
import Cookies from 'js-cookie';

interface IAuthState {
  token: string | null;
  user: Partial<IUser> | null;
  isAuthenticated: boolean;
}

interface IAuthActions {
  setAuth: (data: IAuthResponse) => void;
  clearAuth: () => void;
  updateUser: (user: Partial<IUser>) => void;
}

export const useAuthStore = create<IAuthState & IAuthActions>()(
  persist(
    (set) => ({
      // État initial
      token: null,
      user: null,
      isAuthenticated: false,

      // Actions
      setAuth: (data: IAuthResponse) => {
        Cookies.set('token', data.token);
        set({
          token: data.token,
          user: {
            user_id: data.user.user_id,
            email: data.user.email,
            first_name: data.user.first_name,
            last_name: data.user.last_name,
            company_id: data.user.company_id,
            onboarding_completed: data.user.onboarding_completed,
            onboarding_step: data.user.onboarding_step as "CHOOSING_COMPANY" | "FINISH"
          },
          isAuthenticated: true,
        });
      },

      clearAuth: () => {
        Cookies.remove('token');
        set({
          token: null,
          user: null,
          isAuthenticated: false,
        });
      },

      updateUser: (userData: Partial<IUser>) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...userData } : null,
        })),
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








