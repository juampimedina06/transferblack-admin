import React, { useState, useMemo } from 'react';
import { X, Search, Star, Car, Check, Loader2, AlertCircle } from 'lucide-react';
import type { TripListItem } from '../../../core/trips/interfaces/trip.interface';
import type { DriverLocationFeature } from '../../../core/map/interfaces/live-map.interface';

interface Props {
  trip: TripListItem | null;
  isOpen: boolean;
  onClose: () => void;
  availableDrivers: DriverLocationFeature[];
  onAssign: (tripId: string, driverId: string, vehicleId?: string) => Promise<void>;
  isLoading?: boolean;
}

export const ManualAssignModal: React.FC<Props> = ({
  trip,
  isOpen,
  onClose,
  availableDrivers,
  onAssign,
  isLoading = false,
}) => {
  const [selectedDriverId, setSelectedDriverId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Filtrar solo conductores online y disponibles
  const onlineDrivers = useMemo(() => {
    return availableDrivers.filter(
      (feat) => feat.properties.availabilityStatus === 'online'
    );
  }, [availableDrivers]);

  // Búsqueda por nombre, patente o teléfono
  const filteredDrivers = useMemo(() => {
    if (!search.trim()) return onlineDrivers;
    const q = search.toLowerCase();
    return onlineDrivers.filter((feat) => {
      const p = feat.properties;
      return (
        p.fullName?.toLowerCase().includes(q) ||
        p.vehicle?.plate?.toLowerCase().includes(q) ||
        p.phone?.toLowerCase().includes(q)
      );
    });
  }, [onlineDrivers, search]);

  if (!isOpen || !trip) return null;

  const handleConfirm = async () => {
    if (!selectedDriverId) return;
    setErrorMsg(null);

    try {
      await onAssign(trip.id, selectedDriverId);
      onClose();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMsg(err.message);
      } else {
        setErrorMsg('Ocurrió un error al asignar el conductor.');
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-obsidian border border-gray-200 dark:border-white/10 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header del modal */}
        <div className="p-4 sm:p-5 border-b border-gray-200 dark:border-white/10 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-gray-900 dark:text-white">
              Asignar conductor manualmente
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Viaje {trip.publicCode || `TB-${trip.id.slice(0, 4)}`} ·{' '}
              {trip.passenger?.firstName} {trip.passenger?.lastName || ''} (
              {trip.serviceType?.name || 'Essential'})
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mensaje de error si la asignación falla */}
        {errorMsg && (
          <div className="mx-4 mt-4 p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/40 rounded-xl flex items-start gap-2.5 text-xs text-red-700 dark:text-red-300">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-red-500" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Buscador de conductores */}
        <div className="p-4 pb-2">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar conductor por nombre o patente..."
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-champagne-gold focus:border-champagne-gold transition-all"
            />
          </div>
        </div>

        {/* Lista de conductores online */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2 divide-y divide-gray-100 dark:divide-white/5">
          {filteredDrivers.length === 0 ? (
            <div className="p-8 text-center text-xs text-gray-500 dark:text-gray-400">
              No hay conductores en línea disponibles con esos filtros.
            </div>
          ) : (
            filteredDrivers.map((feat) => {
              const { driverId, fullName, ratingAverage, ratingCount, vehicle } =
                feat.properties;
              const isSelected = selectedDriverId === driverId;

              return (
                <div
                  key={driverId}
                  onClick={() => setSelectedDriverId(driverId)}
                  className={`pt-2.5 pb-2.5 px-3 rounded-xl cursor-pointer transition-all flex items-center justify-between gap-3 border ${
                    isSelected
                      ? 'bg-champagne-gold/10 dark:bg-champagne-gold/15 border-champagne-gold/50 shadow-sm'
                      : 'hover:bg-gray-50 dark:hover:bg-white/5 border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="relative w-9 h-9 rounded-full bg-neutral-900 text-champagne-gold flex items-center justify-center font-bold text-xs border border-champagne-gold/30">
                      {fullName ? fullName.slice(0, 2).toUpperCase() : 'CO'}
                      <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border border-neutral-900" />
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-gray-900 dark:text-white">
                          {fullName}
                        </span>
                        <div className="flex items-center gap-0.5 text-xs text-amber-500">
                          <Star className="w-3 h-3 fill-amber-500" />
                          <span>{ratingAverage ? ratingAverage.toFixed(1) : '5.0'}</span>
                          <span className="text-[10px] text-gray-400">({ratingCount || 0})</span>
                        </div>
                      </div>

                      {vehicle && (
                        <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                          <Car className="w-3 h-3" />
                          <span>
                            {vehicle.brand} {vehicle.model}
                          </span>
                          <span className="text-[10px] uppercase font-mono px-1 py-0.2 bg-gray-100 dark:bg-white/10 rounded">
                            {vehicle.plate}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div
                    className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${
                      isSelected
                        ? 'bg-champagne-gold border-champagne-gold text-neutral-950'
                        : 'border-gray-300 dark:border-white/20'
                    }`}
                  >
                    {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer con acciones */}
        <div className="p-4 border-t border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/[0.02] flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 text-xs font-semibold rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={handleConfirm}
            disabled={!selectedDriverId || isLoading}
            className="px-4 py-2 text-xs font-semibold rounded-xl bg-champagne-gold hover:bg-champagne-gold/90 text-neutral-950 shadow-md transition-all flex items-center gap-1.5 disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Asignando...</span>
              </>
            ) : (
              <span>Confirmar asignación</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
