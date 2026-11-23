import { adminApi } from '../../api/adminApi';
import type {
  GetPassengersFilters,
  PaginatedPassengersResponse,
} from '../interfaces/passenger.interface';

export const getPassengers = async (
  filters: GetPassengersFilters,
): Promise<PaginatedPassengersResponse> => {
  const { data } = await adminApi.get<PaginatedPassengersResponse>('/admin/passengers', {
    params: filters,
  });
  return data;
};
