import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { getScheduledTrips, type GetScheduledTripsFilters } from '../../../core/scheduledTrips/scheduledTrip.api';

export const useScheduledTrips = (filters: GetScheduledTripsFilters) => {
  return useQuery({
    queryKey: ['scheduled-trips', filters],
    queryFn: ({ signal }) => getScheduledTrips(filters, signal),
    placeholderData: keepPreviousData,
    staleTime: 1000 * 15,
    refetchInterval: 20000,
  });
};
