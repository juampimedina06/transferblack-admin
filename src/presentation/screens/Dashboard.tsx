import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import clsx from 'clsx';
import { useDashboardStats } from '../dashboard/hooks/useDashboardStats';
import { type PeriodoDashboard } from '../../core/dashboard/interfaces/dashboard-stats.interface';
import { KpiCard } from '../dashboard/components/KpiCard';
import { ActivityChart } from '../dashboard/components/ActivityChart';
import { DashboardSkeleton } from '../dashboard/components/DashboardSkeleton';
import { AnimatedNumber } from '../components/common/AnimatedNumber';


export default function Dashboard() {
  const [searchParams, setSearchParams] = useSearchParams();
  
  const rawPeriodo = searchParams.get('periodo');
  const periodo: PeriodoDashboard = (rawPeriodo === 'month' || rawPeriodo === 'year') 
    ? rawPeriodo 
    : 'day';
    
  const fecha = searchParams.get('fecha') || undefined;

  const { data, isLoading, error, refetch } = useDashboardStats(periodo, fecha);

  // Inicializar parámetro por defecto una sola vez al montar
  useEffect(() => {
    if (!searchParams.has('periodo')) {
      setSearchParams({ periodo: 'day' }, { replace: true });
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handlePeriodoChange = (newPeriodo: PeriodoDashboard) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set('periodo', newPeriodo);
      return next;
    }, { replace: true });
  };

  return (
    <div className="w-full flex flex-col gap-4">
      {/* Top Actions & Filters - Siempre visibles y estables */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div className="flex bg-white dark:bg-dark-surface rounded-lg p-1 border border-gray-200 dark:border-dark-border shadow-sm">
          {(['day', 'month', 'year'] as const).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => handlePeriodoChange(p)}
              className={clsx(
                "px-4 py-1.5 text-sm font-medium rounded-md transition-colors",
                periodo === p 
                  ? "bg-champagne-gold text-obsidian font-semibold shadow-sm" 
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-white/5"
              )}
            >
              {p === 'day' ? 'Día' : p === 'month' ? 'Mes' : 'Año'}
            </button>
          ))}
        </div>
        
        <div className="flex items-center gap-3">
          <button className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-dark-surface border border-gray-300 dark:border-dark-border rounded-lg shadow-sm hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
            Exportar CSV
          </button>
          <button className="px-4 py-2 text-sm font-semibold text-obsidian bg-champagne-gold rounded-lg shadow-sm hover:brightness-105 transition-all">
            Nuevo viaje manual
          </button>
        </div>
      </div>

      {/* Manejo de errores */}
      {error && (
        <div className="bg-orange-50 dark:bg-orange-950/30 text-orange-800 dark:text-orange-300 p-6 rounded-xl border border-orange-100 dark:border-orange-900/40 text-center">
          <h2 className="text-lg font-bold mb-2">Ocurrió un problema</h2>
          <p className="mb-4">No pudimos cargar las métricas del dashboard para este período.</p>
          <button 
            onClick={() => refetch()}
            className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 font-medium transition-colors"
          >
            Reintentar
          </button>
        </div>
      )}

      {/* Loading inicial */}
      {isLoading && !data && (
        <DashboardSkeleton />
      )}

      {/* Contenido principal con datos */}
      {(!isLoading || data) && (
        <>
          {/* KPIs Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <KpiCard 
              label="Total de viajes" 
              value={
                data?.totalViajes !== undefined ? (
                  <AnimatedNumber value={data.totalViajes} />
                ) : (
                  '-'
                )
              } 
            />
            <KpiCard 
              label="Facturación bruta" 
              value={
                data?.facturacionBruta !== undefined ? (
                  <AnimatedNumber 
                    value={data.facturacionBruta} 
                    prefix="$ " 
                    decimals={2}
                  />
                ) : (
                  '-'
                )
              } 
            />
            <KpiCard 
              label="Comisión neta de plataforma" 
              value={
                data?.comisionNeta !== undefined ? (
                  <AnimatedNumber 
                    value={data.comisionNeta} 
                    prefix="$ " 
                    decimals={2}
                  />
                ) : (
                  '-'
                )
              } 
            />
            <KpiCard 
              label="Ratio de cancelaciones" 
              value={
                data?.ratioCancelaciones !== undefined ? (
                  <AnimatedNumber 
                    value={data.ratioCancelaciones * 100} 
                    decimals={1} 
                    suffix="%" 
                  />
                ) : (
                  '-'
                )
              } 
            />
          </div>

          {/* Charts & Bottom info */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <ActivityChart 
              periodo={periodo} 
              totalViajes={data?.totalViajes} 
              ratioCancelaciones={data?.ratioCancelaciones} 
            />
            <div className="col-span-1 bg-white dark:bg-dark-surface rounded-xl border border-gray-100 dark:border-dark-border shadow-sm p-5 flex items-center justify-center min-h-[160px] lg:min-h-0">
              <div className="text-center">
                <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">Por categoría de servicio</p>
                <span className="text-xs font-semibold tracking-wider text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-white/5 px-2 py-0.5 rounded uppercase">Próximamente</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="bg-white dark:bg-dark-surface rounded-xl border border-gray-100 dark:border-dark-border shadow-sm p-5 flex flex-col items-center justify-center min-h-32">
              <p className="text-sm font-medium text-gray-900 dark:text-white mb-2">Postulaciones esperando revisión</p>
              <span className="text-xs font-semibold tracking-wider text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-white/5 px-2 py-0.5 rounded uppercase">Próximamente</span>
            </div>
            <div className="bg-white dark:bg-dark-surface rounded-xl border border-gray-100 dark:border-dark-border shadow-sm p-5 flex flex-col items-center justify-center min-h-32">
              <p className="text-sm font-medium text-gray-900 dark:text-white mb-2">Solicitudes de retiro pendientes</p>
              <span className="text-xs font-semibold tracking-wider text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-white/5 px-2 py-0.5 rounded uppercase">Próximamente</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
