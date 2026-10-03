import React from 'react';
import { TripTrackingMap } from '../../tracking/components/TripTrackingMap';
import type { ScheduledTripPoint } from '../../../core/scheduledTrips/scheduledTrip.api';
import type { ScheduledTripPointFormValues } from '../../../core/scheduledTrips/scheduledTrip.api';

interface RouteMapPreviewProps {
  origin: ScheduledTripPoint | ScheduledTripPointFormValues | null;
  destination: ScheduledTripPoint | ScheduledTripPointFormValues | null;
}

/** Vista previa de origen/destino reutilizando el mapa de seguimiento, sin chofer ni ruta calculada. */
export const RouteMapPreview: React.FC<RouteMapPreviewProps> = ({ origin, destination }) => {
  return (
    <div className="h-56 w-full overflow-hidden rounded-lg border border-gray-200 dark:border-dark-border">
      <TripTrackingMap
        origin={origin ? { addressText: origin.address, latitude: origin.lat, longitude: origin.lng } : null}
        destination={
          destination ? { addressText: destination.address, latitude: destination.lat, longitude: destination.lng } : null
        }
        driverLocation={null}
        route={null}
      />
    </div>
  );
};
