import { useMutation, useQueryClient } from '@tanstack/react-query';
import { resolvePayout } from '../../../core/payouts/actions/payout.actions';
import type { AdminResolvePayoutPayload } from '../../../core/payouts/interfaces/payout.interface';

interface ResolvePayoutParams {
  payoutId: string;
  payload: AdminResolvePayoutPayload;
}

export const useResolvePayout = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ payoutId, payload }: ResolvePayoutParams) =>
      resolvePayout(payoutId, payload),
    onSuccess: (_, { payoutId }) => {
      // Invalida todos los listados de retiros y el detalle puntual
      queryClient.invalidateQueries({ queryKey: ['admin-payouts'] });
      queryClient.invalidateQueries({ queryKey: ['admin-payout', payoutId] });
      queryClient.invalidateQueries({ queryKey: ['admin-payouts-kpi'] });
    },
  });
};
