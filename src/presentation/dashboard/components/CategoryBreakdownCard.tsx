import React from 'react';
import type { CategoriaDesglose, TipoViajeDesglose } from '../../../core/dashboard/interfaces/dashboard-stats.interface';

interface CategoryBreakdownCardProps {
  categories?: CategoriaDesglose[];
  porTipoReserva?: TipoViajeDesglose[];
  isLoading?: boolean;
}

const MODALITY_COLORS: Record<string, { bar: string; dot: string }> = {
  immediate: { bar: 'bg-obsidian dark:bg-gray-100', dot: 'bg-obsidian dark:bg-gray-100' },
  scheduled: { bar: 'bg-champagne-gold', dot: 'bg-champagne-gold' },
};

const CATEGORY_COLORS = [
  { bar: 'bg-obsidian dark:bg-gray-100', dot: 'bg-obsidian dark:bg-gray-100' },
  { bar: 'bg-champagne-gold', dot: 'bg-champagne-gold' },
  { bar: 'bg-amber-600 dark:bg-amber-500', dot: 'bg-amber-600 dark:bg-amber-500' },
  { bar: 'bg-emerald-600 dark:bg-emerald-500', dot: 'bg-emerald-600 dark:bg-emerald-500' },
];

export const CategoryBreakdownCard: React.FC<CategoryBreakdownCardProps> = ({
  categories = [],
  porTipoReserva = [],
  isLoading = false,
}) => {
  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const isModalityMode = Boolean(porTipoReserva && porTipoReserva.length > 0);
  const items = isModalityMode
    ? porTipoReserva.map((item) => ({
        id: item.tipo,
        name: item.label,
        totalViajes: item.totalViajes,
        porcentaje: item.porcentaje,
        ticketMedio: item.ticketMedio,
        facturacion: item.facturacion,
        color: MODALITY_COLORS[item.tipo] || { bar: 'bg-champagne-gold', dot: 'bg-champagne-gold' },
      }))
    : categories.map((cat, idx) => ({
        id: cat.id || cat.name,
        name: cat.name,
        totalViajes: cat.totalViajes,
        porcentaje: cat.porcentaje,
        ticketMedio: cat.ticketMedio,
        facturacion: cat.facturacion,
        color: CATEGORY_COLORS[idx % CATEGORY_COLORS.length],
      }));

  const hasData = items.length > 0;
  const title = isModalityMode ? 'Por modalidad de viaje' : 'Por categoría de servicio';
  const subtitle = isModalityMode 
    ? 'Inmediatos vs. Reservados (completados)' 
    : 'Participación sobre viajes completados';
  return (
    <div className="bg-white dark:bg-dark-surface rounded-xl border border-gray-100 dark:border-dark-border shadow-sm p-5 flex flex-col justify-between transition-colors min-h-[300px]">
      <div>
        {/* Header */}
        <div className="mb-4">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-0.5">
            {title}
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {subtitle}
          </p>
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="space-y-4 animate-pulse pt-2">
            <div className="h-3 w-full bg-gray-200 dark:bg-white/10 rounded-full" />
            <div className="space-y-3 pt-3">
              {[1, 2].map((i) => (
                <div key={i} className="flex justify-between items-center">
                  <div className="space-y-1.5">
                    <div className="h-4 w-28 bg-gray-200 dark:bg-white/10 rounded" />
                    <div className="h-3 w-40 bg-gray-100 dark:bg-white/5 rounded" />
                  </div>
                  <div className="space-y-1.5 text-right">
                    <div className="h-4 w-20 bg-gray-200 dark:bg-white/10 rounded ml-auto" />
                    <div className="h-3 w-24 bg-gray-100 dark:bg-white/5 rounded ml-auto" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : !hasData ? (
          /* Empty / Waiting state */
          <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-gray-100 dark:border-dark-border rounded-lg bg-gray-50/50 dark:bg-white/[0.02] p-6 text-center my-auto min-h-[180px]">
            <span className="text-[10px] uppercase tracking-wider font-semibold text-champagne-gold bg-champagne-gold/10 px-2.5 py-1 rounded-full mb-1.5">
              Próximamente
            </span>
            <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              {isModalityMode ? 'Desglose por modalidad en desarrollo' : 'Desglose en desarrollo'}
            </p>
            <p className="text-[11px] text-gray-400 dark:text-gray-500 max-w-xs">
              Cuando el backend entregue los datos se graficará su participación aquí.
            </p>
          </div>
        ) : (
          /* Active Data Display */
          <div className="space-y-5">
            {/* Barra de progreso segmentada */}
            <div className="h-3 w-full rounded-full overflow-hidden flex bg-gray-100 dark:bg-white/10 shadow-inner">
              {items.map((item) => {
                const pct = Math.max(0, Math.min(100, item.porcentaje));
                if (pct <= 0) return null;
                return (
                  <div
                    key={item.id}
                    style={{ width: `${pct}%` }}
                    className={`${item.color.bar} transition-all duration-500`}
                    title={`${item.name}: ${pct.toFixed(1)}%`}
                  />
                );
              })}
            </div>

            {/* Lista de items */}
            <div className="space-y-4 pt-1">
              {items.map((item) => {
                return (
                  <div
                    key={item.id}
                    className="flex items-start justify-between gap-3 text-xs"
                  >
                    {/* Izquierda: Icono + Nombre + Subtítulo */}
                    <div className="flex items-start gap-2.5 min-w-0">
                      <span
                        className={`w-3 h-3 rounded-sm flex-shrink-0 mt-0.5 ${item.color.dot}`}
                      />
                      <div className="min-w-0">
                        <span className="font-bold text-gray-900 dark:text-white block truncate">
                          {item.name}
                        </span>
                        <span className="text-gray-500 dark:text-gray-400 block mt-0.5 text-[11px]">
                          {item.porcentaje.toFixed(1)}% · ticket medio{' '}
                          {formatMoney(item.ticketMedio)}
                        </span>
                      </div>
                    </div>

                    {/* Derecha: Viajes + Total Facturado */}
                    <div className="text-right flex-shrink-0">
                      <span className="font-bold text-gray-900 dark:text-white block font-mono text-[11px] sm:text-xs">
                        {item.totalViajes.toLocaleString('es-AR')} viajes
                      </span>
                      <span className="text-gray-500 dark:text-gray-400 block mt-0.5 font-mono text-[11px]">
                        {formatMoney(item.facturacion)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
