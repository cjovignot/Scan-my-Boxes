// frontend/src/hooks/useApi.ts
import { useEffect, useState } from "react";
import axiosClient from "../api/axiosClient";

export function useApi<T = unknown>(
  endpoint: string,
  options: Record<string, unknown> = {}
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true; // évite les setState après un unmount

    const fetchData = async () => {
      try {
        const response = await axiosClient.get<T>(endpoint, options);
        if (isMounted) setData(response.data);
      } catch (err) {
        if (isMounted) {
          console.error("API Error:", err);
          const message =
            err instanceof Error
              ? err.message
              : "Erreur inconnue lors de la requête";
          setError(message);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [endpoint, JSON.stringify(options)]); // options incluses pour éviter les warnings React

  return { data, loading, error };
}
