import React, { forwardRef, useId } from 'react';
import { cn } from '../../utils/cn';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
  containerClassName?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      className,
      label,
      error,
      helperText,
      containerClassName,
      id,
      disabled,
      rows = 4,
      ...props
    },
    ref
  ) => {
    const generatedId = useId();
    const textareaId = id || generatedId;

    return (
      <div className={cn('flex flex-col gap-1 w-full', containerClassName)}>
        {label && (
          <label
            htmlFor={textareaId}
            className="text-gray-400 dark:text-white/40 text-[10px] font-semibold uppercase tracking-wider block"
          >
            {label}
          </label>
        )}

        <textarea
          ref={ref}
          id={textareaId}
          disabled={disabled}
          rows={rows}
          className={cn(
            'w-full bg-white dark:bg-white/5 border rounded-md p-3 text-[13px] text-gray-800 dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/30 transition-colors focus:outline-none focus:ring-1 disabled:opacity-50 disabled:cursor-not-allowed resize-none',
            error
              ? 'border-red-300 dark:border-red-500/50 focus:border-red-500 focus:ring-red-500/30'
              : 'border-gray-200 dark:border-white/10 focus:border-champagne-gold dark:focus:border-champagne-gold focus:ring-champagne-gold/20',
            className
          )}
          {...props}
        />

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

Textarea.displayName = 'Textarea';
