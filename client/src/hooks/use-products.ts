import { useQuery } from "@tanstack/react-query";
import type { SneakerWithSeller } from "@shared/schema";

interface ProductFilters {
  search?: string;
  brand?: string;
  size?: string;
  minPrice?: number;
  maxPrice?: number;
  condition?: string;
}

export function useProducts(filters: ProductFilters) {
  const queryParams = new URLSearchParams();
  
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== "" && value !== null) {
      queryParams.append(key, value.toString());
    }
  });

  const queryString = queryParams.toString();
  const url = `/api/sneakers${queryString ? `?${queryString}` : ""}`;

  return useQuery<SneakerWithSeller[]>({
    queryKey: [url],
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useProduct(id: number) {
  return useQuery<SneakerWithSeller>({
    queryKey: [`/api/sneakers/${id}`],
    enabled: !!id,
  });
}
