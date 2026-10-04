import React from 'react';
import clsx from 'clsx';
import type { RecurringTripStatus, RecurringCycleStatus } from '../../../core/recurringTrips/recurringTrip.interface';

interface RecurringTripBadgeProps {
  status: RecurringTripStatus;
  className?: string;
}

export const RecurringTripBadge: React.FC<RecurringTripBadgeProps> = ({ status, className }) => {
  const config: Record<RecurringTripStatus, { label: string; bg: string; text: string; dot: string }> = {
    active: {
      label: 'Activo',
      bg: 'bg-emerald-500/10 border-emerald-500/20',
      text: 'text-emerald-600 dark:text-emerald-400',
      dot: 'bg-emerald-500',
    },
    paused: {
      label: 'Pausado',
      bg: 'bg-amber-500/10 border-amber-500/20',
      text: 'text-amber-600 dark:text-amber-400',
      dot: 'bg-amber-500',
    },
    cancelled: {
      label: 'Cancelado',
      bg: 'bg-rose-500/10 border-rose-500/20',
      text: 'text-rose-600 dark:text-rose-400',
      dot: 'bg-rose-500',
    },
  };

  const current = config[status] ?? config.active;

  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border transition-colors',
        current.bg,
        current.text,
        className
      )}
    >
      <span className={clsx('w-1.5 h-1.5 rounded-full', current.dot)} />
      {current.label}
    </span>
  );
};

interface RecurringCycleBadgeProps {
  status: RecurringCycleStatus;
  className?: string;
}

export const RecurringCycleBadge: React.FC<RecurringCycleBadgeProps> = ({ status, className }) => {
  const config: Record<RecurringCycleStatus, { label: string; bg: string; text: string }> = {
    pending_payment: {
      label: 'Pendiente de cobro',
      bg: 'bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400',
      text: 'text-amber-600 dark:text-amber-400',
    },
    paid: {
      label: 'Cobrado',
      bg: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400',
      text: 'text-emerald-600 dark:text-emerald-400',
    },
    expired: {
      label: 'Vencido',
      bg: 'bg-gray-500/10 border-gray-500/20 text-gray-500 dark:text-gray-400',
      text: 'text-gray-500 dark:text-gray-400',
    },
    cancelled: {
      label: 'Cancelado',
      bg: 'bg-rose-500/10 border-rose-500/20 text-rose-600 dark:text-rose-400',
      text: 'text-rose-600 dark:text-rose-400',
    },
  };

  const current = config[status] ?? config.pending_payment;

  return (
    <span
      className={clsx(
        'inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium border',
        current.bg,
        className
      )}
    >
      {current.label}
    </span>
  );
};
