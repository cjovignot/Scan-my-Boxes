// frontend/src/hooks/useApi.ts
import { useCallback, useEffect, useState } from "react";
import axiosClient from "../api/axiosClient";

export function useApi<T = unknown>(
  endpoint: string,
  options: { skip?: boolean } = {}
) {
  const { skip = false, ...fetchOptions } = options;

  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (skip) return;
    setLoading(true);

    try {
      const response = await axiosClient.get<T>(endpoint, fetchOptions);
      setData(response.data);
      setError(null);
    } catch (err) {
      console.error("API Error:", err);
      const message =
        err instanceof Error
          ? err.message
          : "Erreur inconnue lors de la requête";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [endpoint, JSON.stringify(fetchOptions), skip]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData }; // 👈 On expose `refetch`
}