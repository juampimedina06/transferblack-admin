import React from 'react';
import type { AdminPayoutStatus } from '../../../core/payouts/interfaces/payout.interface';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface PayoutBadgeProps {
  status: AdminPayoutStatus;
  className?: string;
}

export const PayoutBadge: React.FC<PayoutBadgeProps> = ({ status, className }) => {
  const getBadgeConfig = () => {
    switch (status) {
      case 'requested':
        return {
          label: 'Pendiente',
          styles:
            'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 dark:border dark:border-amber-800/40',
        };
      case 'approved':
        return {
          label: 'En proceso',
          styles:
            'bg-sky-100 text-sky-800 dark:bg-sky-950/40 dark:text-sky-300 dark:border dark:border-sky-800/40',
        };
      case 'paid':
        return {
          label: 'Pagado',
          styles:
            'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border dark:border-emerald-800/40',
        };
      case 'rejected':
        return {
          label: 'Rechazado',
          styles:
            'bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-300 dark:border dark:border-red-800/40',
        };
      default:
        return {
          label: status,
          styles: 'bg-gray-100 text-gray-700 dark:bg-white/10 dark:text-gray-300',
        };
    }
  };

  const config = getBadgeConfig();

  return (
    <span
      className={twMerge(
        clsx(
          'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium tracking-wide',
          config.styles
        ),
        className
      )}
    >
      <span
        className={clsx('w-1.5 h-1.5 rounded-full', {
          'bg-amber-500 animate-pulse': status === 'requested',
          'bg-sky-500': status === 'approved',
          'bg-emerald-500': status === 'paid',
          'bg-red-500': status === 'rejected',
        })}
      />
      {config.label}
    </span>
  );
};
