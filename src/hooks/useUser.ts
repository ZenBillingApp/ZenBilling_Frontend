import { useQuery, useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { IUser,IUpdateUserRequest } from "@/types/User.interface";
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

export const useUpdateUser = () => {
    const updateUser = useAuthStore((state) => state.updateUser);

    return useMutation<IApiSuccessResponse<IUser> , Error, IUpdateUserRequest>({
        mutationFn: (user: IUpdateUserRequest) => api.put<IApiSuccessResponse<IUser> >("/users/profile", user),
        onSuccess: async (data: IApiSuccessResponse<IUser>) => {
            if (data.data) {
                await updateUser(data.data);
            }
        },
        onError: (error: Error) => {
            console.error(error);
        },
    });
};



