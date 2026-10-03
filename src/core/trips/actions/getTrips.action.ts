import { adminApi } from '../../api/adminApi';
import type { GetTripsFilters, PaginatedTripsResponse } from '../interfaces/trip.interface';

export const getTrips = async (filters: GetTripsFilters): Promise<PaginatedTripsResponse> => {
  const params = new URLSearchParams();

  if (filters.page) params.append('page', filters.page.toString());
  if (filters.limit) params.append('limit', filters.limit.toString());
  if (filters.search && filters.search.trim()) params.append('search', filters.search.trim());
  if (filters.dateFrom) params.append('dateFrom', filters.dateFrom);
  if (filters.dateTo) params.append('dateTo', filters.dateTo);
  if (filters.driverId) params.append('driverId', filters.driverId);
  if (filters.passengerId) params.append('passengerId', filters.passengerId);
  if (filters.bookingType) params.append('bookingType', filters.bookingType);
  if (filters.isThirdParty !== undefined) params.append('isThirdParty', String(filters.isThirdParty));
  if (filters.isCorporate !== undefined) params.append('isCorporate', String(filters.isCorporate));
  if (filters.sortBy) params.append('sortBy', filters.sortBy);
  if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);

  if (filters.status && filters.status.length > 0) {
    filters.status.forEach((st) => {
      params.append('status', st);
    });
  }

  const response = await adminApi.get<PaginatedTripsResponse>('/admin/rides', {
    params,
  });

  return response.data;
};
