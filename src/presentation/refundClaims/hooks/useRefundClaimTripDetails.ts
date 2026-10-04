import { useQueries } from '@tanstack/react-query';
import { getTripDetail } from '../../../core/trips/actions/getTripDetail.action';
import type { TripDetail } from '../../../core/trips/interfaces/trip.interface';

/**
 * El listado de reclamos (`GET /admin/refund-claims`) no trae nombre/email
 * del pasajero ni si el viaje es reservado (solo `passenger_user_id` y
 * `trip_id`): se completa con el detalle de cada viaje, el mismo
 * `GET /rides/:tripId` que ya usa `TripDetailDrawer`. Los viajes de un
 * reclamo ya estan cancelados (dato estatico), por eso `staleTime` largo y
 * sin refetch en segundo plano.
 */
export function useRefundClaimTripDetails(tripIds: string[]) {
  const uniqueIds = Array.from(new Set(tripIds));

  const results = useQueries({
    queries: uniqueIds.map((tripId) => ({
      queryKey: ['admin-trip-detail', tripId],
      queryFn: () => getTripDetail(tripId),
      staleTime: 1000 * 60 * 5,
      retry: 1,
    })),
  });

  const detailsByTripId = new Map<string, TripDetail>();
  uniqueIds.forEach((tripId, index) => {
    const detail = results[index]?.data;
    if (detail) detailsByTripId.set(tripId, detail);
  });

  return {
    detailsByTripId,
    isLoading: results.some((result) => result.isLoading),
  };
}
