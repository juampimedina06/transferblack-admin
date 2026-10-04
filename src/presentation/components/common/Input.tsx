import React, { forwardRef, useId } from 'react';
import { cn } from '../../utils/cn';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  containerClassName?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      label,
      error,
      helperText,
      leftIcon,
      rightIcon,
      containerClassName,
      id,
      disabled,
      ...props
    },
    ref
  ) => {
    const generatedId = useId();
    const inputId = id || generatedId;

    return (
      <div className={cn('flex flex-col gap-1 w-full', containerClassName)}>
        {label && (
          <label
            htmlFor={inputId}
            className="text-gray-700 dark:text-gray-300 text-[11px] font-semibold uppercase tracking-wider block"
          >
            {label}
          </label>
        )}

        <div className="relative flex items-center">
          {leftIcon && (
            <div className="absolute left-3 text-gray-400 dark:text-gray-500 pointer-events-none flex items-center justify-center">
              {leftIcon}
            </div>
          )}

          <input
            ref={ref}
            id={inputId}
            disabled={disabled}
            className={cn(
              'w-full bg-white dark:bg-dark-surface border rounded-lg px-3 py-2 text-[13px] text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 transition-colors focus:outline-none focus:ring-1 disabled:opacity-50 disabled:cursor-not-allowed shadow-2xs',
              leftIcon && 'pl-9',
              rightIcon && 'pr-9',
              error
                ? 'border-red-400 dark:border-red-500/60 focus:border-red-500 focus:ring-red-500/30'
                : 'border-gray-300 dark:border-dark-border focus:border-champagne-gold dark:focus:border-champagne-gold focus:ring-champagne-gold/30',
              className
            )}
            {...props}
          />

          {rightIcon && (
            <div className="absolute right-3 text-gray-400 dark:text-white/40 flex items-center justify-center">
              {rightIcon}
            </div>
          )}
        </div>

        {error && (
          <p className="text-red-500 dark:text-red-400 text-xs mt-0.5 animate-in fade-in">
            {error}
          </p>
        )}

        {!error && helperText && (
          <p className="text-gray-400 dark:text-white/40 text-[11px] mt-0.5">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
