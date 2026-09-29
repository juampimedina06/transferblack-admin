import { useQuery } from '@tanstack/react-query';
import { getTripTrackingAction } from '../../../core/tracking/actions/get-trip-tracking.action';
import {
  isTripTrackingTerminalStatus,
  TripTrackingError,
} from '../../../core/tracking/interfaces/trip-tracking.interface';

const POLL_INTERVAL_MS = 5000;

/**
 * Sondea el estado del viaje mientras esta activo. Deja de sondear cuando el
 * viaje llega a un estado terminal o el token ya no existe (404): en ambos
 * casos seguir consultando no tiene sentido. `refetchIntervalInBackground`
 * queda en su default (`false`), asi que se pausa con la pestaña oculta.
 */
export const useTripTracking = (token: string | null) => {
  return useQuery({
    queryKey: ['trip-tracking', token],
    queryFn: () => getTripTrackingAction(token as string),
    enabled: Boolean(token),
    staleTime: 0,
    retry: (failureCount, error) => {
      if (error instanceof TripTrackingError && error.status === 404) {
        return false;
      }
      return failureCount < 2;
    },
    refetchInterval: (query) => {
      const error = query.state.error;
      if (error instanceof TripTrackingError && error.status === 404) {
        return false;
      }

      const status = query.state.data?.status;
      if (status && isTripTrackingTerminalStatus(status)) {
        return false;
      }

      return POLL_INTERVAL_MS;
    },
  });
};
