import { useQuery } from '@tanstack/react-query';
import { getPayouts } from '../../../core/payouts/actions/payout.actions';
import type { AdminPayoutFilters } from '../../../core/payouts/interfaces/payout.interface';

export const usePayouts = (filters: AdminPayoutFilters = {}) => {
  return useQuery({
    queryKey: ['admin-payouts', filters],
    queryFn: () => getPayouts(filters),
    staleTime: 1000 * 30, // 30 segundos
    refetchInterval: 15000, // Actualización automática en segundo plano
  });
};
