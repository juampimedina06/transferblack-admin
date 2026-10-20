import { useMutation, useQueryClient } from '@tanstack/react-query';
import { runWeeklyBatch } from '../../../core/payouts/actions/payout.actions';
import type { RunWeeklyBatchPayload } from '../../../core/payouts/interfaces/payout.interface';

export const useRunWeeklyBatch = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: RunWeeklyBatchPayload = { force: true }) =>
      runWeeklyBatch(payload),
    onSuccess: () => {
      // Invalida todos los listados de retiros y los KPIs
      queryClient.invalidateQueries({ queryKey: ['admin-payouts'] });
      queryClient.invalidateQueries({ queryKey: ['admin-payouts-kpi'] });
    },
  });
};
