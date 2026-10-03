import React, { useState } from 'react';
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  ChevronLeft,
  ChevronRight,
  Inbox,
  Copy,
  Check,
  Eye,
  ExternalLink,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import type { AdminPayoutItem, AdminPayoutPagination } from '../../../core/payouts/interfaces/payout.interface';
import { PayoutBadge } from './PayoutBadge';

interface PayoutsTableProps {
  payouts: AdminPayoutItem[];
  pagination: AdminPayoutPagination | undefined;
  isLoading: boolean;
  isError: boolean;
  onPageChange: (page: number) => void;
  onViewDetail: (payout: AdminPayoutItem) => void;
  onApprove: (payout: AdminPayoutItem) => void;
  onPay: (payout: AdminPayoutItem) => void;
  onReject: (payout: AdminPayoutItem) => void;
}

const columnHelper = createColumnHelper<AdminPayoutItem>();

export const PayoutsTable: React.FC<PayoutsTableProps> = ({
  payouts,
  pagination,
  isLoading,
  isError,
  onPageChange,
  onViewDetail,
  onApprove,
  onPay,
  onReject,
}) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(id);
    setTimeout(() => {
      setCopiedKey(null);
    }, 2000);
  };

  const columns = React.useMemo(
    () => [
      columnHelper.accessor('account_holder_name', {
        header: 'CONDUCTOR / TITULAR',
        cell: (info) => {
          const row = info.row.original;
          return (
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="text-[13px] font-semibold text-gray-900 dark:text-white">
                  {row.account_holder_name || 'Conductor'}
                </span>
                <Link
                  to={`/conductores/${row.driver_id}`}
                  title="Ver perfil de conductor"
                  className="text-gray-400 hover:text-champagne-gold transition-colors"
                  onClick={(e) => e.stopPropagation()}
                >
                  <ExternalLink className="w-3 h-3" />
                </Link>
              </div>
              <span className="text-[11px] font-mono text-gray-500 dark:text-gray-400">
                CUIT/DNI: {row.account_holder_document || '-'}
              </span>
            </div>
          );
        },
      }),

      columnHelper.accessor('amount', {
        header: 'IMPORTE PEDIDO',
        cell: (info) => {
          const val = parseFloat(info.getValue()) || 0;
          const formatted = new Intl.NumberFormat('es-AR', {
            style: 'currency',
            currency: info.row.original.currency || 'ARS',
            minimumFractionDigits: 2,
          }).format(val);

          return (
            <span className="text-[14px] font-bold text-gray-900 dark:text-white font-mono">
              {formatted}
            </span>
          );
        },
      }),

      columnHelper.accessor('destination_cbu_cvu', {
        header: 'MEDIO / CBU / ALIAS',
        cell: (info) => {
          const row = info.row.original;
          const isCopied = copiedKey === row.id;
          const cbu = row.destination_cbu_cvu;
          const displayCbu = cbu
            ? cbu.length >= 8
              ? `${cbu.slice(0, 4)}...${cbu.slice(-4)}`
              : cbu
            : null;

          return (
            <div className="flex flex-col max-w-[210px]">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                  {row.payment_method || 'CBU / CVU'}
                </span>
                {row.destination_alias && (
                  <span className="text-xs font-mono text-gray-600 dark:text-gray-400 truncate" title={row.destination_alias}>
                    • {row.destination_alias}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1 text-[11px] font-mono text-gray-500 dark:text-gray-400">
                {displayCbu ? (
                  <>
                    <span className="truncate" title={cbu || undefined}>
                      {displayCbu}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (cbu) handleCopy(cbu, row.id);
                      }}
                      className="p-0.5 text-gray-400 hover:text-champagne-gold transition-colors"
                      title="Copiar CBU/CVU de 22 dígitos"
                    >
                      {isCopied ? (
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </>
                ) : (
                  <span>{row.destination_alias ? 'Solo Alias' : '-'}</span>
                )}
              </div>
            </div>
          );
        },
      }),

      columnHelper.accessor('requested_at', {
        header: 'SOLICITADO',
        cell: (info) => {
          const dateStr = info.getValue();
          try {
            return (
              <span className="text-xs text-gray-600 dark:text-gray-400 whitespace-nowrap">
                {format(new Date(dateStr), "dd/MM/yyyy HH:mm", { locale: es })}
              </span>
            );
          } catch {
            return <span className="text-xs text-gray-500">{dateStr}</span>;
          }
        },
      }),

      columnHelper.accessor('status', {
        header: 'ESTADO',
        cell: (info) => <PayoutBadge status={info.getValue()} />,
      }),

      columnHelper.display({
        id: 'actions',
        header: 'ACCIONES',
        cell: (info) => {
          const row = info.row.original;

          return (
            <div className="flex items-center gap-1.5 justify-end" onClick={(e) => e.stopPropagation()}>
              {/* Para solicitados: Botón En gestión y Rechazar */}
              {row.status === 'requested' && (
                <>
                  <button
                    type="button"
                    onClick={() => onApprove(row)}
                    title="Pasar a En Gestión"
                    className="px-2.5 py-1 text-xs font-semibold rounded-md bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800/40 hover:bg-sky-100 transition-colors"
                  >
                    En gestión
                  </button>
                  <button
                    type="button"
                    onClick={() => onReject(row)}
                    title="Rechazar solicitud"
                    className="px-2.5 py-1 text-xs font-semibold rounded-md text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                  >
                    Rechazar
                  </button>
                </>
              )}

              {/* Para approved (en gestión): Botón Pagar y Rechazar */}
              {row.status === 'approved' && (
                <>
                  <button
                    type="button"
                    onClick={() => onPay(row)}
                    title="Completar pago con comprobante"
                    className="px-3 py-1 text-xs font-bold rounded-md bg-champagne-gold text-obsidian hover:bg-champagne-gold/90 transition-all shadow-sm"
                  >
                    Pagar
                  </button>
                  <button
                    type="button"
                    onClick={() => onReject(row)}
                    title="Rechazar solicitud"
                    className="px-2 py-1 text-xs font-semibold rounded-md text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                  >
                    Rechazar
                  </button>
                </>
              )}

              {/* Para pagados: Ver comprobante si hay */}
              {row.status === 'paid' && row.receipt_url && (
                <a
                  href={row.receipt_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2.5 py-1 text-xs font-medium text-champagne-gold hover:underline flex items-center gap-1"
                >
                  <span>Comprobante</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}

              {/* Ver detalle general */}
              <button
                type="button"
                onClick={() => onViewDetail(row)}
                title="Ver detalle completo"
                className="p-1.5 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg transition-colors"
              >
                <Eye className="w-4 h-4" />
              </button>
            </div>
          );
        },
      }),
    ],
    [copiedKey, onApprove, onPay, onReject, onViewDetail]
  );

  const table = useReactTable({
    data: payouts,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  if (isError) {
    return (
      <div className="w-full p-8 text-center bg-white dark:bg-dark-surface border border-red-200 dark:border-red-900/30 rounded-xl">
        <p className="text-sm font-semibold text-red-600 dark:text-red-400">
          Ocurrió un error al cargar las solicitudes de retiro.
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
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-dark-border/60">
            {isLoading ? (
              // Skeleton Rows
              Array.from({ length: 5 }).map((_, idx) => (
                <tr key={idx} className="animate-pulse">
                  <td className="px-4 py-4">
                    <div className="h-4 bg-gray-200 dark:bg-white/10 rounded w-36 mb-1.5" />
                    <div className="h-3 bg-gray-100 dark:bg-white/5 rounded w-24" />
                  </td>
                  <td className="px-4 py-4">
                    <div className="h-4 bg-gray-200 dark:bg-white/10 rounded w-20" />
                  </td>
                  <td className="px-4 py-4">
                    <div className="h-4 bg-gray-200 dark:bg-white/10 rounded w-28 mb-1.5" />
                    <div className="h-3 bg-gray-100 dark:bg-white/5 rounded w-36" />
                  </td>
                  <td className="px-4 py-4">
                    <div className="h-4 bg-gray-200 dark:bg-white/10 rounded w-24" />
                  </td>
                  <td className="px-4 py-4">
                    <div className="h-5 bg-gray-200 dark:bg-white/10 rounded-full w-20" />
                  </td>
                  <td className="px-4 py-4 text-right">
                    <div className="h-8 bg-gray-200 dark:bg-white/10 rounded w-24 ml-auto" />
                  </td>
                </tr>
              ))
            ) : payouts.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-16 text-center">
                  <div className="flex flex-col items-center justify-center">
                    <div className="p-3 bg-gray-100 dark:bg-white/5 rounded-full text-gray-400 mb-3">
                      <Inbox className="w-8 h-8" />
                    </div>
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">
                      No se encontraron solicitudes de retiro
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400 mt-1 max-w-sm">
                      No hay registros para los filtros seleccionados en este momento.
                    </span>
                  </div>
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  onClick={() => onViewDetail(row.original)}
                  className="hover:bg-gray-50/80 dark:hover:bg-white/[0.02] cursor-pointer transition-colors"
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

      {/* Paginación */}
      {pagination && pagination.total_pages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 dark:border-dark-border bg-gray-50/50 dark:bg-white/[0.01]">
          <span className="text-xs text-gray-500 dark:text-gray-400">
            Página <span className="font-semibold">{pagination.page}</span> de{' '}
            <span className="font-semibold">{pagination.total_pages}</span> ({pagination.total}{' '}
            solicitudes)
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
              disabled={pagination.page >= pagination.total_pages}
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
