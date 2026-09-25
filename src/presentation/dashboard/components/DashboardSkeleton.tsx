import React from 'react';
import { KpiCard } from './KpiCard';

export const DashboardSkeleton: React.FC = () => {
  return (
    <div className="w-full flex flex-col gap-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="Total de viajes" value="-" isLoading />
        <KpiCard label="Facturación bruta" value="-" isLoading />
        <KpiCard label="Comisión neta de plataforma" value="-" isLoading />
        <KpiCard label="Ratio de cancelaciones" value="-" isLoading />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="col-span-1 lg:col-span-2 h-72 bg-gray-100 dark:bg-dark-surface rounded-xl animate-pulse border border-transparent dark:border-dark-border" />
        <div className="col-span-1 h-72 bg-gray-100 dark:bg-dark-surface rounded-xl animate-pulse flex items-center justify-center border border-transparent dark:border-dark-border">
          <span className="text-gray-400 dark:text-gray-500 font-medium">Próximamente</span>
        </div>
      </div>
    </div>
  );
};
