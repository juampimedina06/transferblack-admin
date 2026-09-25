import React, { forwardRef } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { Loader2 } from 'lucide-react';
import { cn } from '../../utils/cn';

const buttonVariants = cva(
  'inline-flex items-center justify-center font-medium transition-all duration-200 select-none cursor-pointer disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-champagne-gold/50 focus-visible:ring-offset-1',
  {
    variants: {
      variant: {
        primary:
          'bg-[#1A1A1A] hover:bg-black text-white dark:bg-white dark:hover:bg-gray-100 dark:text-obsidian shadow-2xs hover:shadow-xs',
        secondary:
          'bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 dark:bg-dark-surface dark:hover:bg-white/5 dark:text-white/80 dark:border-dark-border shadow-2xs',
        gold:
          'bg-champagne-gold hover:bg-[#c5a030] text-obsidian font-semibold shadow-2xs hover:shadow-xs',
        danger:
          'bg-red-600 hover:bg-red-700 text-white dark:bg-red-500 dark:hover:bg-red-600 shadow-2xs',
        dangerOutline:
          'bg-white hover:bg-red-50 text-red-600 border border-red-200 dark:bg-transparent dark:border-red-500/30 dark:hover:bg-red-500/10 dark:text-red-400',
        success:
          'bg-emerald-600 hover:bg-emerald-700 text-white dark:bg-emerald-500 dark:hover:bg-emerald-600 shadow-2xs',
        successOutline:
          'bg-white hover:bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-transparent dark:border-emerald-500/30 dark:hover:bg-emerald-500/10 dark:text-emerald-400',
        warning:
          'bg-amber-600 hover:bg-amber-700 text-white dark:bg-amber-500 dark:hover:bg-amber-600 shadow-2xs',
        warningOutline:
          'bg-white hover:bg-amber-50 text-amber-700 border border-amber-200 dark:bg-transparent dark:border-amber-500/30 dark:hover:bg-amber-500/10 dark:text-amber-400',
        ghost:
          'bg-transparent hover:bg-gray-100 text-gray-700 dark:hover:bg-white/5 dark:text-white/80',
      },
      size: {
        sm: 'text-xs px-2.5 py-1.5 rounded gap-1.5',
        md: 'text-[13px] px-4 py-2.5 rounded gap-2',
        lg: 'text-sm px-5 py-3 rounded-md gap-2.5 font-semibold',
        icon: 'w-8 h-8 p-0 rounded flex items-center justify-center',
      },
      fullWidth: {
        true: 'w-full',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
      fullWidth: false,
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      fullWidth,
      isLoading = false,
      disabled,
      leftIcon,
      rightIcon,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(buttonVariants({ variant, size, fullWidth }), className)}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin shrink-0" />
        ) : (
          leftIcon && <span className="shrink-0">{leftIcon}</span>
        )}
        {children && <span>{children}</span>}
        {!isLoading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = 'Button';
