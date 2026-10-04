import { useQuery } from '@tanstack/react-query';
import { publicApi } from '../../../core/api/publicApi';

export interface LandingStats {
  activeDrivers: number;
  corporateCompanies: number;
  categories: string[];
}

export const DEFAULT_LANDING_STATS: LandingStats = {
  activeDrivers: 318,
  corporateCompanies: 24,
  categories: ['Essential', 'Comfort'],
};

export const useLandingStats = () => {
  return useQuery<LandingStats>({
    queryKey: ['landing-stats'],
    queryFn: async () => {
      try {
        const { data } = await publicApi.get<{ data?: LandingStats } | LandingStats>(
          '/auth/landing-stats'
        );
        const payload = (data as { data?: LandingStats }).data ?? (data as LandingStats);
        return {
          activeDrivers:
            typeof payload.activeDrivers === 'number'
              ? payload.activeDrivers
              : DEFAULT_LANDING_STATS.activeDrivers,
          corporateCompanies:
            typeof payload.corporateCompanies === 'number'
              ? payload.corporateCompanies
              : DEFAULT_LANDING_STATS.corporateCompanies,
          categories:
            Array.isArray(payload.categories) && payload.categories.length > 0
              ? payload.categories
              : DEFAULT_LANDING_STATS.categories,
        };
      } catch {
        // Si el endpoint todavía no está desplegado en backend, fallback a valores seguros
        return DEFAULT_LANDING_STATS;
      }
    },
    staleTime: 1000 * 60 * 5, // 5 minutos
    retry: 1,
  });
};
