import { adminApi } from '../../api/adminApi';
import type {
  AdminPayoutFilters,
  AdminPayoutsListResponse,
  AdminPayoutDetailResponse,
  AdminResolvePayoutPayload,
  AdminPayoutItem,
} from '../interfaces/payout.interface';

export const getPayouts = async (
  filters: AdminPayoutFilters = {}
): Promise<AdminPayoutsListResponse['data']> => {
  const { data } = await adminApi.get<AdminPayoutsListResponse>('/admin/payouts', {
    params: filters,
  });
  return data.data;
};

export const getPayoutById = async (payoutId: string): Promise<AdminPayoutItem> => {
  const { data } = await adminApi.get<AdminPayoutDetailResponse>(`/admin/payouts/${payoutId}`);
  return data.data;
};

export const resolvePayout = async (
  payoutId: string,
  payload: AdminResolvePayoutPayload
): Promise<AdminPayoutItem> => {
  const { data } = await adminApi.patch<AdminPayoutDetailResponse>(
    `/admin/payouts/${payoutId}`,
    payload
  );
  return data.data;
};
