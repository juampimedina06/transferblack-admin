import React from 'react';
import { format } from 'date-fns';
import { RefreshCw } from 'lucide-react';
import { AnimatedNumber } from '../../components/common/AnimatedNumber';
import type { LiveMapMetrics } from '../../../core/map/interfaces/live-map.interface';

interface Props {
  metrics: LiveMapMetrics;
  lastUpdated: Date;
  activeFilter: 'all' | 'online' | 'in_trip' | 'offline';
  onFilterChange: (filter: 'all' | 'online' | 'in_trip' | 'offline') => void;
  onRefresh: () => void;
  isRefreshing?: boolean;
}

export const LiveMapKpiBar: React.FC<Props> = ({
  metrics,
  lastUpdated,
  activeFilter,
  onFilterChange,
  onRefresh,
  isRefreshing = false,
}) => {
  const formattedTime = format(lastUpdated, 'HH:mm:ss');

  return (
    <div className="flex flex-col gap-3 w-full">
      {/* Barra superior de título y estado de sincronización */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-1">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">
            Mapa en vivo
          </h1>
          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span>Actualiza cada 10 s - {formattedTime}</span>
          </div>
        </div>

        <button
          type="button"
          onClick={onRefresh}
          disabled={isRefreshing}
          className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white px-2.5 py-1 rounded-md border border-gray-200 dark:border-white/10 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors disabled:opacity-50"
          title="Actualizar datos ahora"
        >
          <RefreshCw className={`w-3 h-3 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span>Actualizar</span>
        </button>
      </div>

      {/* Grid de KPIs superiores */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 bg-white dark:bg-obsidian border border-gray-200 dark:border-white/10 rounded-xl p-3 shadow-sm">
        {/* Conductores en línea */}
        <button
          type="button"
          onClick={() => onFilterChange(activeFilter === 'online' ? 'all' : 'online')}
          className={`flex flex-col items-start p-2.5 rounded-lg transition-all text-left border ${
            activeFilter === 'online'
              ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-500/40 ring-1 ring-emerald-500/30'
              : 'hover:bg-gray-50 dark:hover:bg-white/5 border-transparent'
          }`}
        >
          <div className="flex items-center gap-1.5 text-[11px] font-semibold tracking-wider uppercase text-gray-600 dark:text-gray-300">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Conductores en línea</span>
          </div>
          <div className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">
            <AnimatedNumber value={metrics.onlineDrivers} />
          </div>
        </button>

        {/* Conductores en viaje */}
        <button
          type="button"
          onClick={() => onFilterChange(activeFilter === 'in_trip' ? 'all' : 'in_trip')}
          className={`flex flex-col items-start p-2.5 rounded-lg transition-all text-left border ${
            activeFilter === 'in_trip'
              ? 'bg-amber-50 dark:bg-amber-950/30 border-amber-500/40 ring-1 ring-amber-500/30'
              : 'hover:bg-gray-50 dark:hover:bg-white/5 border-transparent'
          }`}
        >
          <div className="flex items-center gap-1.5 text-[11px] font-semibold tracking-wider uppercase text-gray-600 dark:text-gray-300">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            <span>Conductores en viaje</span>
          </div>
          <div className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">
            <AnimatedNumber value={metrics.inTripDrivers} />
          </div>
        </button>

        {/* Viajes en curso */}
        <div className="flex flex-col items-start p-2.5 rounded-lg text-left">
          <div className="text-[11px] font-semibold tracking-wider uppercase text-gray-600 dark:text-gray-300">
            Viajes en curso
          </div>
          <div className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">
            <AnimatedNumber value={metrics.activeTrips} />
          </div>
        </div>

        {/* Buscando conductor */}
        <div className="flex flex-col items-start p-2.5 rounded-lg text-left">
          <div className="text-[11px] font-semibold tracking-wider uppercase text-gray-600 dark:text-gray-300">
            Buscando conductor
          </div>
          <div className="mt-1 flex items-center gap-2">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              <AnimatedNumber value={metrics.searchingTrips} />
            </div>
            {metrics.waitingMoreThan3Min > 0 && (
              <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700/50 animate-pulse">
                {metrics.waitingMoreThan3Min} hace +3 min
              </span>
            )}
          </div>
        </div>

        {/* Desconectados */}
        <button
          type="button"
          onClick={() => onFilterChange(activeFilter === 'offline' ? 'all' : 'offline')}
          className={`flex flex-col items-start p-2.5 rounded-lg transition-all text-left border ${
            activeFilter === 'offline'
              ? 'bg-gray-100 dark:bg-gray-800/60 border-gray-400/40 ring-1 ring-gray-400/30'
              : 'hover:bg-gray-50 dark:hover:bg-white/5 border-transparent'
          }`}
        >
          <div className="flex items-center gap-1.5 text-[11px] font-semibold tracking-wider uppercase text-gray-600 dark:text-gray-300">
            <span className="w-2 h-2 rounded-full bg-gray-400" />
            <span>Desconectados</span>
          </div>
          <div className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">
            <AnimatedNumber value={metrics.offlineDrivers} />
          </div>
        </button>
      </div>
    </div>
  );
};
