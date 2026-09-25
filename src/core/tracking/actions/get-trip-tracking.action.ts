import axios from 'axios';
import { publicApi } from '../../api/publicApi';
import {
  mapTripTracking,
  tripTrackingResponseApiSchema,
  TripTrackingError,
  type TripTracking,
  type TripTrackingApiErrorResponse,
} from '../interfaces/trip-tracking.interface';

export const getTripTrackingAction = async (token: string): Promise<TripTracking> => {
  try {
    const { data } = await publicApi.get(`/rides/track/${encodeURIComponent(token)}`);

    // Validamos que la data del backend cumpla el contrato antes de mapearla.
    const result = tripTrackingResponseApiSchema.safeParse(data);
    if (!result.success) {
      console.error('Error validando el contrato de /rides/track:', result.error);
      throw new TripTrackingError('No pudimos leer la información del viaje.');
    }

    return mapTripTracking(result.data.data);
  } catch (error: unknown) {
    if (error instanceof TripTrackingError) {
      throw error;
    }

    if (axios.isAxiosError<TripTrackingApiErrorResponse>(error)) {
      if (!error.response) {
        throw new TripTrackingError(
          'No pudimos conectarnos con el servidor. Revisá tu conexión.',
          undefined,
          'NETWORK_ERROR'
        );
      }

      const apiError = error.response.data?.error;
      throw new TripTrackingError(
        apiError?.message ?? 'No pudimos obtener el estado del viaje.',
        error.response.status,
        apiError?.code
      );
    }

    throw new TripTrackingError('No pudimos obtener el estado del viaje.');
  }
};
