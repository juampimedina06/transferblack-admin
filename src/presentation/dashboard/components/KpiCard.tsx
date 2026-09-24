import React from 'react';

interface KpiCardProps {
  label: string;
  value: string | number;
  isLoading?: boolean;
}

export const KpiCard: React.FC<KpiCardProps> = ({ label, value, isLoading }) => {
  return (
    <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm flex flex-col justify-between">
      <h3 className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-2">
        {label}
      </h3>
      
      {isLoading ? (
        <div className="h-8 w-24 bg-gray-200 animate-pulse rounded my-1" />
      ) : (
        <p className="text-3xl font-bold text-gray-900 my-1">
          {value}
        </p>
      )}

      <div className="mt-3 flex items-center">
        <span className="text-[10px] uppercase font-semibold tracking-wider text-gray-400 bg-gray-100 px-2 py-0.5 rounded">
          Próximamente
        </span>
      </div>
    </div>
  );
};
