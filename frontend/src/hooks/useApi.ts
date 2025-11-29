import { useEffect, useState, useCallback } from "react";
import axiosClient from "../api/axiosClient";

export function useApi<T>(url: string | null) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(!!url);
  const [error, setError] = useState<any>(null);

  const fetchData = useCallback(async () => {
    if (!url) return;
    setLoading(true);
    try {
      const res = await axiosClient.get<T>(url);
      setData(res.data);
      setError(null);
    } catch (err: any) {
      setError(err.message || err);
    } finally {
      setLoading(false);
    }
  }, [url]); // 🔹 url en dépendance

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}
