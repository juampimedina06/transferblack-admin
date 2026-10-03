import { useQuery } from '@tanstack/react-query';
import { getPayoutById } from '../../../core/payouts/actions/payout.actions';

export const usePayoutDetail = (payoutId: string | null | undefined) => {
  return useQuery({
    queryKey: ['admin-payout', payoutId],
    queryFn: () => {
      if (!payoutId) throw new Error('Payout ID requerido');
      return getPayoutById(payoutId);
    },
    enabled: Boolean(payoutId),
    staleTime: 1000 * 60, // 1 minuto
  });
};
