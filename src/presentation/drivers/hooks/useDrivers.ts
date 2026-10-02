import { useQuery } from '@tanstack/react-query';
import { getDrivers } from '../../../core/drivers/actions/getDrivers.action';
import type { GetDriversFilters } from '../../../core/drivers/interfaces/driver.interface';

export const useDrivers = (filters: GetDriversFilters) => {
  return useQuery({
    queryKey: ['drivers', filters],
    queryFn: () => getDrivers(filters),
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchInterval: 10000, // 10 seconds polling para no tener que recargar
  });
};
