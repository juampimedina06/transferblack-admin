import { useQuery } from '@tanstack/react-query';
import { getRecurringTripById } from '../../../core/recurringTrips/recurringTrip.api';

export function useRecurringTripDetail(id: string | null) {
  return useQuery({
    queryKey: ['recurring-trip-detail', id],
    queryFn: ({ signal }) => {
      if (!id) throw new Error('ID requerido');
      return getRecurringTripById(id, signal);
    },
    enabled: Boolean(id),
    staleTime: 15_000,
  });
}
