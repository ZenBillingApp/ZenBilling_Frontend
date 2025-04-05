import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { IApiSuccessResponse } from "@/types/api.types";
import type { DashboardMetrics } from "@/types/Dashboard.interface";

export const useDashboardMetrics = () => {
  return useQuery<IApiSuccessResponse<DashboardMetrics>>({
    queryKey: ["dashboard", "metrics"],
    queryFn: async () =>  api.get("/dashboard/metrics"),
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    staleTime: 0
  });
}; 