import React, { useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, RefreshCw, AlertCircle, CheckCircle2, Zap, Filter } from 'lucide-react';
import type {
  AdminPayoutItem,
  AdminPayoutFilterStatus,
  AdminPayoutFilterType,
  AdminResolvePayoutPayload,
  AdminPayoutStatus,
  AdminPayoutType,
} from '../../core/payouts/interfaces/payout.interface';
import { usePayouts } from './hooks/usePayouts';
import { useResolvePayout } from './hooks/useResolvePayout';
import { PayoutsKPIs } from './components/PayoutsKPIs';
import { PayoutsTable } from './components/PayoutsTable';
import { PayoutDetailModal } from './components/PayoutDetailModal';
import { PayoutResolveModal } from './components/PayoutResolveModal';
import { RunWeeklyBatchModal } from './components/RunWeeklyBatchModal';
import { extractApiErrorMessage } from '../../core/api/adminApi';

const STATUS_TABS: { value: AdminPayoutFilterStatus; label: string }[] = [
  { value: 'pending', label: 'Pendientes' },
  { value: 'processing', label: 'En gestión' },
  { value: 'completed', label: 'Completadas' },
  { value: 'failed', label: 'Rechazadas' },
  { value: 'all', label: 'Todas' },
];

const TYPE_OPTIONS: { value: AdminPayoutFilterType; label: string }[] = [
  { value: 'all', label: 'Todos los tipos' },
  { value: 'immediate', label: 'Inmediato ($500 fee)' },
  { value: 'weekly', label: 'Semanal Automático (Sin fee)' },
];

export const PayoutsScreen: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Params de URL
  const currentPage = parseInt(searchParams.get('page') || '1', 10);
  const rawStatusParam = searchParams.get('status') as AdminPayoutFilterStatus | null;
  // Compatibilidad con viejo 'requested'
  const statusParam: AdminPayoutFilterStatus =
    rawStatusParam === 'requested' ? 'pending' : rawStatusParam || 'pending';

  const typeParam = (searchParams.get('type') as AdminPayoutFilterType) || 'all';
  const driverIdParam = searchParams.get('driver_id') || '';

  // Filtros para la query
  const queryFilters = {
    page: currentPage,
    limit: 15,
    ...(statusParam !== 'all' ? { status: statusParam as AdminPayoutStatus } : {}),
    ...(typeParam !== 'all' ? { type: typeParam as AdminPayoutType } : {}),
    ...(driverIdParam ? { driver_id: driverIdParam } : {}),
  };

  const { data, isLoading, isError, refetch, isFetching } = usePayouts(queryFilters);
  const resolveMutation = useResolvePayout();

  // Modales
  const [selectedPayout, setSelectedPayout] = useState<AdminPayoutItem | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [resolveMode, setResolveMode] = useState<'completed' | 'failed' | null>(null);
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);

  // Notificaciones de feedback temporal
  const [feedback, setFeedback] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  const showNotification = (type: 'success' | 'error', message: string) => {
    setFeedback({ type, message });
    setTimeout(() => {
      setFeedback(null);
    }, 5000);
  };

  // Handlers de cambio de filtros
  const handleTabChange = useCallback(
    (newStatus: AdminPayoutFilterStatus) => {
      setSearchParams((prev) => {
        if (newStatus === 'pending') {
          prev.delete('status'); // 'pending' es el default
        } else {
          prev.set('status', newStatus);
        }
        prev.set('page', '1');
        return prev;
      });
    },
    [setSearchParams]
  );

  const handleTypeChange = useCallback(
    (newType: AdminPayoutFilterType) => {
      setSearchParams((prev) => {
        if (newType === 'all') {
          prev.delete('type');
        } else {
          prev.set('type', newType);
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
        payload: { status: 'processing' },
      });
      showNotification('success', 'Solicitud colocada en gestión bancaria.');
      if (selectedPayout?.id === payout.id) {
        setIsDetailOpen(false);
      }
    } catch (err) {
      const msg = extractApiErrorMessage(err, 'No se pudo pasar la solicitud a gestión bancaria');
      showNotification('error', msg);
    }
  };

  const handleOpenPayModal = (payout: AdminPayoutItem) => {
    setSelectedPayout(payout);
    setIsDetailOpen(false);
    setResolveMode('completed');
  };

  const handleOpenRejectModal = (payout: AdminPayoutItem) => {
    setSelectedPayout(payout);
    setIsDetailOpen(false);
    setResolveMode('failed');
  };

  const handleConfirmResolve = async (payload: AdminResolvePayoutPayload) => {
    if (!selectedPayout) return;
    try {
      await resolveMutation.mutateAsync({
        payoutId: selectedPayout.id,
        payload,
      });

      if (payload.status === 'completed' || payload.status === 'paid') {
        showNotification('success', '¡Retiro marcado como completado y transferido exitosamente!');
      } else {
        showNotification('success', 'Solicitud de retiro rechazada. El saldo fue reintegrado al chofer.');
      }

      setResolveMode(null);
      setSelectedPayout(null);
    } catch (err) {
      const msg = extractApiErrorMessage(
        err,
        payload.status === 'completed' || payload.status === 'paid'
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
            Gestión de Retiros
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Cola de transferencias bancarias manuales y liquidación semanal de conductores.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsBatchModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-champagne-gold/15 dark:bg-champagne-gold/10 hover:bg-champagne-gold/25 dark:hover:bg-champagne-gold/20 border border-champagne-gold/40 text-xs font-bold text-amber-900 dark:text-champagne-gold rounded-lg transition-all shadow-sm"
            title="Ejecutar corrida manual de liquidación semanal"
          >
            <Zap className="w-3.5 h-3.5 text-amber-600 dark:text-champagne-gold" />
            <span>Ejecutar Lote Semanal</span>
          </button>

          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="flex items-center gap-2 px-3.5 py-2 bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border rounded-lg text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors shadow-sm disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? 'animate-spin' : ''}`} />
            <span>Actualizar</span>
          </button>
        </div>
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

      {/* Barra de Filtros: Pestañas de Estado, Selector de Tipo y Buscador */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
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

        {/* Filtro por Tipo y Buscador de Conductor */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Selector de Tipo */}
          <div className="relative min-w-[200px]">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
              <Filter className="w-3.5 h-3.5" />
            </div>
            <select
              value={typeParam}
              onChange={(e) => handleTypeChange(e.target.value as AdminPayoutFilterType)}
              className="w-full pl-8 pr-8 py-2 bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border rounded-xl text-xs font-medium text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-champagne-gold/50 focus:border-champagne-gold transition-all shadow-sm cursor-pointer appearance-none"
            >
              {TYPE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value} className="bg-white dark:bg-dark-surface">
                  {opt.label}
                </option>
              ))}
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 text-xs">
              ▼
            </div>
          </div>

          {/* Buscador de Conductor */}
          <div className="relative w-full sm:w-64">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              placeholder="Filtrar por UUID chofer..."
              value={driverIdParam}
              onChange={handleDriverSearch}
              className="w-full pl-9 pr-4 py-2 bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border rounded-xl text-xs text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-champagne-gold/50 focus:border-champagne-gold transition-all shadow-sm"
            />
          </div>
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

      {/* Modal de Resolución (Marcar como transferido o Rechazar) */}
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

      {/* Modal de Confirmación de Lote Semanal */}
      <RunWeeklyBatchModal
        isOpen={isBatchModalOpen}
        onClose={() => setIsBatchModalOpen(false)}
        onSuccessMessage={(msg) => showNotification('success', msg)}
      />
    </div>
  );
};

export default PayoutsScreen;
