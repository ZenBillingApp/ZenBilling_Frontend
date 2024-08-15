import { useState, useEffect } from "react";
import { getCookie, deleteCookie } from "cookies-next";

interface FetchState<T> {
    data: T | null;
    loading: boolean;
    error: Error | null;
}

type HttpMethod = "GET" | "POST" | "PUT" | "DELETE";

const useFetch = <T>(
    url: string,
    method: HttpMethod = "GET",
    body?: any // Add a body parameter
): FetchState<T> => {
    const [data, setData] = useState<T | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError(null);

            try {
                const options: RequestInit = {
                    method,
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${getCookie("token")}`,
                    },
                };

                if (body) {
                    options.body = JSON.stringify(body);
                }

                const response = await fetch(url, options);

                if (response.status === 401 || response.status === 403) {
                    deleteCookie("token"); // Delete the cookie here
                    throw new Error("Unauthorized");
                }

                if (!response.ok) {
                    throw new Error(`Error: ${response.statusText}`);
                }

                const jsonData = await response.json();
                setData(jsonData);
            } catch (err) {
                setError(err as Error);
                if (process.env.NODE_ENV === "development") {
                    console.error(err);
                }
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [url, method, body]);

    return { data, loading, error };
};

export default useFetch;
