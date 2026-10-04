import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { RefreshCw } from 'lucide-react';
import type { RefundClaim, RefundClaimListStatus } from '../../core/refundClaims/refundClaim.api';
import { refundClaimListStatuses } from '../../core/refundClaims/refundClaim.api';
import { useRefundClaims } from './hooks/useRefundClaims';
import { useRefundClaimTripDetails } from './hooks/useRefundClaimTripDetails';
import { RefundClaimsTable } from './components/RefundClaimsTable';
import { ResolveRefundClaimModal } from './components/ResolveRefundClaimModal';

const STATUS_TABS: { value: RefundClaimListStatus; label: string }[] = [
  { value: 'pending', label: 'Pendientes' },
  { value: 'resolved', label: 'Resueltos' },
];

function isRefundClaimListStatus(value: string | null): value is RefundClaimListStatus {
  return (refundClaimListStatuses as readonly string[]).includes(value ?? '');
}

export const RefundClaimsScreen: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const activeTab: RefundClaimListStatus = isRefundClaimListStatus(searchParams.get('status'))
    ? (searchParams.get('status') as RefundClaimListStatus)
    : 'pending';
  const currentPage = Number(searchParams.get('page')) || 1;

  const { data, isLoading, isError, refetch, isFetching } = useRefundClaims({
    status: activeTab,
    page: currentPage,
    limit: 15,
  });

  const tripIds = (data?.claims ?? []).map((claim) => claim.tripId);
  const { detailsByTripId } = useRefundClaimTripDetails(tripIds);

  const [selectedClaim, setSelectedClaim] = useState<RefundClaim | null>(null);

  const handleTabChange = (tab: RefundClaimListStatus) => {
    setSearchParams((prev) => {
      if (tab === 'pending') {
        prev.delete('status');
      } else {
        prev.set('status', tab);
      }
      prev.set('page', '1');
      return prev;
    });
  };

  const handlePageChange = (newPage: number) => {
    setSearchParams((prev) => {
      prev.set('page', newPage.toString());
      return prev;
    });
  };

  return (
    <div className="flex flex-col gap-6 w-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">Reclamos de reembolso</h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Cancelaciones fuera de la ventana de reembolso automático y viajes reservados prepago: resolvelas por
            Mercado Pago o a mano.
          </p>
        </div>

        <button
          onClick={() => refetch()}
          disabled={isFetching}
          className="flex items-center gap-2 px-3.5 py-2 bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border rounded-lg text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors shadow-sm disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? 'animate-spin' : ''}`} />
          <span>Actualizar</span>
        </button>
      </div>

      <div className="flex items-center gap-1 p-1 bg-gray-100/80 dark:bg-dark-surface border border-gray-200/80 dark:border-dark-border rounded-xl w-fit">
        {STATUS_TABS.map((tab) => {
          const isActive = activeTab === tab.value;
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

      <RefundClaimsTable
        claims={data?.claims ?? []}
        pagination={data?.pagination}
        isLoading={isLoading}
        isError={isError}
        activeTab={activeTab}
        detailsByTripId={detailsByTripId}
        onPageChange={handlePageChange}
        onResolve={setSelectedClaim}
      />

      <ResolveRefundClaimModal claim={selectedClaim} isOpen={Boolean(selectedClaim)} onClose={() => setSelectedClaim(null)} />
    </div>
  );
};

export default RefundClaimsScreen;
