import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getDriverWallet } from '../../../core/drivers/actions/getDriverWallet.action';
import { settleDriverDebt } from '../../../core/drivers/actions/settleDriverDebt.action';
import type { SettleDriverDebtPayload } from '../../../core/drivers/interfaces/driver-wallet.interface';

export const useDriverWallet = (driverId: string) => {
  const queryClient = useQueryClient();

  const walletQuery = useQuery({
    queryKey: ['driver-wallet', driverId],
    queryFn: () => getDriverWallet(driverId, { page: 1, limit: 10 }),
    enabled: !!driverId,
    staleTime: 1000 * 15,
  });

  const settleDebtMutation = useMutation({
    mutationFn: ({
      payload,
      idempotencyKey,
    }: {
      payload: SettleDriverDebtPayload;
      idempotencyKey: string;
    }) => settleDriverDebt(driverId, payload, idempotencyKey),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['driver-wallet', driverId] });
      queryClient.invalidateQueries({ queryKey: ['driver-detail', driverId] });
    },
  });

  return {
    walletQuery,
    settleDebtMutation,
  };
};
