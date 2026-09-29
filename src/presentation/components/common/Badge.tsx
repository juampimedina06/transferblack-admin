import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../utils/cn';

const badgeVariants = cva(
  'inline-flex items-center gap-1.5 font-medium border transition-colors select-none',
  {
    variants: {
      variant: {
        default:
          'bg-gray-50 text-gray-600 border-gray-200 dark:bg-white/5 dark:text-white/70 dark:border-white/10',
        success:
          'bg-[#E6F4EA] text-[#137333] border-[#CEEAD6] dark:bg-green-900/30 dark:text-green-400 dark:border-green-800',
        danger:
          'bg-red-50 text-red-600 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800',
        warning:
          'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800',
        info:
          'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800',
        purple:
          'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800',
        gold:
          'bg-champagne-gold/10 text-[#9A7D3A] border-champagne-gold/30 dark:bg-champagne-gold/15 dark:text-champagne-gold dark:border-champagne-gold/30',
      },
      size: {
        sm: 'text-[10px] px-1.5 py-0.5 rounded',
        md: 'text-[11px] px-2.5 py-0.5 rounded-full',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'sm',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
  dot?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  className,
  variant,
  size,
  dot = false,
  children,
  ...props
}) => {
  return (
    <span className={cn(badgeVariants({ variant, size }), className)} {...props}>
      {dot && (
        <span
          className={cn(
            'w-1.5 h-1.5 rounded-full animate-pulse',
            variant === 'success' && 'bg-green-500',
            variant === 'danger' && 'bg-red-500',
            variant === 'warning' && 'bg-amber-500',
            variant === 'info' && 'bg-blue-500',
            variant === 'purple' && 'bg-purple-500',
            variant === 'gold' && 'bg-champagne-gold',
            (!variant || variant === 'default') && 'bg-gray-400'
          )}
        />
      )}
      {children}
    </span>
  );
};
