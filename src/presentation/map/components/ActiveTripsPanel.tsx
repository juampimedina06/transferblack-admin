import React, { useMemo } from 'react';
import { Clock, Users, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import type { TripListItem, TripStatus } from '../../../core/trips/interfaces/trip.interface';

interface Props {
  trips: TripListItem[];
  onSelectTrip?: (tripId: string) => void;
  onOpenManualAssign: (trip: TripListItem) => void;
  onExpandRadius: (tripId: string) => void;
  isExpandingRadiusTripId?: string | null;
}

function getStatusBadge(status: TripStatus) {
  switch (status) {
    case 'in_progress':
      return {
        label: 'En viaje',
        classes: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
      };
    case 'driver_arrived':
      return {
        label: 'Conductor llegó',
        classes: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      };
    case 'driver_arriving':
      return {
        label: 'Conductor en camino',
        classes: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
      };
    case 'assigned':
      return {
        label: 'Asignado',
        classes: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
      };
    case 'searching':
      return {
        label: 'Buscando conductor',
        classes: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
      };
    default:
      return {
        label: status,
        classes: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
      };
  }
}

function formatElapsed(createdAt: string): { text: string; isAlert: boolean } {
  const diffMs = Date.now() - new Date(createdAt).getTime();
  if (isNaN(diffMs) || diffMs < 0) return { text: 'Reciente', isAlert: false };

  const totalSec = Math.floor(diffMs / 1000);
  const min = Math.floor(totalSec / 60);
  const sec = totalSec % 60;

  const isAlert = min >= 3;
  const text = `${min}:${sec < 10 ? '0' : ''}${sec} min`;
  return { text, isAlert };
}

export const ActiveTripsPanel: React.FC<Props> = ({
  trips,
  onSelectTrip,
  onOpenManualAssign,
  onExpandRadius,
  isExpandingRadiusTripId,
}) => {
  // Separamos viajes asignados/en curso vs buscando conductor
  const { assignedTrips, searchingTrips } = useMemo(() => {
    const assigned: TripListItem[] = [];
    const searching: TripListItem[] = [];

    trips.forEach((t) => {
      if (t.status === 'searching') {
        searching.push(t);
      } else {
        assigned.push(t);
      }
    });

    return { assignedTrips: assigned, searchingTrips: searching };
  }, [trips]);

  return (
    <aside className="w-full lg:w-[380px] xl:w-[420px] flex-shrink-0 bg-white dark:bg-obsidian border border-gray-200 dark:border-white/10 rounded-xl flex flex-col h-full overflow-hidden shadow-sm">
      {/* Encabezado del panel */}
      <div className="p-4 border-b border-gray-200 dark:border-white/10 flex items-center justify-between">
        <div>
          <h2 className="font-bold text-base text-gray-900 dark:text-white">Viajes activos</h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            {assignedTrips.length} en curso · {searchingTrips.length} buscando
          </p>
        </div>
      </div>

      {/* Lista scrollable de tarjetas */}
      <div className="flex-1 overflow-y-auto divide-y divide-gray-100 dark:divide-white/5 scrollbar-thin">
        {trips.length === 0 ? (
          <div className="p-8 text-center text-sm text-gray-500 dark:text-gray-400">
            No hay viajes activos en este momento.
          </div>
        ) : (
          <>
            {/* 1. Viajes Asignados / En curso */}
            {assignedTrips.map((trip) => {
              const badge = getStatusBadge(trip.status);
              const passengerName = trip.passenger
                ? `${trip.passenger.firstName} ${trip.passenger.lastName || ''}`.trim()
                : 'Pasajero';
              const driverName = trip.driver
                ? `${trip.driver.firstName} ${trip.driver.lastName || ''}`.trim()
                : 'Sin conductor';
              const category = trip.serviceType?.name || 'Essential';

              return (
                <div
                  key={trip.id}
                  onClick={() => onSelectTrip?.(trip.id)}
                  className="p-3.5 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors cursor-pointer group"
                >
                  {/* Fila superior: Código, Badge de estado y tiempo */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-sm text-gray-900 dark:text-white">
                        {trip.publicCode || `TB-${trip.id.slice(0, 4)}`}
                      </span>
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded border uppercase tracking-wider ${badge.classes}`}
                      >
                        {badge.label}
                      </span>
                      {trip.thirdParty && (
                        <span title="Pedido para tercero" className="text-gray-400">
                          <Users className="w-3.5 h-3.5" />
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{Math.round((trip.estimatedDurationS || 600) / 60)} min</span>
                    </div>
                  </div>

                  {/* Fila nombres y categoría */}
                  <div className="mt-1.5 text-xs text-gray-800 dark:text-gray-200">
                    <span className="font-medium">{passengerName}</span>
                    <span className="text-gray-400 dark:text-gray-500 mx-1.5">·</span>
                    <span className="text-gray-600 dark:text-gray-300">{driverName}</span>
                    <span className="text-gray-400 dark:text-gray-500 mx-1.5">-</span>
                    <span className="text-champagne-gold font-medium">{category}</span>
                  </div>

                  {/* Fila direcciones */}
                  <div className="mt-1 flex items-center gap-1.5 text-[11px] text-gray-500 dark:text-gray-400 truncate">
                    <span className="truncate">{trip.originAddress || 'Origen'}</span>
                    <ArrowRight className="w-3 h-3 flex-shrink-0 text-gray-400" />
                    <span className="truncate">{trip.destinationAddress || 'Destino'}</span>
                  </div>
                </div>
              );
            })}

            {/* Separador de viajes sin asignar */}
            {searchingTrips.length > 0 && (
              <div className="px-4 py-2 bg-gray-50 dark:bg-white/[0.02] border-y border-gray-200 dark:border-white/10">
                <span className="text-[11px] font-bold tracking-wider uppercase text-gray-500 dark:text-gray-400">
                  Sin conductor asignado
                </span>
              </div>
            )}

            {/* 2. Viajes Buscando conductor con botones de acción */}
            {searchingTrips.map((trip) => {
              const badge = getStatusBadge(trip.status);
              const passengerName = trip.passenger
                ? `${trip.passenger.firstName} ${trip.passenger.lastName || ''}`.trim()
                : 'Pasajero';
              const category = trip.serviceType?.name || 'Essential';
              const { text: elapsedText, isAlert } = formatElapsed(trip.createdAt);
              const isExpanding = isExpandingRadiusTripId === trip.id;

              return (
                <div
                  key={trip.id}
                  className="p-3.5 bg-amber-50/30 dark:bg-amber-950/10 hover:bg-amber-50/60 dark:hover:bg-amber-950/20 transition-colors border-l-2 border-l-amber-500"
                >
                  {/* Fila superior: Código, Badge y Tiempo transcurrido */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-sm text-gray-900 dark:text-white">
                        {trip.publicCode || `TB-${trip.id.slice(0, 4)}`}
                      </span>
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded border uppercase tracking-wider ${badge.classes}`}
                      >
                        {badge.label}
                      </span>
                    </div>

                    <div
                      className={`flex items-center gap-1 text-xs font-semibold ${
                        isAlert
                          ? 'text-red-600 dark:text-red-400 animate-pulse'
                          : 'text-gray-600 dark:text-gray-400'
                      }`}
                    >
                      {isAlert && <AlertCircle className="w-3.5 h-3.5" />}
                      <span>{elapsedText}</span>
                    </div>
                  </div>

                  {/* Fila nombres */}
                  <div className="mt-1.5 text-xs text-gray-800 dark:text-gray-200">
                    <span className="font-medium">{passengerName}</span>
                    <span className="text-gray-400 dark:text-gray-500 mx-1.5">·</span>
                    <span className="text-amber-600 dark:text-amber-400 font-medium">
                      sin conductor
                    </span>
                    <span className="text-gray-400 dark:text-gray-500 mx-1.5">-</span>
                    <span className="text-champagne-gold font-medium">{category}</span>
                  </div>

                  {/* Fila direcciones */}
                  <div className="mt-1 flex items-center gap-1.5 text-[11px] text-gray-500 dark:text-gray-400 truncate">
                    <span className="truncate">{trip.originAddress || 'Origen'}</span>
                    <ArrowRight className="w-3 h-3 flex-shrink-0 text-gray-400" />
                    <span className="truncate">{trip.destinationAddress || 'Destino'}</span>
                  </div>

                  {/* Botones de acción manual */}
                  <div className="mt-3 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onOpenManualAssign(trip)}
                      className="flex-1 bg-neutral-900 hover:bg-neutral-800 dark:bg-white/10 dark:hover:bg-white/20 text-white text-xs font-semibold py-1.5 px-3 rounded-lg border border-white/10 shadow-sm transition-all text-center"
                    >
                      Asignar manualmente
                    </button>

                    <button
                      type="button"
                      onClick={() => onExpandRadius(trip.id)}
                      disabled={isExpanding}
                      className="flex-1 bg-white dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 text-gray-800 dark:text-gray-200 text-xs font-semibold py-1.5 px-3 rounded-lg border border-gray-300 dark:border-white/10 shadow-sm transition-all flex items-center justify-center gap-1 disabled:opacity-50"
                    >
                      {isExpanding ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Ampliando...</span>
                        </>
                      ) : (
                        <span>Ampliar radio</span>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </>
        )}
      </div>
    </aside>
  );
};
