import React from 'react';
import type { DriverListItem } from '../../../core/drivers/interfaces/driver.interface';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface DriverBadgeProps {
  status: DriverListItem['approvalStatus'];
  className?: string;
}

export const DriverBadge: React.FC<DriverBadgeProps> = ({ status, className }) => {
  const getBadgeConfig = () => {
    switch (status) {
      case 'pending':
        return {
          label: 'Pendiente',
          styles: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-950/40 dark:text-yellow-400 dark:border dark:border-yellow-800/40',
        };
      case 'approved':
        return {
          label: 'Aprobado',
          styles: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border dark:border-emerald-800/40',
        };
      case 'rejected':
        return {
          label: 'Rechazado',
          styles: 'bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400 dark:border dark:border-red-800/40',
        };
      case 'suspended':
        return {
          label: 'Suspendido',
          styles: 'bg-gray-200 text-gray-700 dark:bg-white/10 dark:text-gray-300',
        };
      default:
        return {
          label: status,
          styles: 'bg-gray-100 text-gray-600 dark:bg-white/5 dark:text-gray-400',
        };
    }
  };

  const config = getBadgeConfig();

  return (
    <span
      className={twMerge(
        clsx(
          'inline-flex items-center px-2 py-1 rounded text-xs font-medium',
          config.styles
        ),
        className
      )}
      aria-label={`Estado: ${config.label}`}
    >
      {config.label}
    </span>
  );
};
