import React from 'react';
import { cn } from '../../utils/cn';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  noPadding?: boolean;
}

export const Card: React.FC<CardProps> = ({
  className,
  noPadding = false,
  children,
  ...props
}) => {
  return (
    <div
      className={cn(
        'bg-white dark:bg-obsidian border border-gray-200 dark:border-white/10 rounded-md shadow-sm dark:shadow-none transition-colors',
        !noPadding && 'p-6',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className,
  children,
  ...props
}) => {
  return (
    <div className={cn('flex justify-between items-center mb-4', className)} {...props}>
      {children}
    </div>
  );
};

export const CardTitle: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({
  className,
  children,
  ...props
}) => {
  return (
    <h2 className={cn('text-[15px] font-medium text-gray-800 dark:text-white', className)} {...props}>
      {children}
    </h2>
  );
};

export const CardContent: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className,
  children,
  ...props
}) => {
  return (
    <div className={cn('flex flex-col', className)} {...props}>
      {children}
    </div>
  );
};

export const CardFooter: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className,
  children,
  ...props
}) => {
  return (
    <div
      className={cn(
        'pt-4 mt-4 border-t border-gray-100 dark:border-white/5 flex items-center justify-between',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};
