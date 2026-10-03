import { useQuery } from '@tanstack/react-query';
import { getScheduledTripPayments } from '../../../core/scheduledTrips/scheduledTripPayments.api';

export const useScheduledTripPayments = (tripId: string | null) => {
  return useQuery({
    queryKey: ['scheduled-trip-payments', tripId],
    queryFn: ({ signal }) => (tripId ? getScheduledTripPayments(tripId, signal) : Promise.resolve([])),
    enabled: Boolean(tripId),
    staleTime: 1000 * 10,
  });
};
