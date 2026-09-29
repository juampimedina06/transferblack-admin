import { adminApi } from '../../api/adminApi';
import type { DriverDetailResponse } from '../interfaces/driver-detail.interface';

export const getDriverDetail = async (id: string): Promise<DriverDetailResponse> => {
  const { data } = await adminApi.get<DriverDetailResponse>(`/admin/applications/${id}`);
  return data;
};
