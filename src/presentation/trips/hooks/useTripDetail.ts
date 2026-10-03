import { useQuery } from '@tanstack/react-query';
import { getTripDetail } from '../../../core/trips/actions/getTripDetail.action';

const ACTIVE_STATUSES = [
  'searching',
  'assigned',
  'driver_arriving',
  'driver_arrived',
  'in_progress',
];

export const useTripDetail = (tripId: string | null) => {
  return useQuery({
    queryKey: ['admin-trip-detail', tripId],
    queryFn: () => (tripId ? getTripDetail(tripId) : null),
    enabled: Boolean(tripId),
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      return status && ACTIVE_STATUSES.includes(status) ? 3000 : false;
    },
    staleTime: 1000 * 2,
  });
};
