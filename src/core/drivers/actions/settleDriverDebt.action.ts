import { adminApi } from '../../api/adminApi';
import type {
  DriverWalletSummary,
  SettleDriverDebtPayload,
  SettleDriverDebtResponse,
} from '../interfaces/driver-wallet.interface';

export const settleDriverDebt = async (
  driverId: string,
  payload: SettleDriverDebtPayload,
  idempotencyKey: string,
): Promise<DriverWalletSummary> => {
  const { data } = await adminApi.post<SettleDriverDebtResponse>(
    `/admin/wallets/${driverId}/settlements`,
    payload,
    {
      headers: {
        'Idempotency-Key': idempotencyKey,
      },
    },
  );
  return data.data;
};
