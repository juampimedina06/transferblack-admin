import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface RefundClaimStatusBadgeProps {
  status: string;
  className?: string;
}

const STATUS_CONFIG: Record<string, { label: string; styles: string; dot: string }> = {
  claim_required: {
    label: 'Pendiente',
    styles:
      'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 dark:border dark:border-amber-800/40',
    dot: 'bg-amber-500 animate-pulse',
  },
  processed: {
    label: 'Reembolsado',
    styles:
      'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border dark:border-emerald-800/40',
    dot: 'bg-emerald-500',
  },
  failed: {
    label: 'Fallido',
    styles: 'bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-300 dark:border dark:border-red-800/40',
    dot: 'bg-red-500',
  },
};

export const RefundClaimStatusBadge: React.FC<RefundClaimStatusBadgeProps> = ({ status, className }) => {
  const config = STATUS_CONFIG[status] ?? {
    label: status,
    styles: 'bg-gray-100 text-gray-700 dark:bg-white/10 dark:text-gray-300',
    dot: 'bg-gray-400',
  };

  return (
    <span
      className={twMerge(
        clsx(
          'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium tracking-wide',
          config.styles,
        ),
        className,
      )}
    >
      <span className={clsx('w-1.5 h-1.5 rounded-full', config.dot)} />
      {config.label}
    </span>
  );
};
