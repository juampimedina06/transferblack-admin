import { adminApi } from '../../api/adminApi';
import type { GetDriversFilters, PaginatedDriversResponse } from '../interfaces/driver.interface';

export const getDrivers = async (filters: GetDriversFilters): Promise<PaginatedDriversResponse> => {
  const { data } = await adminApi.get<PaginatedDriversResponse>('/admin/applications', {
    params: filters,
  });
  return data;
};
