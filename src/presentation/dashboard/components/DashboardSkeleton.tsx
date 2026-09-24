import React from 'react';
import { KpiCard } from './KpiCard';

export const DashboardSkeleton: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="Total de viajes" value="-" isLoading />
        <KpiCard label="Facturación bruta" value="-" isLoading />
        <KpiCard label="Comisión neta de plataforma" value="-" isLoading />
        <KpiCard label="Ratio de cancelaciones" value="-" isLoading />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="col-span-1 lg:col-span-2 h-96 bg-gray-100 rounded-xl animate-pulse" />
        <div className="col-span-1 h-96 bg-gray-100 rounded-xl animate-pulse flex items-center justify-center">
          <span className="text-gray-400 font-medium">Próximamente</span>
        </div>
      </div>
    </div>
  );
};
