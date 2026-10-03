import { useQuery } from '@tanstack/react-query';
import { getScheduledTrips, type GetScheduledTripsFilters } from '../../../core/scheduledTrips/scheduledTrip.api';

export const useScheduledTrips = (filters: GetScheduledTripsFilters) => {
  return useQuery({
    queryKey: ['scheduled-trips', filters],
    queryFn: ({ signal }) => getScheduledTrips(filters, signal),
    placeholderData: (previousData) => previousData,
    staleTime: 1000 * 15,
    refetchInterval: 20000,
  });
};
