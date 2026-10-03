import React from 'react';
import { Plus, RotateCcw } from 'lucide-react';
import { Button } from '../../components/common';
import { scheduledTripStatuses, type ScheduledTripStatus } from '../../../core/scheduledTrips/scheduledTrip.api';

export interface ScheduledTripsFilterState {
  status: ScheduledTripStatus | '';
  from: string;
  to: string;
}

interface ScheduledTripsToolbarProps {
  filters: ScheduledTripsFilterState;
  onChange: (filters: ScheduledTripsFilterState) => void;
  onReset: () => void;
  onCreate: () => void;
}

const STATUS_LABELS: Record<ScheduledTripStatus, string> = {
  scheduled: 'Programado',
  searching: 'Buscando conductor',
  assigned: 'Asignado',
  driver_arriving: 'Conductor en camino',
  driver_arrived: 'Conductor llegó',
  in_progress: 'En viaje',
  completed: 'Completado',
  cancelled: 'Cancelado',
};

export const ScheduledTripsToolbar: React.FC<ScheduledTripsToolbarProps> = ({
  filters,
  onChange,
  onReset,
  onCreate,
}) => {
  return (
    <div className="flex flex-col gap-3.5 rounded-xl border border-gray-200/80 bg-white p-4 shadow-sm dark:border-dark-border dark:bg-dark-surface sm:flex-row sm:items-end sm:justify-between">
      <div className="grid flex-1 grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="space-y-1">
          <label className="text-[10.5px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
            Estado
          </label>
          <select
            value={filters.status}
            onChange={(e) => onChange({ ...filters, status: e.target.value as ScheduledTripStatus | '' })}
            className="w-full rounded-lg border border-gray-200 bg-gray-50/50 px-3 py-2 text-xs text-gray-800 focus:outline-none focus:ring-1 focus:ring-champagne-gold dark:border-dark-border dark:bg-dark-card dark:text-gray-200"
          >
            <option value="">Todos los estados</option>
            {scheduledTripStatuses.map((status) => (
              <option key={status} value={status}>
                {STATUS_LABELS[status]}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-[10.5px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
            Desde
          </label>
          <input
            type="date"
            value={filters.from}
            onChange={(e) => onChange({ ...filters, from: e.target.value })}
            className="w-full rounded-lg border border-gray-200 bg-gray-50/50 px-3 py-2 text-xs text-gray-800 focus:outline-none focus:ring-1 focus:ring-champagne-gold dark:border-dark-border dark:bg-dark-card dark:text-gray-200"
          />
        </div>

        <div className="space-y-1">
          <label className="text-[10.5px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
            Hasta
          </label>
          <input
            type="date"
            value={filters.to}
            onChange={(e) => onChange({ ...filters, to: e.target.value })}
            className="w-full rounded-lg border border-gray-200 bg-gray-50/50 px-3 py-2 text-xs text-gray-800 focus:outline-none focus:ring-1 focus:ring-champagne-gold dark:border-dark-border dark:bg-dark-card dark:text-gray-200"
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button type="button" variant="ghost" size="sm" leftIcon={<RotateCcw size={14} />} onClick={onReset}>
          Limpiar
        </Button>
        <Button type="button" variant="gold" size="sm" leftIcon={<Plus size={15} />} onClick={onCreate}>
          Nueva reserva
        </Button>
      </div>
    </div>
  );
};
