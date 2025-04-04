import { useQuery } from "@tanstack/react-query";
import { api } from "@/services/api";
import type { DashboardResponse } from "@/types/Dashboard.interface";

export const useDashboardMetrics = () => {
  return useQuery<DashboardResponse>({
    queryKey: ["dashboard", "metrics"],
    queryFn: async () => {
      const response = await api.get("/dashboard/metrics");
      return response;
    },
  });
}; 