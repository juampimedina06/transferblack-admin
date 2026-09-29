import type { TripTracking, TripTrackingStatus } from '../../../core/tracking/interfaces/trip-tracking.interface';

interface StatusCopy {
  headline: string;
  description: string;
}

const STATUS_COPY: Record<TripTrackingStatus, StatusCopy> = {
  draft: {
    headline: 'Preparando el viaje',
    description: 'Todavía estamos confirmando los datos del viaje.',
  },
  scheduled: {
    headline: 'Viaje programado',
    description: 'Tu viaje está agendado y va a arrancar pronto.',
  },
  searching: {
    headline: 'Buscando un chofer',
    description: 'Estamos por asignarte un chofer disponible en la zona.',
  },
  assigned: {
    headline: 'Chofer asignado',
    description: 'Ya tenés chofer asignado. En breve sale hacia el punto de encuentro.',
  },
  driver_arriving: {
    headline: 'Tu chofer está en camino',
    description: 'Tu chofer va hacia el punto de encuentro.',
  },
  driver_arrived: {
    headline: 'Tu chofer llegó',
    description: 'Tu chofer te está esperando en el punto de encuentro.',
  },
  in_progress: {
    headline: 'Viaje en curso',
    description: 'El viaje está en marcha hacia el destino.',
  },
  completed: {
    headline: 'Viaje finalizado',
    description: '¡Gracias por viajar con Transfer Black!',
  },
  cancelled: {
    headline: 'Viaje cancelado',
    description: 'Este viaje fue cancelado y ya no está en curso.',
  },
};

export function getTripStatusCopy(status: TripTrackingStatus): StatusCopy {
  return STATUS_COPY[status];
}

// Orden de avance normal del viaje; `cancelled` queda afuera a proposito,
// porque no es un paso mas sino una salida del flujo.
const STATUS_ORDER: readonly TripTrackingStatus[] = [
  'draft',
  'scheduled',
  'searching',
  'assigned',
  'driver_arriving',
  'driver_arrived',
  'in_progress',
  'completed',
];

export interface TripTimelineStep {
  key: string;
  label: string;
  timestamp: string | null;
  isDone: boolean;
  isActive: boolean;
}

/** Pasos fijos del timeline publico: confirmado → asignado → en camino → llegó → en viaje → finalizado. */
export function buildTripTimeline(trip: TripTracking): TripTimelineStep[] {
  const currentIndex = STATUS_ORDER.indexOf(trip.status);

  const stepDefinitions: { key: string; label: string; status: TripTrackingStatus; timestamp: string | null }[] = [
    { key: 'confirmed', label: 'Confirmado', status: 'searching', timestamp: trip.confirmedAt },
    { key: 'assigned', label: 'Chofer asignado', status: 'assigned', timestamp: trip.assignedAt },
    { key: 'on_the_way', label: 'En camino', status: 'driver_arriving', timestamp: null },
    { key: 'arrived', label: 'Llegó', status: 'driver_arrived', timestamp: trip.driverArrivedAt },
    { key: 'in_progress', label: 'En viaje', status: 'in_progress', timestamp: trip.startedAt },
    { key: 'finished', label: 'Finalizado', status: 'completed', timestamp: trip.finishedAt },
  ];

  // Un viaje finalizado no tiene paso "en curso": el ultimo tambien queda hecho.
  const isFinished = trip.status === 'completed';

  return stepDefinitions.map(({ key, label, status, timestamp }) => {
    const stepIndex = STATUS_ORDER.indexOf(status);
    const isCurrent = currentIndex >= 0 && currentIndex === stepIndex;
    return {
      key,
      label,
      timestamp,
      isDone: (currentIndex >= 0 && currentIndex > stepIndex) || (isFinished && isCurrent),
      isActive: isCurrent && !isFinished,
    };
  });
}
