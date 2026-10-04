import React from 'react';
import { Link } from 'react-router-dom';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import type { AdminPayoutItem } from '../../../core/payouts/interfaces/payout.interface';

interface PendingPayoutsListCardProps {
  payouts: AdminPayoutItem[];
  totalCount: number;
  isLoading: boolean;
  isError: boolean;
}

export const PendingPayoutsListCard: React.FC<PendingPayoutsListCardProps> = ({
  payouts,
  totalCount,
  isLoading,
  isError,
}) => {
  const formatDateTime = (dateStr: string) => {
    try {
      return format(parseISO(dateStr), 'dd/MM/yyyy HH:mm', { locale: es });
    } catch {
      return dateStr;
    }
  };

  const formatMoney = (amount: string | number, currency = 'ARS') => {
    const val = typeof amount === 'number' ? amount : parseFloat(amount) || 0;
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
    }).format(val);
  };

  return (
    <div className="bg-white dark:bg-dark-surface rounded-xl border border-gray-100 dark:border-dark-border shadow-sm p-5 sm:p-6 flex flex-col justify-between transition-colors">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-dark-border">
          <div className="flex items-center gap-2">
            <h2 className="text-sm sm:text-base font-bold text-gray-900 dark:text-white">
              Solicitudes de retiro pendientes
            </h2>
            {!isLoading && totalCount > 0 && (
              <span className="bg-amber-100 text-amber-900 dark:bg-amber-900/40 dark:text-amber-200 text-xs px-2 py-0.5 rounded font-semibold">
                {totalCount}
              </span>
            )}
          </div>
          <Link
            to="/retiros?status=requested"
            className="text-xs font-semibold text-amber-600 dark:text-champagne-gold hover:underline flex items-center gap-0.5"
          >
            <span>Ver cola completa</span>
            <span className="text-sm font-bold leading-none">›</span>
          </Link>
        </div>

        {/* Content list */}
        {isLoading ? (
          <div className="divide-y divide-gray-100 dark:divide-dark-border">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="py-3 flex items-center justify-between animate-pulse">
                <div className="space-y-1.5">
                  <div className="h-4 w-32 bg-gray-200 dark:bg-white/10 rounded" />
                  <div className="h-3 w-40 bg-gray-100 dark:bg-white/5 rounded" />
                </div>
                <div className="flex items-center gap-4">
                  <div className="h-5 w-24 bg-gray-200 dark:bg-white/10 rounded" />
                  <div className="h-4 w-12 bg-gray-200 dark:bg-white/10 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : isError ? (
          <div className="py-8 text-center text-xs text-gray-400 dark:text-gray-500">
            No se pudieron cargar las solicitudes de retiro.
          </div>
        ) : payouts.length === 0 ? (
          <div className="py-8 text-center text-xs text-gray-400 dark:text-gray-500">
            No hay solicitudes de retiro pendientes.
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-dark-border">
            {payouts.slice(0, 5).map((payout) => (
              <div
                key={payout.id}
                className="py-3 flex items-center justify-between gap-3 group hover:bg-gray-50/50 dark:hover:bg-white/[0.02] -mx-2 px-2 rounded-lg transition-colors"
              >
                <div className="min-w-0">
                  <p className="text-sm font-bold text-gray-900 dark:text-white truncate">
                    {payout.account_holder_name || 'Conductor'}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">
                    {formatDateTime(payout.requested_at)}
                  </p>
                </div>

                <div className="flex items-center gap-4 flex-shrink-0">
                  <span className="text-sm font-bold text-gray-900 dark:text-white font-mono">
                    {formatMoney(payout.amount, payout.currency)}
                  </span>
                  <Link
                    to="/retiros?status=requested"
                    className="text-xs font-semibold text-gray-600 dark:text-gray-300 hover:text-champagne-gold transition-colors"
                  >
                    Revisar
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
