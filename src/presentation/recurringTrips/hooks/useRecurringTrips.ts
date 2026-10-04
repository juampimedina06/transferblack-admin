import { useQuery } from '@tanstack/react-query';
import {
  getRecurringTrips,
  type GetRecurringTripsParams,
} from '../../../core/recurringTrips/recurringTrip.api';

export function useRecurringTrips(params?: GetRecurringTripsParams) {
  return useQuery({
    queryKey: ['recurring-trips', params],
    queryFn: ({ signal }) => getRecurringTrips(params, signal),
    staleTime: 30_000,
  });
}
