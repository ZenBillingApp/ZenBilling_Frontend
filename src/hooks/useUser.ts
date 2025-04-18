import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { IUser } from "@/types/User.interface";
import { useAuthStore } from "@/stores/authStores";
import { IApiSuccessResponse } from "@/types/api.types";
export const useUser = () => {
    const setUser = useAuthStore((state) => state.setAuth);

    return useQuery<IUser | undefined>({
        queryKey: ["user"],
        queryFn: async () => {
            const response = await api.get<IApiSuccessResponse<IUser>>("/users/profile");
            if (response.data) {
                await setUser(response.data);
            }
            return response.data;
        },
    });
};



