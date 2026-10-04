import { adminApi } from '../../api/adminApi';
import type { AssignDriverPayload, AssignDriverResponse } from '../interfaces/live-map.interface';

export const assignDriver = async (payload: AssignDriverPayload): Promise<AssignDriverResponse> => {
  const { tripId, driverId, vehicleId } = payload;
  const response = await adminApi.post<AssignDriverResponse>(
    `/admin/trips/${tripId}/assign-driver`,
    {
      driver_id: driverId,
      ...(vehicleId ? { vehicle_id: vehicleId } : {}),
    }
  );

  return response.data;
};
