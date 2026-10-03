import { useQuery } from '@tanstack/react-query';
import { getOpenScheduledTripAlerts } from '../../../core/scheduledTrips/scheduledTripAlerts.api';

export const useScheduledTripAlerts = () => {
  return useQuery({
    queryKey: ['scheduled-trips-alerts'],
    queryFn: ({ signal }) => getOpenScheduledTripAlerts(20, signal),
    staleTime: 1000 * 20,
    refetchInterval: 30000,
  });
};
