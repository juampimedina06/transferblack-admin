import { useQuery } from '@tanstack/react-query';
import { getDrivers } from '../../../core/drivers/actions/getDrivers.action';

/**
 * No existe un endpoint que liste choferes aprobados con vehiculo (el
 * panel solo tiene `/admin/applications`): se usa ese listado filtrado por
 * `status=approved` como selector de chofer reservado. El backend sigue
 * validando `DRIVER_NOT_APPROVED` / `DRIVER_WITHOUT_VEHICLE` al confirmar.
 */
export const useApprovedDrivers = (search: string) => {
  return useQuery({
    queryKey: ['scheduled-trips-approved-drivers', search],
    queryFn: () => getDrivers({ page: 1, limit: 50, status: 'approved', search: search || undefined }),
    staleTime: 1000 * 30,
  });
};
