import React from 'react';
import { createColumnHelper, flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Inbox, CalendarClock, MapPin } from 'lucide-react';
import type { RefundClaim, RefundClaimPagination, RefundClaimListStatus } from '../../../core/refundClaims/refundClaim.api';
import { cancellationReasonLabel, paymentMethodLabel } from '../../../core/refundClaims/refundClaim.api';
import { RefundClaimStatusBadge } from './RefundClaimStatusBadge';

interface RefundClaimsTableProps {
  claims: RefundClaim[];
  pagination: RefundClaimPagination | undefined;
  isLoading: boolean;
  isError: boolean;
  activeTab: RefundClaimListStatus;
  onPageChange: (page: number) => void;
  onResolve: (claim: RefundClaim) => void;
}

const columnHelper = createColumnHelper<RefundClaim>();

function formatMoney(amount: string, currency: string): string {
  const value = Number.parseFloat(amount) || 0;
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: currency || 'ARS',
    minimumFractionDigits: 2,
  }).format(value);
}

function formatDate(value: string | null): string {
  if (!value) return '—';
  try {
    return format(new Date(value), 'dd/MM/yyyy HH:mm', { locale: es });
  } catch {
    return value;
  }
}

export const RefundClaimsTable: React.FC<RefundClaimsTableProps> = ({
  claims,
  pagination,
  isLoading,
  isError,
  activeTab,
  onPageChange,
  onResolve,
}) => {
  // Campos aditivos de `feature/reclamos-detalle`: si el backend desplegado
  // todavia no los manda, `claimAmount`/`resolution` quedan en `null` para
  // todos los reclamos (ver `parseClaimItem`). En ese caso se esconden las
  // columnas de detalle en vez de mostrarlas vacias.
  const hasDetailedAmounts = claims.some((claim) => claim.claimAmount !== null);
  const hasResolutionDetails = activeTab === 'resolved' && claims.some((claim) => claim.resolution !== null);

  const columns = React.useMemo(() => {
    const cols = [
      columnHelper.accessor('cancelledAt', {
        header: 'CANCELADO',
        cell: (info) => (
          <span className="text-xs text-gray-600 dark:text-gray-400 whitespace-nowrap">
            {formatDate(info.getValue())}
          </span>
        ),
      }),

      columnHelper.display({
        id: 'passenger',
        header: 'PASAJERO',
        cell: (info) => {
          const claim = info.row.original;
          const fullName = claim.passenger ? `${claim.passenger.firstName} ${claim.passenger.lastName}`.trim() : '';
          return (
            <div className="flex flex-col max-w-[200px]">
              <span className="text-[13px] font-semibold text-gray-900 dark:text-white truncate">
                {fullName || `ID ${claim.passengerUserId.slice(0, 8)}…`}
              </span>
              {claim.passenger?.email && (
                <span className="text-[11px] text-gray-500 dark:text-gray-400 truncate">{claim.passenger.email}</span>
              )}
            </div>
          );
        },
      }),

      columnHelper.display({
        id: 'trip',
        header: 'VIAJE',
        cell: (info) => {
          const claim = info.row.original;
          const isScheduled = claim.bookingType === 'scheduled';
          return (
            <div className="flex flex-col gap-0.5">
              <span className="text-xs font-mono font-semibold text-gray-800 dark:text-gray-200">
                {claim.tripPublicCode}
              </span>
              {claim.bookingType && (
                <span className="inline-flex items-center gap-1 text-[11px] text-gray-500 dark:text-gray-400">
                  {isScheduled ? <CalendarClock className="w-3 h-3" /> : <MapPin className="w-3 h-3" />}
                  {isScheduled ? 'Reservado' : 'Inmediato'}
                </span>
              )}
            </div>
          );
        },
      }),

      columnHelper.accessor('paymentMethod', {
        header: 'MEDIO DE PAGO',
        cell: (info) => (
          <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
            {paymentMethodLabel(info.getValue())}
          </span>
        ),
      }),

      columnHelper.accessor('cancellationReasonCode', {
        header: 'MOTIVO',
        cell: (info) => (
          <span className="text-xs text-gray-600 dark:text-gray-400">{cancellationReasonLabel(info.getValue())}</span>
        ),
      }),
    ];

    if (hasDetailedAmounts) {
      cols.push(
        columnHelper.display({
          id: 'claimAmount',
          header: 'RECLAMADO',
          cell: (info) => {
            const claim = info.row.original;
            const value = claim.claimAmount ?? claim.amount;
            return (
              <span className="text-[13px] font-bold text-gray-900 dark:text-white font-mono">
                {formatMoney(value, claim.currency)}
              </span>
            );
          },
        }),
        columnHelper.display({
          id: 'refundedAmount',
          header: 'DEVUELTO',
          cell: (info) => {
            const claim = info.row.original;
            return (
              <span className="text-[13px] font-semibold text-emerald-700 dark:text-emerald-400 font-mono">
                {formatMoney(claim.refundedAmount ?? '0', claim.currency)}
              </span>
            );
          },
        }),
        columnHelper.display({
          id: 'pendingAmount',
          header: 'PENDIENTE',
          cell: (info) => {
            const claim = info.row.original;
            return (
              <span className="text-[13px] font-semibold text-amber-700 dark:text-amber-400 font-mono">
                {formatMoney(claim.pendingAmount ?? '0', claim.currency)}
              </span>
            );
          },
        }),
      );
    } else {
      cols.push(
        columnHelper.accessor('amount', {
          header: activeTab === 'pending' ? 'MONTO RECLAMADO' : 'MONTO DEVUELTO',
          cell: (info) => (
            <span className="text-[13px] font-bold text-gray-900 dark:text-white font-mono">
              {formatMoney(info.getValue(), info.row.original.currency)}
            </span>
          ),
        }),
      );
    }

    cols.push(
      columnHelper.display({
        id: 'status',
        header: 'ESTADO',
        cell: (info) => {
          const claim = info.row.original;
          return (
            <div className="flex flex-col gap-1">
              <RefundClaimStatusBadge status={claim.refundStatus} />
              {claim.refundResolutionMode && (
                <span className="text-[11px] text-gray-500 dark:text-gray-400">
                  {claim.refundResolutionMode === 'mercado_pago' ? 'Mercado Pago' : 'Manual'}
                </span>
              )}
            </div>
          );
        },
      }),
    );

    if (hasResolutionDetails) {
      cols.push(
        columnHelper.display({
          id: 'resolution',
          header: 'RESOLUCIÓN',
          cell: (info) => {
            const resolution = info.row.original.resolution;
            if (!resolution) return <span className="text-xs text-gray-400">—</span>;
            const resolvedByName = resolution.resolvedBy
              ? `${resolution.resolvedBy.firstName} ${resolution.resolvedBy.lastName}`.trim()
              : null;
            return (
              <div className="flex flex-col gap-0.5 max-w-[220px]">
                <span className="text-[11px] font-semibold text-gray-700 dark:text-gray-300">
                  {resolution.mode === 'mercado_pago' ? 'Mercado Pago' : 'Manual'}
                  {resolution.manualReference ? ` · ${resolution.manualReference}` : ''}
                </span>
                {resolution.notes && (
                  <span className="text-[11px] text-gray-500 dark:text-gray-400 truncate" title={resolution.notes}>
                    {resolution.notes}
                  </span>
                )}
                <span className="text-[11px] text-gray-400 dark:text-gray-500">
                  {resolvedByName ? `${resolvedByName} · ` : ''}
                  {formatDate(resolution.resolvedAt)}
                </span>
              </div>
            );
          },
        }),
      );
    }

    cols.push(
      columnHelper.display({
        id: 'actions',
        header: 'ACCIONES',
        cell: (info) => {
          const claim = info.row.original;
          if (claim.refundStatus !== 'claim_required') {
            return <span className="text-xs text-gray-400">—</span>;
          }
          return (
            <button
              type="button"
              onClick={() => onResolve(claim)}
              className="px-3 py-1.5 text-xs font-bold rounded-md bg-champagne-gold text-obsidian hover:bg-champagne-gold/90 transition-all shadow-sm"
            >
              Resolver
            </button>
          );
        },
      }),
    );

    return cols;
  }, [activeTab, hasDetailedAmounts, hasResolutionDetails, onResolve]);

  const table = useReactTable({
    data: claims,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  if (isError) {
    return (
      <div className="w-full p-8 text-center bg-white dark:bg-dark-surface border border-red-200 dark:border-red-900/30 rounded-xl">
        <p className="text-sm font-semibold text-red-600 dark:text-red-400">
          Ocurrió un error al cargar los reclamos de reembolso.
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Por favor, reintentá recargar o revisá tu conexión.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border rounded-xl shadow-sm overflow-hidden flex flex-col">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr
                key={headerGroup.id}
                className="border-b border-gray-200/80 dark:border-dark-border bg-gray-50/70 dark:bg-white/[0.02]"
              >
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-4 py-3.5 text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider select-none"
                  >
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-dark-border/60">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, idx) => (
                <tr key={idx} className="animate-pulse">
                  {Array.from({ length: columns.length }).map((__, cellIdx) => (
                    <td key={cellIdx} className="px-4 py-4">
                      <div className="h-4 bg-gray-200 dark:bg-white/10 rounded w-20" />
                    </td>
                  ))}
                </tr>
              ))
            ) : claims.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-16 text-center">
                  <div className="flex flex-col items-center justify-center">
                    <div className="p-3 bg-gray-100 dark:bg-white/5 rounded-full text-gray-400 mb-3">
                      <Inbox className="w-8 h-8" />
                    </div>
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">
                      {activeTab === 'pending' ? 'No hay reclamos pendientes' : 'No hay reclamos resueltos'}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400 mt-1 max-w-sm">
                      No hay registros para este filtro en este momento.
                    </span>
                  </div>
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  className="hover:bg-gray-50/80 dark:hover:bg-white/[0.02] transition-colors"
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-4 py-3.5 align-middle">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 dark:border-dark-border bg-gray-50/50 dark:bg-white/[0.01]">
          <span className="text-xs text-gray-500 dark:text-gray-400">
            Página <span className="font-semibold">{pagination.page}</span> de{' '}
            <span className="font-semibold">{pagination.totalPages}</span> ({pagination.total} reclamos)
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onPageChange(pagination.page - 1)}
              disabled={pagination.page <= 1}
              className="p-1.5 border border-gray-200 dark:border-dark-border rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              title="Página anterior"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => onPageChange(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages}
              className="p-1.5 border border-gray-200 dark:border-dark-border rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              title="Página siguiente"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
