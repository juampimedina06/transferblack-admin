import { adminApi } from '../../api/adminApi';
import type { FleetGeoJsonResponse } from '../interfaces/live-map.interface';

export const getFleetLocations = async (status: 'online' | 'in_trip' | 'all' = 'all'): Promise<FleetGeoJsonResponse> => {
  const response = await adminApi.get<FleetGeoJsonResponse>('/admin/locations', {
    params: {
      status,
      format: 'geojson',
      staleSeconds: 600,
    },
  });

  return response.data;
};
