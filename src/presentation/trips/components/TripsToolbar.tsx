import React, { useState, useRef, useEffect } from 'react';
import { Search, ChevronDown, Check, Filter } from 'lucide-react';
import { DateRangeField } from '../../components/common/DateRangeField';
import { PersonPicker } from '../../components/common/PersonPicker';
import { toLocalISODate } from '../../utils/dates';
import { TRIP_STATUS_LABELS } from '../tripStatusLabels';
import type { TripStatus } from '../../../core/trips/interfaces/trip.interface';
import { TRIP_STATUSES } from '../../../core/trips/interfaces/trip.interface';

export interface TripsFilterState {
  startDate: string;
  endDate: string;
  status: TripStatus[];
  driverId: string;
  /** Nombre del conductor elegido, solo para mostrarlo (viaja en la URL). */
  driverLabel: string;
  passengerId: string;
  passengerLabel: string;
  search: string;
  quickFilter: 'none' | 'today' | 'scheduled' | 'third_party' | 'driver_cancelled' | 'corporate';
}

interface TripsToolbarProps {
  filters: TripsFilterState;
  onApplyFilters: (filters: TripsFilterState) => void;
  onResetFilters: () => void;
}


export const TripsToolbar: React.FC<TripsToolbarProps> = ({
  filters,
  onApplyFilters,
  onResetFilters,
}) => {
  const [localFilters, setLocalFilters] = useState<TripsFilterState>(filters);
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
  const statusRef = useRef<HTMLDivElement>(null);

  // Sync state when props change
  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  // Click outside to close popovers
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (statusRef.current && !statusRef.current.contains(event.target as Node)) {
        setIsStatusDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleToggleStatus = (st: TripStatus) => {
    const exists = localFilters.status.includes(st);
    const updated = exists
      ? localFilters.status.filter((s) => s !== st)
      : [...localFilters.status, st];

    setLocalFilters((prev) => ({ ...prev, status: updated }));
  };

  const handleQuickFilterClick = (filterKey: TripsFilterState['quickFilter']) => {
    if (localFilters.quickFilter === filterKey) {
      // Toggle off
      const next = { ...localFilters, quickFilter: 'none' as const };
      setLocalFilters(next);
      onApplyFilters(next);
    } else {
      let next = { ...localFilters, quickFilter: filterKey };
      if (filterKey === 'today') {
        // Dia local: con toISOString() despues de las 21 h ya era mañana.
        const todayStr = toLocalISODate(new Date());
        next.startDate = todayStr;
        next.endDate = todayStr;
      }
      setLocalFilters(next);
      onApplyFilters(next);
    }
  };

  // Fechas, conductor y pasajero se aplican al elegirlos, sin tocar "Aplicar".
  const applyNow = (next: TripsFilterState) => {
    setLocalFilters(next);
    onApplyFilters(next);
  };

  const handleApply = () => {
    onApplyFilters(localFilters);
  };

  const handleClear = () => {
    onResetFilters();
  };

  // Render status summary inside the dropdown trigger
  const renderStatusSummary = () => {
    if (localFilters.status.length === 0) {
      return <span className="text-gray-400 text-xs">Todos los estados</span>;
    }

    const firstTwo = localFilters.status.slice(0, 2);
    const extraCount = localFilters.status.length - 2;

    return (
      <div className="flex items-center gap-1 overflow-hidden">
        {firstTwo.map((st) => (
          <span
            key={st}
            className="px-1.5 py-0.5 text-[11px] rounded bg-gray-100 dark:bg-white/10 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-white/10 whitespace-nowrap"
          >
            {TRIP_STATUS_LABELS[st]}
          </span>
        ))}
        {extraCount > 0 && (
          <span className="text-[11px] font-semibold text-gray-500">+{extraCount}</span>
        )}
      </div>
    );
  };

  return (
    <div className="bg-white dark:bg-dark-surface rounded-xl border border-gray-200/80 dark:border-dark-border p-4 shadow-sm space-y-3.5 transition-colors">
      {/* Top Filter Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 items-end">
        <DateRangeField
          label="Rango de fechas"
          start={localFilters.startDate}
          end={localFilters.endDate}
          onChange={({ start, end }) => applyNow({ ...localFilters, startDate: start, endDate: end, quickFilter: 'none' })}
        />

        {/* Status Multi-Select */}
        <div className="space-y-1 relative" ref={statusRef}>
          <label className="text-[10.5px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
            Estado
          </label>
          <button
            type="button"
            onClick={() => setIsStatusDropdownOpen(!isStatusDropdownOpen)}
            className="w-full flex items-center justify-between px-3 py-2 text-xs border border-gray-200 dark:border-dark-border rounded-lg bg-gray-50/50 dark:bg-dark-card hover:bg-gray-50 dark:hover:bg-white/5 transition-colors text-gray-800 dark:text-gray-200"
          >
            <div className="truncate">{renderStatusSummary()}</div>
            <ChevronDown className="w-3.5 h-3.5 text-gray-400 shrink-0 ml-1" />
          </button>

          {isStatusDropdownOpen && (
            <div className="absolute left-0 mt-1.5 w-64 bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border rounded-lg shadow-xl p-2 z-50 max-h-64 overflow-y-auto space-y-1">
              <div className="flex items-center justify-between px-2 py-1 border-b border-gray-100 dark:border-dark-border">
                <span className="text-[11px] font-bold text-gray-600 dark:text-gray-300">Filtrar por estado</span>
                {localFilters.status.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setLocalFilters((prev) => ({ ...prev, status: [] }))}
                    className="text-[10px] text-champagne-gold hover:underline"
                  >
                    Borrar selección
                  </button>
                )}
              </div>
              {TRIP_STATUSES.map((st) => {
                const checked = localFilters.status.includes(st);
                return (
                  <button
                    type="button"
                    key={st}
                    onClick={() => handleToggleStatus(st)}
                    className="w-full flex items-center justify-between px-2 py-1.5 text-xs rounded hover:bg-gray-50 dark:hover:bg-white/5 text-gray-700 dark:text-gray-200 transition-colors text-left"
                  >
                    <span>{TRIP_STATUS_LABELS[st]}</span>
                    {checked && <Check className="w-3.5 h-3.5 text-champagne-gold shrink-0" />}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <PersonPicker
          label="Conductor"
          kind="driver"
          value={localFilters.driverId ? { id: localFilters.driverId, label: localFilters.driverLabel || 'Conductor elegido' } : null}
          onChange={(person) => applyNow({ ...localFilters, driverId: person?.id ?? '', driverLabel: person?.label ?? '' })}
        />

        <PersonPicker
          label="Pasajero"
          kind="passenger"
          value={localFilters.passengerId ? { id: localFilters.passengerId, label: localFilters.passengerLabel || 'Pasajero elegido' } : null}
          onChange={(person) => applyNow({ ...localFilters, passengerId: person?.id ?? '', passengerLabel: person?.label ?? '' })}
        />

        {/* Free Search */}
        <div className="space-y-1">
          <label className="text-[10.5px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
            Búsqueda libre
          </label>
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Código, calle, pasajero..."
              value={localFilters.search}
              onChange={(e) => setLocalFilters((prev) => ({ ...prev, search: e.target.value }))}
              onKeyDown={(e) => e.key === 'Enter' && handleApply()}
              className="w-full pl-8 pr-3 py-2 text-xs border border-gray-200 dark:border-dark-border rounded-lg bg-gray-50/50 dark:bg-dark-card text-gray-800 dark:text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-champagne-gold transition-colors"
            />
          </div>
        </div>
      </div>

      {/* Buttons & Quick Filter Pills */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-gray-100 dark:border-dark-border">
        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleApply}
            className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-obsidian text-white hover:bg-black/90 dark:bg-white dark:text-obsidian dark:hover:bg-gray-100 transition-colors shadow-sm"
          >
            Aplicar
          </button>
          <button
            type="button"
            onClick={handleClear}
            className="px-2 py-1.5 text-xs font-medium text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
          >
            Limpiar
          </button>
        </div>

        {/* Quick Filter Pills */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[11px] font-medium text-gray-400 flex items-center gap-1 mr-1">
            <Filter className="w-3 h-3" /> Filtros rápidos:
          </span>

          <button
            type="button"
            onClick={() => handleQuickFilterClick('today')}
            className={`px-2.5 py-1 text-xs rounded-full border transition-all ${
              localFilters.quickFilter === 'today'
                ? 'bg-amber-100/70 border-amber-300 text-amber-900 font-semibold dark:bg-amber-950/60 dark:border-amber-600 dark:text-amber-200'
                : 'bg-gray-50 dark:bg-dark-card border-gray-200 dark:border-dark-border text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5'
            }`}
          >
            Hoy
          </button>

          <button
            type="button"
            onClick={() => handleQuickFilterClick('scheduled')}
            className={`px-2.5 py-1 text-xs rounded-full border transition-all ${
              localFilters.quickFilter === 'scheduled'
                ? 'bg-amber-100/70 border-amber-300 text-amber-900 font-semibold dark:bg-amber-950/60 dark:border-amber-600 dark:text-amber-200'
                : 'bg-gray-50 dark:bg-dark-card border-gray-200 dark:border-dark-border text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5'
            }`}
          >
            Programados
          </button>

          <button
            type="button"
            onClick={() => handleQuickFilterClick('third_party')}
            className={`px-2.5 py-1 text-xs rounded-full border transition-all ${
              localFilters.quickFilter === 'third_party'
                ? 'bg-amber-100/70 border-amber-300 text-amber-900 font-semibold dark:bg-amber-950/60 dark:border-amber-600 dark:text-amber-200'
                : 'bg-gray-50 dark:bg-dark-card border-gray-200 dark:border-dark-border text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5'
            }`}
          >
            Para terceros
          </button>

          <button
            type="button"
            onClick={() => handleQuickFilterClick('driver_cancelled')}
            className={`px-2.5 py-1 text-xs rounded-full border transition-all ${
              localFilters.quickFilter === 'driver_cancelled'
                ? 'bg-amber-100/70 border-amber-300 text-amber-900 font-semibold dark:bg-amber-950/60 dark:border-amber-600 dark:text-amber-200'
                : 'bg-gray-50 dark:bg-dark-card border-gray-200 dark:border-dark-border text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5'
            }`}
          >
            Cancelados por el conductor
          </button>

          <button
            type="button"
            onClick={() => handleQuickFilterClick('corporate')}
            className={`px-2.5 py-1 text-xs rounded-full border transition-all ${
              localFilters.quickFilter === 'corporate'
                ? 'bg-amber-100/70 border-amber-300 text-amber-900 font-semibold dark:bg-amber-950/60 dark:border-amber-600 dark:text-amber-200'
                : 'bg-gray-50 dark:bg-dark-card border-gray-200 dark:border-dark-border text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5'
            }`}
          >
            Corporativos
          </button>
        </div>
      </div>
    </div>
  );
};
