import { useQuery } from '@tanstack/react-query';
import { getTripDetail } from '../../../core/trips/actions/getTripDetail.action';

export const useTripDetail = (tripId: string | null) => {
  return useQuery({
    queryKey: ['admin-trip-detail', tripId],
    queryFn: () => (tripId ? getTripDetail(tripId) : null),
    enabled: Boolean(tripId),
    staleTime: 1000 * 60, // 1 minuto
  });
};
