import { useQuery } from '@tanstack/react-query';
import { getTripStatusHistory } from '../../../core/trips/actions/getTripStatusHistory.action';

export const useTripStatusHistory = (tripId: string | null) => {
  return useQuery({
    queryKey: ['admin-trip-history', tripId],
    queryFn: () => (tripId ? getTripStatusHistory(tripId) : []),
    enabled: Boolean(tripId),
    staleTime: 1000 * 30,
  });
};
