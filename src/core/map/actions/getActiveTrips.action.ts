import { adminApi } from '../../api/adminApi';
import type { PaginatedTripsResponse, TripListItem, TripStatus } from '../../trips/interfaces/trip.interface';

export const ACTIVE_TRIP_STATUSES: TripStatus[] = [
  'searching',
  'assigned',
  'driver_arriving',
  'driver_arrived',
  'in_progress',
];

export const getActiveTrips = async (): Promise<TripListItem[]> => {
  const params = new URLSearchParams();
  ACTIVE_TRIP_STATUSES.forEach((status) => {
    params.append('status', status);
  });
  params.append('limit', '50');
  params.append('sortBy', 'createdAt');
  params.append('sortOrder', 'desc');

  try {
    const response = await adminApi.get<PaginatedTripsResponse>('/admin/rides', { params });
    return response.data?.data || [];
  } catch (error) {
    // Si falla /admin/rides, intentamos fallback a /admin/trips
    try {
      const fallback = await adminApi.get<PaginatedTripsResponse>('/admin/trips', { params });
      return fallback.data?.data || [];
    } catch {
      throw error;
    }
  }
};
