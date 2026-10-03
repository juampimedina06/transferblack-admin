import React, { useState, useRef, useEffect } from 'react';
import { Calendar, Search, ChevronDown, Check, Filter } from 'lucide-react';
import type { TripStatus } from '../../../core/trips/interfaces/trip.interface';
import { TRIP_STATUSES } from '../../../core/trips/interfaces/trip.interface';

export interface TripsFilterState {
  startDate: string;
  endDate: string;
  status: TripStatus[];
  driverId: string;
  passengerId: string;
  search: string;
  quickFilter: 'none' | 'today' | 'scheduled' | 'third_party' | 'driver_cancelled' | 'corporate';
}

interface TripsToolbarProps {
  filters: TripsFilterState;
  onApplyFilters: (filters: TripsFilterState) => void;
  onResetFilters: () => void;
}

const STATUS_LABELS: Record<TripStatus, string> = {
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

export const TripsToolbar: React.FC<TripsToolbarProps> = ({
  filters,
  onApplyFilters,
  onResetFilters,
}) => {
  const [localFilters, setLocalFilters] = useState<TripsFilterState>(filters);
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const statusRef = useRef<HTMLDivElement>(null);
  const dateRef = useRef<HTMLDivElement>(null);

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
      if (dateRef.current && !dateRef.current.contains(event.target as Node)) {
        setIsDatePickerOpen(false);
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
        const todayStr = new Date().toISOString().slice(0, 10);
        next.startDate = todayStr;
        next.endDate = todayStr;
      }
      setLocalFilters(next);
      onApplyFilters(next);
    }
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
            {STATUS_LABELS[st]}
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
        {/* Date Range */}
        <div className="space-y-1 relative" ref={dateRef}>
          <label className="text-[10.5px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
            Rango de Fechas
          </label>
          <button
            type="button"
            onClick={() => setIsDatePickerOpen(!isDatePickerOpen)}
            className="w-full flex items-center justify-between px-3 py-2 text-xs border border-gray-200 dark:border-dark-border rounded-lg bg-gray-50/50 dark:bg-dark-card hover:bg-gray-50 dark:hover:bg-white/5 transition-colors text-gray-800 dark:text-gray-200"
          >
            <div className="flex items-center gap-2 truncate">
              <Calendar className="w-3.5 h-3.5 text-gray-400 shrink-0" />
              <span className="truncate">
                {localFilters.startDate && localFilters.endDate
                  ? `${localFilters.startDate} — ${localFilters.endDate}`
                  : localFilters.startDate
                  ? `Desde ${localFilters.startDate}`
                  : 'Todas las fechas'}
              </span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-gray-400 shrink-0" />
          </button>

          {isDatePickerOpen && (
            <div className="absolute left-0 mt-1.5 w-72 bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border rounded-lg shadow-xl p-3 z-50 space-y-3">
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-gray-500">Desde</label>
                <input
                  type="date"
                  value={localFilters.startDate}
                  onChange={(e) => setLocalFilters((prev) => ({ ...prev, startDate: e.target.value }))}
                  className="w-full text-xs px-2.5 py-1.5 border border-gray-200 dark:border-dark-border rounded bg-gray-50 dark:bg-dark-card text-gray-800 dark:text-gray-200"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-gray-500">Hasta</label>
                <input
                  type="date"
                  value={localFilters.endDate}
                  onChange={(e) => setLocalFilters((prev) => ({ ...prev, endDate: e.target.value }))}
                  className="w-full text-xs px-2.5 py-1.5 border border-gray-200 dark:border-dark-border rounded bg-gray-50 dark:bg-dark-card text-gray-800 dark:text-gray-200"
                />
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-gray-100 dark:border-dark-border">
                <button
                  type="button"
                  onClick={() => {
                    setLocalFilters((prev) => ({ ...prev, startDate: '', endDate: '' }));
                    setIsDatePickerOpen(false);
                  }}
                  className="text-[11px] text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                >
                  Limpiar
                </button>
                <button
                  type="button"
                  onClick={() => setIsDatePickerOpen(false)}
                  className="px-2.5 py-1 text-[11px] bg-obsidian text-white rounded font-medium hover:bg-black/80"
                >
                  Listo
                </button>
              </div>
            </div>
          )}
        </div>

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
                    <span>{STATUS_LABELS[st]}</span>
                    {checked && <Check className="w-3.5 h-3.5 text-champagne-gold shrink-0" />}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Conductor Filter */}
        <div className="space-y-1">
          <label className="text-[10.5px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
            Conductor
          </label>
          <input
            type="text"
            placeholder="Todos (nombre o ID)"
            value={localFilters.driverId}
            onChange={(e) => setLocalFilters((prev) => ({ ...prev, driverId: e.target.value }))}
            className="w-full px-3 py-2 text-xs border border-gray-200 dark:border-dark-border rounded-lg bg-gray-50/50 dark:bg-dark-card text-gray-800 dark:text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-champagne-gold transition-colors"
          />
        </div>

        {/* Pasajero Filter */}
        <div className="space-y-1">
          <label className="text-[10.5px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
            Pasajero
          </label>
          <input
            type="text"
            placeholder="Todos (nombre o ID)"
            value={localFilters.passengerId}
            onChange={(e) => setLocalFilters((prev) => ({ ...prev, passengerId: e.target.value }))}
            className="w-full px-3 py-2 text-xs border border-gray-200 dark:border-dark-border rounded-lg bg-gray-50/50 dark:bg-dark-card text-gray-800 dark:text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-champagne-gold transition-colors"
          />
        </div>

        {/* Free Search */}
        <div className="space-y-1">
          <label className="text-[10.5px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
            Búsqueda Libre
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
