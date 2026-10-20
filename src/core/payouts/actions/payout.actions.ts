import { adminApi } from '../../api/adminApi';
import type {
  AdminPayoutFilters,
  AdminPayoutsListResponse,
  AdminPayoutDetailResponse,
  AdminResolvePayoutPayload,
  AdminPayoutItem,
  RunWeeklyBatchPayload,
  RunWeeklyBatchResponse,
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

export const runWeeklyBatch = async (
  payload: RunWeeklyBatchPayload = { force: true }
): Promise<RunWeeklyBatchResponse> => {
  const { data } = await adminApi.post<RunWeeklyBatchResponse>(
    '/admin/payouts/run-weekly-batch',
    payload
  );
  return data;
};

