import React from 'react';
import { Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { AnimatedNumber } from '../../components/common/AnimatedNumber';
import { usePayouts } from '../hooks/usePayouts';

export const PayoutsKPIs: React.FC = () => {
  // Obtenemos conteos específicos para métricas
  const { data: requestedData, isLoading: loadingRequested } = usePayouts({
    status: 'requested',
    page: 1,
    limit: 100,
  });

  const { data: approvedData, isLoading: loadingApproved } = usePayouts({
    status: 'approved',
    page: 1,
    limit: 1,
  });

  const { data: paidData, isLoading: loadingPaid } = usePayouts({
    status: 'paid',
    page: 1,
    limit: 1,
  });

  // Calculamos el monto total pendiente en cola a partir de las solicitudes requested
  const totalRequestedAmount = React.useMemo(() => {
    if (!requestedData?.payouts) return 0;
    return requestedData.payouts.reduce((acc, item) => {
      const num = parseFloat(item.amount) || 0;
      return acc + num;
    }, 0);
  }, [requestedData?.payouts]);

  const requestedCount = requestedData?.pagination.total ?? 0;
  const approvedCount = approvedData?.pagination.total ?? 0;
  const paidCount = paidData?.pagination.total ?? 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
      {/* Tarjeta 1: Solicitado en Cola */}
      <div className="relative overflow-hidden rounded-xl bg-white dark:bg-dark-surface p-5 border border-gray-200/80 dark:border-dark-border shadow-sm flex flex-col justify-between group hover:border-champagne-gold/40 transition-all duration-300">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
            Total en cola de pago
          </span>
          <div className="p-2 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
            <Clock className="w-4 h-4" />
          </div>
        </div>
        <div>
          <div className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
            {loadingRequested ? (
              <span className="text-gray-400 dark:text-gray-600 text-lg">Cargando...</span>
            ) : (
              <AnimatedNumber
                value={totalRequestedAmount}
                decimals={2}
                decimal=","
                separator="."
                prefix="$ "
              />
            )}
          </div>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
            <span className="font-semibold text-amber-600 dark:text-amber-400">
              {requestedCount}
            </span>{' '}
            {requestedCount === 1 ? 'solicitud pendiente' : 'solicitudes pendientes de procesar'}
          </p>
        </div>
      </div>

      {/* Tarjeta 2: En Proceso / Gestión */}
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
            {loadingApproved ? (
              <span className="text-gray-400 dark:text-gray-600 text-lg">...</span>
            ) : (
              <AnimatedNumber value={approvedCount} />
            )}
          </div>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Solicitudes aprobadas pendientes de adjuntar comprobante
          </p>
        </div>
      </div>

      {/* Tarjeta 3: Resueltos / Pagados */}
      <div className="relative overflow-hidden rounded-xl bg-white dark:bg-dark-surface p-5 border border-gray-200/80 dark:border-dark-border shadow-sm flex flex-col justify-between group hover:border-emerald-500/40 transition-all duration-300">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
            Total transferencias pagadas
          </span>
          <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        </div>
        <div>
          <div className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
            {loadingPaid ? (
              <span className="text-gray-400 dark:text-gray-600 text-lg">...</span>
            ) : (
              <AnimatedNumber value={paidCount} />
            )}
          </div>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Retiros liquidados con éxito a conductores
          </p>
        </div>
      </div>
    </div>
  );
};
