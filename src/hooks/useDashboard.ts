import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { IApiSuccessResponse } from "@/types/api.types";
import type { DashboardMetrics } from "@/types/Dashboard.interface";
import { useActiveOrganizationId } from "./useOrganization";
import { queryKeys } from "@/lib/queryKeys";

export const useDashboardMetrics = () => {
  const organizationId = useActiveOrganizationId();

  return useQuery<IApiSuccessResponse<DashboardMetrics>>({
    queryKey: queryKeys.dashboard.metrics(organizationId),
    queryFn: async () =>  api.get("/dashboard/metrics"),
    enabled: !!organizationId,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    staleTime: 0
  });
}; 