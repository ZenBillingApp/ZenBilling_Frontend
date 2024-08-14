import { useState, useEffect } from "react";
import { getCookie, deleteCookie } from "cookies-next";
import { useRouter } from "next/navigation";

interface FetchState<T> {
    data: T | null;
    loading: boolean;
    error: Error | null;
}

type HttpMethod = "GET" | "POST" | "PUT" | "DELETE";

const useFetch = <T>(
    url: string,
    method: HttpMethod = "GET"
): FetchState<T> => {
    const router = useRouter();
    const [data, setData] = useState<T | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch(url, {
                    method,
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${getCookie("token")}`,
                    },
                });

                if (response.status === 401 || response.status === 403) {
                    deleteCookie("token"); // Delete the cookie here
                    router.push("/login");
                }

                const jsonData = await response.json();
                setData(jsonData);
            } catch (error) {
                setError(error as Error);
                if (process.env.NODE_ENV === "development") {
                    console.error(error);
                }
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [url, method, router]);

    return { data, loading, error };
};

export default useFetch;
