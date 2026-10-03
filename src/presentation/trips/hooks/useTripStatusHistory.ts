import { useQuery } from '@tanstack/react-query';
import { getTripStatusHistory } from '../../../core/trips/actions/getTripStatusHistory.action';

export const useTripStatusHistory = (tripId: string | null, isActive = true) => {
  return useQuery({
    queryKey: ['admin-trip-history', tripId],
    queryFn: () => (tripId ? getTripStatusHistory(tripId) : []),
    enabled: Boolean(tripId),
    refetchInterval: isActive ? 3000 : false,
    staleTime: 1000 * 2,
  });
};
