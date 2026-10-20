import React from 'react';
import type { AdminPayoutStatus, AdminPayoutType } from '../../../core/payouts/interfaces/payout.interface';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Clock } from 'lucide-react';

interface PayoutBadgeProps {
  status: AdminPayoutStatus;
  className?: string;
}

export const PayoutBadge: React.FC<PayoutBadgeProps> = ({ status, className }) => {
  const getBadgeConfig = () => {
    switch (status) {
      case 'pending':
      case 'requested':
        return {
          label: 'Pendiente',
          styles:
            'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 dark:border dark:border-amber-800/40',
          dot: 'bg-amber-500 animate-pulse',
        };
      case 'processing':
      case 'approved':
        return {
          label: 'En proceso',
          styles:
            'bg-sky-100 text-sky-800 dark:bg-sky-950/40 dark:text-sky-300 dark:border dark:border-sky-800/40',
          dot: 'bg-sky-500',
        };
      case 'completed':
      case 'paid':
        return {
          label: 'Completado',
          styles:
            'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border dark:border-emerald-800/40',
          dot: 'bg-emerald-500',
        };
      case 'failed':
      case 'rejected':
        return {
          label: 'Rechazado',
          styles:
            'bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-300 dark:border dark:border-red-800/40',
          dot: 'bg-red-500',
        };
      default:
        return {
          label: status,
          styles: 'bg-gray-100 text-gray-700 dark:bg-white/10 dark:text-gray-300',
          dot: 'bg-gray-400',
        };
    }
  };

  const config = getBadgeConfig();

  return (
    <span
      className={twMerge(
        clsx(
          'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wide',
          config.styles
        ),
        className
      )}
    >
      <span className={clsx('w-1.5 h-1.5 rounded-full', config.dot)} />
      {config.label}
    </span>
  );
};

interface PayoutTypeBadgeProps {
  type?: AdminPayoutType | string | null;
  className?: string;
  showFeeLabel?: boolean;
}

export const PayoutTypeBadge: React.FC<PayoutTypeBadgeProps> = ({
  type,
  className,
  showFeeLabel = false,
}) => {
  const isWeekly = type === 'weekly';

  return (
    <span
      className={twMerge(
        clsx(
          'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-bold tracking-wide border',
          isWeekly
            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/50'
            : 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800/50'
        ),
        className
      )}
    >
      <span>{isWeekly ? 'Semanal' : 'Inmediato'}</span>
      {showFeeLabel && (
        <span className="opacity-80 font-normal">
          {isWeekly ? '(Sin fee)' : '($500 fee)'}
        </span>
      )}
    </span>
  );
};

interface PayoutOutsideHoursBadgeProps {
  className?: string;
}

export const PayoutOutsideHoursBadge: React.FC<PayoutOutsideHoursBadgeProps> = ({ className }) => {
  return (
    <span
      title="Solicitado fuera del horario hábil de procesamiento (8:00 a 20:00)"
      className={twMerge(
        'inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-200/90 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/50',
        className
      )}
    >
      <Clock className="w-3 h-3 text-amber-600 dark:text-amber-400 flex-shrink-0" />
      <span>Fuera de hora (8:00 - 20:00)</span>
    </span>
  );
};

