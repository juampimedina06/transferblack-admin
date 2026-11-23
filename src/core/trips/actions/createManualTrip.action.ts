import { adminApi } from '../../api/adminApi';
import type { ScheduledTripPointFormValues } from '../../scheduledTrips/scheduledTrip.api';

export interface ManualTripResult {
  trip_id: string;
  public_code: string;
}

const toRoutePoint = (point: ScheduledTripPointFormValues) => ({
  address_text: point.address,
  // El backend exige un place_id; una coordenada cargada a mano no tiene uno de Google.
  place_id: point.place_id ?? `manual:${point.lat},${point.lng}`,
  latitude: point.lat,
  longitude: point.lng,
});

/** Viaje inmediato en efectivo para un pasajero existente (`POST /admin/trips`). */
export const createManualTrip = async (input: {
  passengerUserId: string;
  origin: ScheduledTripPointFormValues;
  destination: ScheduledTripPointFormValues;
}): Promise<ManualTripResult> => {
  const { data } = await adminApi.post<{ data: ManualTripResult }>('/admin/trips', {
    passenger_user_id: input.passengerUserId,
    origin: toRoutePoint(input.origin),
    destination: toRoutePoint(input.destination),
  });
  return data.data;
};
