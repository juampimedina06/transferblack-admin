import React from 'react';

interface KpiCardProps {
  label: string;
  value: React.ReactNode;
  isLoading?: boolean;
  badge?: React.ReactNode;
  footer?: React.ReactNode;
}

export const KpiCard: React.FC<KpiCardProps> = ({ label, value, isLoading, badge, footer }) => {
  return (
    <div className="bg-white dark:bg-dark-surface rounded-xl p-4 sm:p-5 border border-gray-100 dark:border-dark-border shadow-sm flex flex-col justify-between transition-colors">
      <h3 className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
        {label}
      </h3>
      
      {isLoading ? (
        <div className="h-8 w-24 bg-gray-200 dark:bg-white/10 animate-pulse rounded my-0.5" />
      ) : (
        <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white my-0.5">
          {value}
        </p>
      )}

      {(footer || badge) && (
        <div className="mt-2.5 flex items-center gap-1.5 text-xs">
          {footer || badge}
        </div>
      )}
    </div>
  );
};
