import { useQuery } from '@tanstack/react-query';
import { getTrips } from '../../../core/trips/actions/getTrips.action';
import type { GetTripsFilters } from '../../../core/trips/interfaces/trip.interface';

export const useTrips = (filters: GetTripsFilters) => {
  return useQuery({
    queryKey: ['admin-trips', filters],
    queryFn: () => getTrips(filters),
    placeholderData: (previousData) => previousData,
    staleTime: 1000 * 30, // 30 segundos
    refetchInterval: 15000, // 15 segundos para monitoreo en vivo sin parpadeos
  });
};
