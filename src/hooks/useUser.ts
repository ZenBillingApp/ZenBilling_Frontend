import { useQuery, useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { IUser, IUpdateUserRequest, IStoredUser } from "@/types/User.interface";
import { useAuthStore } from "@/stores/authStores";
import { IApiSuccessResponse } from "@/types/api.types";
import { authClient } from "@/lib/auth-client";

/**
 * Hook pour récupérer l'utilisateur courant via Better Auth
 */
export const useUser = () => {
    const setUser = useAuthStore((state) => state.setAuth);

    return useQuery<IStoredUser | null>({
        queryKey: ["user"],
        queryFn: async () => {
            const { data } = await authClient.getSession();
            if (data?.user) {
                // Mapper les données Better Auth vers IStoredUser
                const user = data.user as {
                    id: string;
                    email: string;
                    first_name?: string;
                    last_name?: string;
                    image?: string | null;
                    company_id?: string | null;
                    onboarding_completed?: boolean | null;
                    onboarding_step?: string | null;
                    stripe_account_id?: string | null;
                    stripe_onboarded?: boolean | null;
                };

                const storedUser: IStoredUser = {
                    id: user.id,
                    email: user.email,
                    first_name: user.first_name || "",
                    last_name: user.last_name || "",
                    image: user.image,
                    company_id: user.company_id,
                    onboarding_completed: user.onboarding_completed,
                    onboarding_step: user.onboarding_step as IStoredUser["onboarding_step"],
                    stripe_account_id: user.stripe_account_id,
                    stripe_onboarded: user.stripe_onboarded,
                };

                setUser(storedUser);
                return storedUser;
            }
            return null;
        },
    });
};

/**
 * Hook pour mettre à jour le profil utilisateur
 */
export const useUpdateUser = () => {
    const updateUser = useAuthStore((state) => state.updateUser);

    return useMutation<IApiSuccessResponse<IUser>, Error, IUpdateUserRequest>({
        mutationFn: (user: IUpdateUserRequest) =>
            api.put<IApiSuccessResponse<IUser>>("/user/profile", user),
        onSuccess: async (data: IApiSuccessResponse<IUser>) => {
            if (data.data) {
                updateUser({
                    first_name: data.data.first_name,
                    last_name: data.data.last_name,
                });
            }
        },
        onError: (error: Error) => {
            console.error(error);
        },
    });
};
