import { useEffect, useMemo, useState } from 'react';
import { toLocalISODate } from '../utils/dates';
import { downloadCsv } from '../utils/csv';
import { ManualTripModal } from '../trips/components/ManualTripModal';
import { useSearchParams } from 'react-router-dom';
import clsx from 'clsx';
import { useDashboardStats } from '../dashboard/hooks/useDashboardStats';
import { useDrivers } from '../drivers/hooks/useDrivers';
import { usePayouts } from '../payouts/hooks/usePayouts';
import { type PeriodoDashboard } from '../../core/dashboard/interfaces/dashboard-stats.interface';
import { KpiCard } from '../dashboard/components/KpiCard';
import { ActivityChart } from '../dashboard/components/ActivityChart';
import { DashboardSkeleton } from '../dashboard/components/DashboardSkeleton';
import { CategoryBreakdownCard } from '../dashboard/components/CategoryBreakdownCard';
import { PendingApplicationsListCard } from '../dashboard/components/PendingApplicationsListCard';
import { PendingPayoutsListCard } from '../dashboard/components/PendingPayoutsListCard';
import { AnimatedNumber } from '../components/common/AnimatedNumber';

const formatMoneyCompact = (amount: number) => {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

export default function Dashboard() {
  const [searchParams, setSearchParams] = useSearchParams();
  
  const rawPeriodo = searchParams.get('periodo');
  const periodo: PeriodoDashboard = (rawPeriodo === 'month' || rawPeriodo === 'year') 
    ? rawPeriodo 
    : 'day';
    
  const fecha = searchParams.get('fecha') || undefined;

  const { data, isLoading, error, refetch } = useDashboardStats(periodo, fecha);

  // Período anterior para cálculo de comparativas
  const previousDateInfo = useMemo(() => {
    const base = fecha ? new Date(fecha) : new Date();
    const d = new Date(base);
    if (periodo === 'day') {
      d.setUTCDate(d.getUTCDate() - 1);
      return { iso: d.toISOString(), label: 'ayer' };
    } else if (periodo === 'month') {
      d.setUTCMonth(d.getUTCMonth() - 1);
      const monthName = d.toLocaleString('es-AR', { month: 'long', timeZone: 'UTC' });
      return { iso: d.toISOString(), label: monthName };
    } else {
      d.setUTCFullYear(d.getUTCFullYear() - 1);
      return { iso: d.toISOString(), label: `${d.getUTCFullYear()}` };
    }
  }, [periodo, fecha]);

  const { data: prevData } = useDashboardStats(periodo, previousDateInfo.iso);

  // Ticket medio sobre completados (backend): dividir por todos los pedidos,
  // cancelados incluidos, daba un ticket irreal.
  const ticketMedio = data?.ticketMedio ?? 0;

  const porcentajeSobreBruto = useMemo(() => {
    return (data?.facturacionBruta && data.facturacionBruta > 0)
      ? (data.comisionNeta / data.facturacionBruta) * 100
      : 0;
  }, [data?.facturacionBruta, data?.comisionNeta]);

  const canceladosCount = data?.totalCancelados ?? Math.round((data?.ratioCancelaciones ?? 0) * (data?.totalViajes ?? 0));

  // Deltas porcentuales vs período anterior
  const deltaTotalViajes = useMemo(() => {
    if (data?.totalViajes === undefined || prevData?.totalViajes === undefined) return null;
    // Sin datos en el periodo anterior un porcentaje no dice nada ("+100%").
    if (prevData.totalViajes === 0) return null;
    return ((data.totalViajes - prevData.totalViajes) / prevData.totalViajes) * 100;
  }, [data?.totalViajes, prevData?.totalViajes]);

  const deltaFacturacion = useMemo(() => {
    if (data?.facturacionBruta === undefined || prevData?.facturacionBruta === undefined) return null;
    if (prevData.facturacionBruta === 0) return null;
    return ((data.facturacionBruta - prevData.facturacionBruta) / prevData.facturacionBruta) * 100;
  }, [data?.facturacionBruta, prevData?.facturacionBruta]);

  const deltaCancelaciones = useMemo(() => {
    if (data?.ratioCancelaciones === undefined || prevData?.ratioCancelaciones === undefined) return null;
    return (data.ratioCancelaciones - prevData.ratioCancelaciones) * 100;
  }, [data?.ratioCancelaciones, prevData?.ratioCancelaciones]);

  // Queries para métricas de acción pendientes (top 5 para mini-listados)
  const {
    data: driversData,
    isLoading: isLoadingDrivers,
    isError: isErrorDrivers,
  } = useDrivers({ page: 1, limit: 5, status: 'pending' });

  const {
    data: payoutsData,
    isLoading: isLoadingPayouts,
    isError: isErrorPayouts,
  } = usePayouts({ status: 'pending', page: 1, limit: 5 });

  const pendingApplicationsCount =
    driversData?.pendingCount ?? driversData?.pagination?.totalCount ?? 0;

  const pendingPayoutsCount = payoutsData?.pagination?.total ?? 0;

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

  // Fecha concreta del periodo (dia, mes o año). Se manda el mediodia de
  // Cordoba para que ningun corrimiento horario la cambie de dia.
  const fechaLocal = fecha ? new Date(fecha) : new Date();
  const fechaISODate = toLocalISODate(fechaLocal);
  const handleFechaChange = (isoDate: string) => {
    if (!isoDate) return;
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set('fecha', new Date(`${isoDate}T12:00:00.000-03:00`).toISOString());
      return next;
    }, { replace: true });
  };

  const [isManualTripOpen, setIsManualTripOpen] = useState(false);

  const handleExportCsv = () => {
    if (!data) return;
    downloadCsv(
      `dashboard-${periodo}-${fechaISODate}.csv`,
      ['Franja', 'Completados', 'Cancelados'],
      data.series.map((item) => [item.label, item.completados, item.cancelados]),
    );
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
        
        <div className="flex items-center gap-2">
          {periodo === 'day' && (
            <input
              type="date"
              lang="es-AR"
              value={fechaISODate}
              max={toLocalISODate(new Date())}
              onChange={(event) => handleFechaChange(event.target.value)}
              aria-label="Día"
              className="px-3 py-1.5 text-sm rounded-lg border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-surface text-gray-800 dark:text-gray-200"
            />
          )}
          {periodo === 'month' && (
            <input
              type="month"
              lang="es-AR"
              value={fechaISODate.slice(0, 7)}
              max={toLocalISODate(new Date()).slice(0, 7)}
              onChange={(event) => event.target.value && handleFechaChange(`${event.target.value}-15`)}
              aria-label="Mes"
              className="px-3 py-1.5 text-sm rounded-lg border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-surface text-gray-800 dark:text-gray-200"
            />
          )}
          {periodo === 'year' && (
            <select
              value={fechaISODate.slice(0, 4)}
              onChange={(event) => handleFechaChange(`${event.target.value}-06-15`)}
              aria-label="Año"
              className="px-3 py-1.5 text-sm rounded-lg border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-surface text-gray-800 dark:text-gray-200"
            >
              {Array.from({ length: 4 }, (_, index) => new Date().getFullYear() - index).map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          )}
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleExportCsv}
            disabled={!data}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-dark-surface border border-gray-300 dark:border-dark-border rounded-lg shadow-sm hover:bg-gray-50 dark:hover:bg-white/5 transition-colors disabled:opacity-50"
          >
            Exportar CSV
          </button>
          <button
            type="button"
            onClick={() => setIsManualTripOpen(true)}
            className="px-4 py-2 text-sm font-semibold text-obsidian bg-champagne-gold rounded-lg shadow-sm hover:brightness-105 transition-all"
          >
            Nuevo viaje manual
          </button>
        </div>
      </div>
      {isManualTripOpen && <ManualTripModal onClose={() => setIsManualTripOpen(false)} />}

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
              label="Viajes pedidos" 
              value={
                data?.totalViajes !== undefined ? (
                  <AnimatedNumber value={data.totalViajes} />
                ) : (
                  '-'
                )
              }
              footer={
                data?.totalViajes !== undefined ? (
                  <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                    {deltaTotalViajes !== null && (
                      <span
                        className={clsx(
                          "px-1.5 py-0.5 rounded text-[11px] font-semibold",
                          deltaTotalViajes >= 0
                            ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/40"
                            : "bg-red-50 text-red-700 dark:bg-red-950/50 dark:text-red-300 border border-red-200/60 dark:border-red-800/40"
                        )}
                      >
                        {deltaTotalViajes >= 0 ? `+${deltaTotalViajes.toFixed(1)}%` : `${deltaTotalViajes.toFixed(1)}%`}
                      </span>
                    )}
                    <span>
                      vs. {previousDateInfo.label} ({prevData?.totalViajes !== undefined ? prevData.totalViajes.toLocaleString('es-AR') : '-'})
                    </span>
                  </div>
                ) : undefined
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
              footer={
                data?.facturacionBruta !== undefined ? (
                  <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                    {deltaFacturacion !== null && (
                      <span
                        className={clsx(
                          "px-1.5 py-0.5 rounded text-[11px] font-semibold",
                          deltaFacturacion >= 0
                            ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/40"
                            : "bg-red-50 text-red-700 dark:bg-red-950/50 dark:text-red-300 border border-red-200/60 dark:border-red-800/40"
                        )}
                      >
                        {deltaFacturacion >= 0 ? `+${deltaFacturacion.toFixed(1)}%` : `${deltaFacturacion.toFixed(1)}%`}
                      </span>
                    )}
                    <span>ticket medio {formatMoneyCompact(ticketMedio)}</span>
                  </div>
                ) : undefined
              }
            />
            <KpiCard 
              label="Ganancia Transfer Black" 
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
              footer={
                data?.comisionNeta !== undefined ? (
                  <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                    <span className="bg-amber-100 text-amber-900 dark:bg-amber-900/50 dark:text-amber-200 border border-amber-200/60 dark:border-amber-800/40 px-1.5 py-0.5 rounded text-[11px] font-semibold">
                      {porcentajeSobreBruto.toFixed(1)}%
                    </span>
                    <span>sobre bruto</span>
                  </div>
                ) : undefined
              }
            />
            <KpiCard 
              label="Viajes cancelados" 
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
              footer={
                data?.ratioCancelaciones !== undefined ? (
                  <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                    {deltaCancelaciones !== null && (
                      <span
                        className={clsx(
                          "px-1.5 py-0.5 rounded text-[11px] font-semibold",
                          deltaCancelaciones <= 0
                            ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/40"
                            : "bg-red-50 text-red-700 dark:bg-red-950/50 dark:text-red-300 border border-red-200/60 dark:border-red-800/40"
                        )}
                      >
                        {deltaCancelaciones >= 0 ? `+${deltaCancelaciones.toFixed(1)} pp` : `${deltaCancelaciones.toFixed(1)} pp`}
                      </span>
                    )}
                    <span>
                      {canceladosCount.toLocaleString('es-AR')} de {(data.totalViajes || 0).toLocaleString('es-AR')} viajes
                    </span>
                  </div>
                ) : undefined
              }
            />
          </div>

          {/* Charts & Category Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <ActivityChart 
              periodo={periodo} 
              totalViajes={data?.totalViajes} 
              ratioCancelaciones={data?.ratioCancelaciones}
              series={data?.series}
            />
            <CategoryBreakdownCard
              porTipoReserva={data?.porTipoReserva}
              categories={data?.porCategoria}
              isLoading={isLoading}
            />
          </div>

          {/* Tarjetas de Listados Pendientes (Mini-listados de acción) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <PendingApplicationsListCard
              drivers={driversData?.data || []}
              totalCount={pendingApplicationsCount}
              isLoading={isLoadingDrivers}
              isError={isErrorDrivers}
            />

            <PendingPayoutsListCard
              payouts={payoutsData?.payouts || []}
              totalCount={pendingPayoutsCount}
              isLoading={isLoadingPayouts}
              isError={isErrorPayouts}
            />
          </div>
        </>
      )}
    </div>
  );
}
