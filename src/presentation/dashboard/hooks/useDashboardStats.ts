import { useQuery } from '@tanstack/react-query';
import { getDashboardStatsAction } from '../../../core/dashboard/actions/get-dashboard-stats.action';
import { type PeriodoDashboard } from '../../../core/dashboard/interfaces/dashboard-stats.interface';

export const useDashboardStats = (periodo: PeriodoDashboard, fecha?: string) => {
  return useQuery({
    queryKey: ['dashboard-stats', periodo, fecha],
    queryFn: () => getDashboardStatsAction({ periodo, fecha }),
    staleTime: 1000 * 30, // 30 segundos
    retry: 2,
  });
};
