import { adminApi } from '../../api/adminApi';
import type {
  DriverWalletAdminData,
  DriverWalletAdminResponse,
} from '../interfaces/driver-wallet.interface';

export const getDriverWallet = async (
  driverId: string,
  params: { page?: number; limit?: number } = { page: 1, limit: 10 },
): Promise<DriverWalletAdminData> => {
  const { data } = await adminApi.get<DriverWalletAdminResponse>(`/admin/wallets/${driverId}`, {
    params,
  });
  return data.data;
};
