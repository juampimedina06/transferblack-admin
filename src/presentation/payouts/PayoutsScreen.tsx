import React, { useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, RefreshCw, AlertCircle, CheckCircle2 } from 'lucide-react';
import type {
  AdminPayoutItem,
  AdminPayoutFilterStatus,
  AdminResolvePayoutPayload,
  AdminPayoutStatus,
} from '../../core/payouts/interfaces/payout.interface';
import { usePayouts } from './hooks/usePayouts';
import { useResolvePayout } from './hooks/useResolvePayout';
import { PayoutsKPIs } from './components/PayoutsKPIs';
import { PayoutsTable } from './components/PayoutsTable';
import { PayoutDetailModal } from './components/PayoutDetailModal';
import { PayoutResolveModal } from './components/PayoutResolveModal';
import { extractApiErrorMessage } from '../../core/api/adminApi';

const STATUS_TABS: { value: AdminPayoutFilterStatus; label: string }[] = [
  { value: 'requested', label: 'Pendientes' },
  { value: 'approved', label: 'En gestión' },
  { value: 'paid', label: 'Pagadas' },
  { value: 'rejected', label: 'Rechazadas' },
  { value: 'all', label: 'Todas' },
];

export const PayoutsScreen: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Params de URL
  const currentPage = parseInt(searchParams.get('page') || '1', 10);
  const statusParam = (searchParams.get('status') as AdminPayoutFilterStatus) || 'requested';
  const driverIdParam = searchParams.get('driver_id') || '';

  // Filtros para la query
  const queryFilters = {
    page: currentPage,
    limit: 15,
    ...(statusParam !== 'all' ? { status: statusParam as AdminPayoutStatus } : {}),
    ...(driverIdParam ? { driver_id: driverIdParam } : {}),
  };

  const { data, isLoading, isError, refetch, isFetching } = usePayouts(queryFilters);
  const resolveMutation = useResolvePayout();

  // Modales
  const [selectedPayout, setSelectedPayout] = useState<AdminPayoutItem | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [resolveMode, setResolveMode] = useState<'paid' | 'rejected' | null>(null);

  // Notificaciones de feedback temporal
  const [feedback, setFeedback] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  const showNotification = (type: 'success' | 'error', message: string) => {
    setFeedback({ type, message });
    setTimeout(() => {
      setFeedback(null);
    }, 4500);
  };

  // Handlers de cambio de filtros
  const handleTabChange = useCallback(
    (newStatus: AdminPayoutFilterStatus) => {
      setSearchParams((prev) => {
        if (newStatus === 'requested') {
          prev.delete('status'); // 'requested' es el default
        } else {
          prev.set('status', newStatus);
        }
        prev.set('page', '1');
        return prev;
      });
    },
    [setSearchParams]
  );

  const handlePageChange = useCallback(
    (newPage: number) => {
      setSearchParams((prev) => {
        prev.set('page', newPage.toString());
        return prev;
      });
    },
    [setSearchParams]
  );

  const handleDriverSearch = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value.trim();
      setSearchParams((prev) => {
        if (!val) {
          prev.delete('driver_id');
        } else {
          prev.set('driver_id', val);
        }
        prev.set('page', '1');
        return prev;
      });
    },
    [setSearchParams]
  );

  // Acciones sobre una solicitud
  const handleOpenDetail = (payout: AdminPayoutItem) => {
    setSelectedPayout(payout);
    setIsDetailOpen(true);
  };

  const handleApprove = async (payout: AdminPayoutItem) => {
    try {
      await resolveMutation.mutateAsync({
        payoutId: payout.id,
        payload: { status: 'approved' },
      });
      showNotification('success', 'Solicitud colocada en gestión bancaria.');
      if (selectedPayout?.id === payout.id) {
        setIsDetailOpen(false);
      }
    } catch (err) {
      const msg = extractApiErrorMessage(err, 'No se pudo pasar la solicitud a gestión');
      showNotification('error', msg);
    }
  };

  const handleOpenPayModal = (payout: AdminPayoutItem) => {
    setSelectedPayout(payout);
    setIsDetailOpen(false);
    setResolveMode('paid');
  };

  const handleOpenRejectModal = (payout: AdminPayoutItem) => {
    setSelectedPayout(payout);
    setIsDetailOpen(false);
    setResolveMode('rejected');
  };

  const handleConfirmResolve = async (payload: AdminResolvePayoutPayload) => {
    if (!selectedPayout) return;
    try {
      await resolveMutation.mutateAsync({
        payoutId: selectedPayout.id,
        payload,
      });

      if (payload.status === 'paid') {
        showNotification('success', '¡Retiro marcado como pagado exitosamente!');
      } else {
        showNotification('success', 'Solicitud de retiro rechazada.');
      }

      setResolveMode(null);
      setSelectedPayout(null);
    } catch (err) {
      const msg = extractApiErrorMessage(
        err,
        payload.status === 'paid'
          ? 'Error al completar el pago del retiro'
          : 'Error al rechazar el retiro'
      );
      showNotification('error', msg);
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Header y Acciones Globales */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">
            Retiros y Billeteras
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Gestión manual de transferencias bancarias y resolución de retiros de conductores.
          </p>
        </div>

        <button
          onClick={() => refetch()}
          disabled={isFetching}
          className="flex items-center gap-2 px-3.5 py-2 bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border rounded-lg text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors shadow-sm disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? 'animate-spin' : ''}`} />
          <span>Actualizar cola</span>
        </button>
      </div>

      {/* Banner de Feedback flotante/inline */}
      {feedback && (
        <div
          className={`p-4 rounded-xl text-xs font-semibold flex items-center justify-between gap-3 shadow-md animate-in fade-in duration-200 ${
            feedback.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800/50'
              : 'bg-red-50 text-red-800 border border-red-200 dark:bg-red-950/60 dark:text-red-300 dark:border-red-800/50'
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-600 dark:text-emerald-400" />
            ) : (
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-600 dark:text-red-400" />
            )}
            <span>{feedback.message}</span>
          </div>
          <button
            onClick={() => setFeedback(null)}
            className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 text-sm"
          >
            ✕
          </button>
        </div>
      )}

      {/* Métricas KPI */}
      <PayoutsKPIs />

      {/* Filtros: Pestañas de Estado y Búsqueda */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Tabs de Estado */}
        <div className="flex items-center gap-1 p-1 bg-gray-100/80 dark:bg-dark-surface border border-gray-200/80 dark:border-dark-border rounded-xl overflow-x-auto scrollbar-none">
          {STATUS_TABS.map((tab) => {
            const isActive = statusParam === tab.value;
            return (
              <button
                key={tab.value}
                onClick={() => handleTabChange(tab.value)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-white dark:bg-obsidian text-gray-900 dark:text-champagne-gold shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Buscador de Conductor */}
        <div className="relative w-full md:w-80">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            placeholder="Filtrar por UUID de conductor..."
            value={driverIdParam}
            onChange={handleDriverSearch}
            className="w-full pl-9 pr-4 py-2 bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border rounded-xl text-xs text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-champagne-gold/50 focus:border-champagne-gold transition-all shadow-sm"
          />
        </div>
      </div>

      {/* Tabla Principal */}
      <PayoutsTable
        payouts={data?.payouts || []}
        pagination={data?.pagination}
        isLoading={isLoading}
        isError={isError}
        onPageChange={handlePageChange}
        onViewDetail={handleOpenDetail}
        onApprove={handleApprove}
        onPay={handleOpenPayModal}
        onReject={handleOpenRejectModal}
      />

      {/* Modal de Detalle */}
      <PayoutDetailModal
        payout={selectedPayout}
        isOpen={isDetailOpen}
        onClose={() => {
          setIsDetailOpen(false);
          setSelectedPayout(null);
        }}
        onApprove={handleApprove}
        onPay={handleOpenPayModal}
        onReject={handleOpenRejectModal}
        isResolving={resolveMutation.isPending}
      />

      {/* Modal de Resolución (Pagar con comprobante o Rechazar) */}
      <PayoutResolveModal
        payout={selectedPayout}
        mode={resolveMode}
        isOpen={Boolean(resolveMode)}
        onClose={() => {
          setResolveMode(null);
        }}
        onConfirm={handleConfirmResolve}
        isLoading={resolveMutation.isPending}
      />
    </div>
  );
};

export default PayoutsScreen;
