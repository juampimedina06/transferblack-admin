import { adminApi } from '../../api/adminApi';
import type { ExpandRadiusPayload, ExpandRadiusResponse } from '../interfaces/live-map.interface';

export const expandRadius = async (payload: ExpandRadiusPayload): Promise<ExpandRadiusResponse> => {
  const { tripId, radiusMeters } = payload;
  const response = await adminApi.post<ExpandRadiusResponse>(
    `/admin/trips/${tripId}/expand-radius`,
    radiusMeters ? { radius_meters: radiusMeters } : {}
  );

  return response.data;
};
