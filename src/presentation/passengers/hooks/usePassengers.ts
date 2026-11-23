import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { getPassengers } from '../../../core/passengers/actions/getPassengers.action';
import type { GetPassengersFilters } from '../../../core/passengers/interfaces/passenger.interface';

export const usePassengers = (filters: GetPassengersFilters) => {
  return useQuery({
    queryKey: ['passengers', filters],
    queryFn: () => getPassengers(filters),
    placeholderData: keepPreviousData,
    staleTime: 1000 * 30,
  });
};
