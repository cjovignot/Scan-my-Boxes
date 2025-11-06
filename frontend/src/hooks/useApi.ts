// frontend/src/hooks/useApi.ts
import { useEffect, useState } from "react";
import axiosClient from "../api/axiosClient";
import axios from "axios";

interface UseApiOptions {
  skip?: boolean;
  params?: Record<string, unknown>;
}

export function useApi<T = unknown>(
  endpoint: string,
  { skip = false, params = {} }: UseApiOptions = {}
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(!skip);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (skip || !endpoint) return; // ✅ on ne fetch pas si skip ou endpoint vide

    let isMounted = true;

    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await axiosClient.get<T>(endpoint, { params });
        if (isMounted) setData(response.data);

      } catch (err) {
        if (!isMounted) return;

        console.error("❌ API GET Error:", err);

        let message = "Erreur inconnue";

        // ✅ Extraire le vrai message du backend si axios
        if (axios.isAxiosError(err)) {
          message = err.response?.data?.error || err.message || message;
        }

        setError(message);

      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };

  }, [endpoint, JSON.stringify(params), skip]);

  return { data, loading, error };
}