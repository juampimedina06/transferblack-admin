import React from 'react';
import { Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { AnimatedNumber } from '../../components/common/AnimatedNumber';
import { usePayouts } from '../hooks/usePayouts';

export const PayoutsKPIs: React.FC = () => {
  // Obtenemos conteos específicos para métricas con los nuevos estados del backend
  const { data: pendingData, isLoading: loadingPending } = usePayouts({
    status: 'pending',
    page: 1,
    limit: 100,
  });

  const { data: processingData, isLoading: loadingProcessing } = usePayouts({
    status: 'processing',
    page: 1,
    limit: 1,
  });

  const { data: completedData, isLoading: loadingCompleted } = usePayouts({
    status: 'completed',
    page: 1,
    limit: 1,
  });

  // Calculamos el monto total NETO pendiente en cola a partir de las solicitudes pendientes
  const totalPendingNetAmount = React.useMemo(() => {
    if (!pendingData?.payouts) return 0;
    return pendingData.payouts.reduce((acc, item) => {
      const gross = parseFloat(String(item.amount)) || 0;
      const fee = item.fee_amount !== undefined && item.fee_amount !== null
        ? parseFloat(String(item.fee_amount)) || 0
        : (item.type === 'immediate' ? 500 : 0);
      const net = item.net_amount !== undefined && item.net_amount !== null
        ? parseFloat(String(item.net_amount)) || 0
        : gross - fee;

      return acc + (isNaN(net) ? 0 : net);
    }, 0);
  }, [pendingData?.payouts]);

  const pendingCount = pendingData?.pagination.total ?? 0;
  const processingCount = processingData?.pagination.total ?? 0;
  const completedCount = completedData?.pagination.total ?? 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
      {/* Tarjeta 1: Solicitado en Cola (Pendiente) */}
      <div className="relative overflow-hidden rounded-xl bg-white dark:bg-dark-surface p-5 border border-gray-200/80 dark:border-dark-border shadow-sm flex flex-col justify-between group hover:border-champagne-gold/40 transition-all duration-300">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
            Total neto en cola de pago
          </span>
          <div className="p-2 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
            <Clock className="w-4 h-4" />
          </div>
        </div>
        <div>
          <div className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
            {loadingPending ? (
              <span className="text-gray-400 dark:text-gray-600 text-lg">Cargando...</span>
            ) : (
              <AnimatedNumber
                value={totalPendingNetAmount}
                decimals={2}
                decimal=","
                separator="."
                prefix="$ "
              />
            )}
          </div>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
            <span className="font-semibold text-amber-600 dark:text-amber-400">
              {pendingCount}
            </span>{' '}
            {pendingCount === 1 ? 'solicitud pendiente' : 'solicitudes pendientes de procesar'}
          </p>
        </div>
      </div>

      {/* Tarjeta 2: En Proceso / Gestión Bancaria */}
      <div className="relative overflow-hidden rounded-xl bg-white dark:bg-dark-surface p-5 border border-gray-200/80 dark:border-dark-border shadow-sm flex flex-col justify-between group hover:border-sky-500/40 transition-all duration-300">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
            En gestión bancaria
          </span>
          <div className="p-2 rounded-lg bg-sky-500/10 text-sky-600 dark:text-sky-400">
            <AlertCircle className="w-4 h-4" />
          </div>
        </div>
        <div>
          <div className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
            {loadingProcessing ? (
              <span className="text-gray-400 dark:text-gray-600 text-lg">...</span>
            ) : (
              <AnimatedNumber value={processingCount} />
            )}
          </div>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Solicitudes en curso pendientes de comprobante
          </p>
        </div>
      </div>

      {/* Tarjeta 3: Resueltos / Completados */}
      <div className="relative overflow-hidden rounded-xl bg-white dark:bg-dark-surface p-5 border border-gray-200/80 dark:border-dark-border shadow-sm flex flex-col justify-between group hover:border-emerald-500/40 transition-all duration-300">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
            Total transferencias completadas
          </span>
          <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        </div>
        <div>
          <div className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
            {loadingCompleted ? (
              <span className="text-gray-400 dark:text-gray-600 text-lg">...</span>
            ) : (
              <AnimatedNumber value={completedCount} />
            )}
          </div>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Retiros transferidos y liquidados a conductores
          </p>
        </div>
      </div>
    </div>
  );
};
