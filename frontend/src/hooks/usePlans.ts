import { useApi } from "./useApi";

export interface Plan {
  id: string;
  name: string;
  description?: string;
  priceId?: string;
  price: number;
  currency: string;
}

export function usePlans() {
  return useApi<Plan[]>("/api/plans");
}
