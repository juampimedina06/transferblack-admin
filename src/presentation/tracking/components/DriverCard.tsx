import { Star, Car } from 'lucide-react';
import type { TripTrackingDriver, TripTrackingVehicle } from '../../../core/tracking/interfaces/trip-tracking.interface';

interface Props {
  driver: TripTrackingDriver | null;
  vehicle: TripTrackingVehicle | null;
}

export const DriverCard: React.FC<Props> = ({ driver, vehicle }) => {
  if (!driver) {
    return (
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
          <Car className="w-5 h-5 text-gray-400" />
        </div>
        <p className="text-sm text-gray-500">Todavía no se asignó un chofer para este viaje.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex items-center justify-between gap-4">
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-12 h-12 rounded-full bg-obsidian flex items-center justify-center shrink-0 text-champagne-gold font-bold text-lg uppercase">
          {driver.firstName[0] ?? '·'}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-gray-900 truncate">{driver.firstName}</p>
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <Star className="w-3.5 h-3.5 text-champagne-gold fill-champagne-gold" />
            {driver.ratingAverage.toFixed(2)}
          </div>
          {vehicle && (
            <p className="text-xs text-gray-500 truncate">
              {vehicle.brand} {vehicle.model} · {vehicle.color}
            </p>
          )}
        </div>
      </div>

      {vehicle && (
        <div className="shrink-0 text-center bg-obsidian text-white rounded-lg px-3 py-2">
          <p className="text-[9px] uppercase tracking-wider text-gray-400 leading-none mb-1">Patente</p>
          <p className="text-base font-bold tracking-wider leading-none">{vehicle.plate}</p>
        </div>
      )}
    </div>
  );
};
