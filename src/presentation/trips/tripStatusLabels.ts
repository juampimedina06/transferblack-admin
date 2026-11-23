import type { TripStatus } from '../../core/trips/interfaces/trip.interface';

/** Nombre de cada estado del viaje como lo lee el operador. */
export const TRIP_STATUS_LABELS: Record<TripStatus, string> = {
  in_progress: 'En viaje',
  completed: 'Completado',
  cancelled: 'Cancelado',
  driver_arrived: 'Conductor llegó',
  driver_arriving: 'Conductor en camino',
  assigned: 'Asignado',
  searching: 'Buscando conductor',
  scheduled: 'Programado',
  draft: 'Borrador',
};

