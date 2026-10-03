import React from 'react';
import type { TripStatus } from '../../../core/trips/interfaces/trip.interface';

interface TripsBadgeProps {
  status: TripStatus;
  className?: string;
}

const STATUS_CONFIG: Record<
  TripStatus,
  { label: string; bgLight: string; textLight: string; borderLight: string; bgDark: string; textDark: string; borderDark: string }
> = {
  in_progress: {
    label: 'En viaje',
    bgLight: 'bg-amber-50',
    textLight: 'text-amber-800',
    borderLight: 'border-amber-300',
    bgDark: 'dark:bg-amber-950/40',
    textDark: 'dark:text-amber-300',
    borderDark: 'dark:border-amber-700/60',
  },
  driver_arrived: {
    label: 'Conductor llegó',
    bgLight: 'bg-sky-50',
    textLight: 'text-sky-700',
    borderLight: 'border-sky-200',
    bgDark: 'dark:bg-sky-950/40',
    textDark: 'dark:text-sky-300',
    borderDark: 'dark:border-sky-700/60',
  },
  driver_arriving: {
    label: 'Conductor en camino',
    bgLight: 'bg-sky-50',
    textLight: 'text-sky-700',
    borderLight: 'border-sky-200',
    bgDark: 'dark:bg-sky-950/40',
    textDark: 'dark:text-sky-300',
    borderDark: 'dark:border-sky-700/60',
  },
  assigned: {
    label: 'Asignado',
    bgLight: 'bg-blue-50',
    textLight: 'text-blue-700',
    borderLight: 'border-blue-200',
    bgDark: 'dark:bg-blue-950/40',
    textDark: 'dark:text-blue-300',
    borderDark: 'dark:border-blue-700/60',
  },
  searching: {
    label: 'Buscando conductor',
    bgLight: 'bg-amber-50/80',
    textLight: 'text-amber-700',
    borderLight: 'border-amber-200',
    bgDark: 'dark:bg-amber-950/30',
    textDark: 'dark:text-amber-300',
    borderDark: 'dark:border-amber-700/40',
  },
  scheduled: {
    label: 'Programado',
    bgLight: 'bg-purple-50',
    textLight: 'text-purple-700',
    borderLight: 'border-purple-200',
    bgDark: 'dark:bg-purple-950/40',
    textDark: 'dark:text-purple-300',
    borderDark: 'dark:border-purple-700/60',
  },
  completed: {
    label: 'Completado',
    bgLight: 'bg-emerald-50',
    textLight: 'text-emerald-700',
    borderLight: 'border-emerald-200',
    bgDark: 'dark:bg-emerald-950/40',
    textDark: 'dark:text-emerald-300',
    borderDark: 'dark:border-emerald-700/60',
  },
  cancelled: {
    label: 'Cancelado',
    bgLight: 'bg-rose-50',
    textLight: 'text-rose-700',
    borderLight: 'border-rose-200',
    bgDark: 'dark:bg-rose-950/40',
    textDark: 'dark:text-rose-300',
    borderDark: 'dark:border-rose-700/60',
  },
  draft: {
    label: 'Borrador',
    bgLight: 'bg-gray-50',
    textLight: 'text-gray-700',
    borderLight: 'border-gray-200',
    bgDark: 'dark:bg-gray-800',
    textDark: 'dark:text-gray-300',
    borderDark: 'dark:border-gray-700',
  },
};

export const TripsBadge: React.FC<TripsBadgeProps> = ({ status, className = '' }) => {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.draft;

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium border ${config.bgLight} ${config.textLight} ${config.borderLight} ${config.bgDark} ${config.textDark} ${config.borderDark} transition-colors ${className}`}
    >
      {config.label}
    </span>
  );
};
