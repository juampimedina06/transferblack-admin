import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import clsx from 'clsx';
import { useDashboardStats } from '../dashboard/hooks/useDashboardStats';
import { type PeriodoDashboard } from '../../core/dashboard/interfaces/dashboard-stats.interface';
import { KpiCard } from '../dashboard/components/KpiCard';
import { ActivityChart } from '../dashboard/components/ActivityChart';
import { DashboardSkeleton } from '../dashboard/components/DashboardSkeleton';

const formatters = {
  number: new Intl.NumberFormat('es-AR'),
  currency: new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }),
  percent: (val: number) => `${new Intl.NumberFormat('es-AR', { maximumFractionDigits: 1 }).format(val * 100)}%`,
};

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
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Top Actions & Filters - Siempre visibles y estables */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex bg-white rounded-lg p-1 border border-gray-200 shadow-sm">
          {(['day', 'month', 'year'] as const).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => handlePeriodoChange(p)}
              className={clsx(
                "px-4 py-1.5 text-sm font-medium rounded-md transition-colors",
                periodo === p 
                  ? "bg-champagne-gold text-obsidian font-semibold" 
                  : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
              )}
            >
              {p === 'day' ? 'Día' : p === 'month' ? 'Mes' : 'Año'}
            </button>
          ))}
        </div>
        
        <div className="flex items-center gap-3">
          <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50">
            Exportar CSV
          </button>
          <button className="px-4 py-2 text-sm font-medium text-white bg-obsidian rounded-lg shadow-sm hover:bg-black">
            Nuevo viaje manual
          </button>
        </div>
      </div>

      {/* Manejo de errores */}
      {error && (
        <div className="bg-orange-50 text-orange-800 p-6 rounded-xl border border-orange-100 text-center">
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
              value={data?.totalViajes !== undefined ? formatters.number.format(data.totalViajes) : '-'} 
            />
            <KpiCard 
              label="Facturación bruta" 
              value={data?.facturacionBruta !== undefined ? formatters.currency.format(data.facturacionBruta) : '-'} 
            />
            <KpiCard 
              label="Comisión neta de plataforma" 
              value={data?.comisionNeta !== undefined ? formatters.currency.format(data.comisionNeta) : '-'} 
            />
            <KpiCard 
              label="Ratio de cancelaciones" 
              value={data?.ratioCancelaciones !== undefined ? formatters.percent(data.ratioCancelaciones) : '-'} 
            />
          </div>

          {/* Charts & Bottom info */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <ActivityChart 
              periodo={periodo} 
              totalViajes={data?.totalViajes} 
              ratioCancelaciones={data?.ratioCancelaciones} 
            />
            <div className="col-span-1 bg-white rounded-xl border border-gray-100 shadow-sm p-6 flex items-center justify-center">
              <div className="text-center">
                <p className="text-sm font-medium text-gray-900 mb-1">Por categoría de servicio</p>
                <span className="text-xs font-semibold tracking-wider text-gray-400 bg-gray-100 px-2 py-0.5 rounded uppercase">Próximamente</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 flex flex-col items-center justify-center min-h-48">
              <p className="text-sm font-medium text-gray-900 mb-2">Postulaciones esperando revisión</p>
              <span className="text-xs font-semibold tracking-wider text-gray-400 bg-gray-100 px-2 py-0.5 rounded uppercase">Próximamente</span>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 flex flex-col items-center justify-center min-h-48">
              <p className="text-sm font-medium text-gray-900 mb-2">Solicitudes de retiro pendientes</p>
              <span className="text-xs font-semibold tracking-wider text-gray-400 bg-gray-100 px-2 py-0.5 rounded uppercase">Próximamente</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
