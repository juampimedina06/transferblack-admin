import React from 'react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  Tooltip 
} from 'recharts';
import type { PeriodoDashboard, SerieTemporalItem } from '../../../core/dashboard/interfaces/dashboard-stats.interface';

export type ChartSeriesItem = SerieTemporalItem;

interface ActivityChartProps {
  periodo: PeriodoDashboard;
  totalViajes?: number;
  ratioCancelaciones?: number;
  series?: ChartSeriesItem[];
}

export const ActivityChart: React.FC<ActivityChartProps> = ({ 
  periodo, 
  totalViajes,
  series,
}) => {
  // Título y descripción según el período seleccionado (Hora en día, Día en mes, Mes en año)
  const title = periodo === 'day' 
    ? 'Viajes por hora' 
    : periodo === 'year' 
      ? 'Viajes por mes' 
      : 'Viajes por día';

  const subtitle = React.useMemo(() => {
    if (!series || series.length === 0) {
      return totalViajes !== undefined
        ? `${totalViajes.toLocaleString('es-AR')} viajes en el período`
        : 'Actividad del período seleccionado';
    }

    const totalCompletados = series.reduce((acc, s) => acc + (s.completados || 0), 0);
    const activeBuckets = series.length;
    const avg = activeBuckets > 0 ? (totalCompletados / activeBuckets) : 0;
    
    let peakItem = series[0];
    let maxVal = -1;
    for (const item of series) {
      const val = item.completados || 0;
      if (val > maxVal) {
        maxVal = val;
        peakItem = item;
      }
    }

    const unit = periodo === 'day' ? 'hora' : periodo === 'month' ? 'día' : 'mes';
    const avgFormatted = avg < 10 ? avg.toFixed(1) : Math.round(avg).toLocaleString('es-AR');

    if (maxVal > 0 && peakItem) {
      const prefix = periodo === 'day' ? 'a las' : periodo === 'month' ? 'el' : 'en';
      return `Promedio ${avgFormatted} viajes/${unit} · pico ${prefix} ${peakItem.label} con ${maxVal.toLocaleString('es-AR')}`;
    }

    return totalViajes !== undefined
      ? `${totalViajes.toLocaleString('es-AR')} viajes en el período`
      : `Promedio ${avgFormatted} viajes/${unit}`;
  }, [series, totalViajes, periodo]);

  const hasSeriesData = Boolean(series && series.length > 0);

  return (
    <div className="bg-white dark:bg-dark-surface rounded-xl p-5 border border-gray-100 dark:border-dark-border shadow-sm col-span-1 lg:col-span-2 flex flex-col justify-between min-h-[300px] transition-colors">
      {/* Header del Gráfico */}
      <div className="mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-0.5">{title}</h2>
          <p className="text-xs text-gray-500 dark:text-gray-400">{subtitle}</p>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 bg-champagne-gold rounded-sm" />
            <span className="text-gray-600 dark:text-gray-400 font-medium">Completados</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 bg-gray-300 dark:bg-gray-700 rounded-sm" />
            <span className="text-gray-600 dark:text-gray-400 font-medium">Cancelados</span>
          </div>
        </div>
      </div>
      
      {/* Gráfico Recharts si el backend provee series, o Empty State limpio sin datos inventados */}
      {hasSeriesData ? (
        <div className="w-full h-56">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart 
              data={series} 
              margin={{ top: 10, right: 8, left: 8, bottom: 0 }}
            >
              <XAxis 
                dataKey="label" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#9CA3AF', fontSize: 11 }} 
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }} />
              <Bar 
                dataKey="completados" 
                stackId="activity" 
                fill="#D4AF37" 
                radius={[0, 0, 0, 0]}
              />
              <Bar 
                dataKey="cancelados" 
                stackId="activity" 
                fill="#4B5563" 
                radius={[2, 2, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-gray-100 dark:border-dark-border rounded-lg bg-gray-50/50 dark:bg-white/[0.02] p-6 text-center min-h-[180px]">
          <span className="text-[10px] uppercase tracking-wider font-semibold text-champagne-gold bg-champagne-gold/10 px-2.5 py-1 rounded-full mb-1.5">
            Próximamente
          </span>
          <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
            Todavía no hay datos de serie temporal para graficar
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500 max-w-sm">
            El endpoint actual entrega métricas consolidadas del período. Cuando el backend devuelva la serie temporal se graficarán aquí.
          </p>
        </div>
      )}
    </div>
  );
};

// Tooltip estilizado VIP
interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    value: number;
    name: string;
    payload: ChartSeriesItem;
  }>;
  label?: string;
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload, label }) => {
  if (!active || !payload || !payload.length) return null;

  const item = payload[0].payload;
  const total = item.total ?? (item.completados + item.cancelados);

  return (
    <div className="bg-obsidian text-white rounded-lg p-3 text-xs shadow-xl border border-gray-800">
      <p className="font-semibold text-gray-300 mb-2 border-b border-gray-700/60 pb-1">
        {label}
      </p>
      <div className="space-y-1">
        <div className="flex items-center justify-between gap-4">
          <span className="flex items-center gap-1.5 text-gray-300">
            <span className="w-2 h-2 rounded-full bg-champagne-gold inline-block" />
            Completados:
          </span>
          <span className="font-bold text-white">{item.completados.toLocaleString('es-AR')}</span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span className="flex items-center gap-1.5 text-gray-400">
            <span className="w-2 h-2 rounded-full bg-gray-400 inline-block" />
            Cancelados:
          </span>
          <span className="font-medium text-gray-300">{item.cancelados.toLocaleString('es-AR')}</span>
        </div>
        <div className="flex items-center justify-between gap-4 pt-1.5 border-t border-gray-700/60">
          <span className="text-gray-400">Total:</span>
          <span className="font-bold text-champagne-gold">{total.toLocaleString('es-AR')}</span>
        </div>
      </div>
    </div>
  );
};
