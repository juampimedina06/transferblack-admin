import React, { useMemo } from 'react';
import { createColumnHelper, flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { ArrowRight, CalendarClock, Inbox } from 'lucide-react';
import { TripsBadge } from '../../trips/components/TripsBadge';
import { ScheduledTripPaymentBadge } from './ScheduledTripPaymentBadge';
import type { ScheduledTrip, ScheduledTripPagination } from '../../../core/scheduledTrips/scheduledTrip.api';

interface ScheduledTripsTableProps {
  trips: ScheduledTrip[];
  pagination: ScheduledTripPagination | undefined;
  isLoading: boolean;
  isError: boolean;
  /** Viajes con una alerta abierta (chofer no disponible, sin cobrar, sin aceptar, cobro duplicado). */
  attentionTripIds: Set<string>;
  onPageChange: (page: number) => void;
  onSelectTrip: (trip: ScheduledTrip) => void;
}

const columnHelper = createColumnHelper<ScheduledTrip>();

/** Avisa antes de que el backend llegue a alertar: faltan menos de 2hs y todavia no esta pago. */
const SOON_UNPAID_WINDOW_MS = 2 * 60 * 60 * 1000;

function formatCurrency(amount: string, currency = 'ARS') {
  const num = parseFloat(amount);
  if (Number.isNaN(num)) return '—';
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: currency || 'ARS',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);
}

export const ScheduledTripsTable: React.FC<ScheduledTripsTableProps> = ({
  trips,
  pagination,
  isLoading,
  isError,
  attentionTripIds,
  onPageChange,
  onSelectTrip,
}) => {
  const needsAttention = (trip: ScheduledTrip): boolean => {
    if (attentionTripIds.has(trip.id)) return true;
    if (trip.status !== 'scheduled' || trip.prepaid_at) return false;
    return new Date(trip.scheduled_at).getTime() - Date.now() < SOON_UNPAID_WINDOW_MS;
  };

  const columns = useMemo(
    () => [
      columnHelper.accessor('scheduled_at', {
        header: 'RETIRO',
        cell: (info) => (
          <div className="flex items-center gap-1.5 whitespace-nowrap text-xs text-gray-700 dark:text-gray-200">
            <CalendarClock className="h-3.5 w-3.5 shrink-0 text-gray-400" />
            {format(new Date(info.getValue()), "dd/MM/yyyy HH:mm", { locale: es })}
          </div>
        ),
      }),
      columnHelper.accessor('passenger', {
        header: 'PASAJERO',
        cell: (info) => {
          const passenger = info.getValue();
          const name = `${passenger.first_name} ${passenger.last_name}`.trim() || passenger.email;
          return (
            <div className="max-w-[160px]">
              <p className="truncate text-xs font-medium text-gray-900 dark:text-white" title={name}>
                {name}
              </p>
              <p className="truncate text-[11px] text-gray-400">{passenger.email}</p>
            </div>
          );
        },
      }),
      columnHelper.display({
        id: 'route',
        header: 'ORIGEN → DESTINO',
        cell: ({ row }) => {
          const { origin, destination } = row.original;
          return (
            <div
              className="flex max-w-[240px] items-center gap-1 truncate text-xs text-gray-600 dark:text-gray-300"
              title={`${origin.address} → ${destination.address}`}
            >
              <span className="truncate">{origin.address}</span>
              <ArrowRight className="h-3 w-3 shrink-0 text-gray-400" />
              <span className="truncate">{destination.address}</span>
            </div>
          );
        },
      }),
      columnHelper.accessor('agreed_fare', {
        header: 'PRECIO ACORDADO',
        cell: (info) => (
          <span className="whitespace-nowrap font-mono text-xs font-semibold text-gray-900 dark:text-white">
            {formatCurrency(info.getValue(), info.row.original.currency)}
          </span>
        ),
      }),
      columnHelper.accessor('status', {
        header: 'ESTADO DEL VIAJE',
        cell: (info) => <TripsBadge status={info.getValue()} />,
      }),
      columnHelper.display({
        id: 'payment',
        header: 'COBRO',
        cell: ({ row }) => <ScheduledTripPaymentBadge prepaidAt={row.original.prepaid_at} />,
      }),
      columnHelper.display({
        id: 'driver',
        header: 'CHOFER RESERVADO',
        cell: ({ row }) => {
          const driver = row.original.reserved_driver;
          if (!driver) {
            return <span className="text-xs italic text-gray-400">Sin chofer</span>;
          }
          return (
            <span className="truncate text-xs font-medium text-gray-800 dark:text-gray-200">
              {driver.first_name} {driver.last_name}
            </span>
          );
        },
      }),
    ],
    [],
  );

  const table = useReactTable({
    data: trips,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
  });

  if (isError) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center dark:border-red-900/40 dark:bg-red-950/20">
        <p className="font-medium text-red-600 dark:text-red-400">Ocurrió un error al cargar los viajes reservados.</p>
      </div>
    );
  }

  const currentPage = pagination?.page ?? 1;
  const totalPages = pagination?.total_pages ?? 1;
  const total = pagination?.total ?? 0;

  return (
    <div className="flex w-full flex-col overflow-hidden rounded-xl border border-gray-200/80 bg-white shadow-sm dark:border-dark-border dark:bg-dark-surface">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id} className="border-b border-gray-100 bg-gray-50/60 dark:border-dark-border dark:bg-dark-card">
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="whitespace-nowrap px-5 py-3 text-[10.5px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400"
                  >
                    {flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-dark-border">
            {isLoading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  {columns.map((_, j) => (
                    <td key={j} className="px-5 py-3">
                      <div className="h-4 w-24 rounded bg-gray-200 dark:bg-white/10" />
                    </td>
                  ))}
                </tr>
              ))
            ) : table.getRowModel().rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="py-14 text-center">
                  <div className="flex flex-col items-center justify-center text-gray-500 dark:text-gray-400">
                    <Inbox className="mb-3 h-12 w-12 text-gray-300 dark:text-gray-600" />
                    <p className="text-base font-semibold text-gray-900 dark:text-white">No hay viajes reservados</p>
                    <p className="mt-1 text-xs text-gray-500">Ajustá los filtros o creá una reserva nueva.</p>
                  </div>
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => {
                const attention = needsAttention(row.original);
                return (
                  <tr
                    key={row.id}
                    onClick={() => onSelectTrip(row.original)}
                    className={`h-[52px] cursor-pointer text-gray-800 transition-colors dark:text-gray-200 ${
                      attention
                        ? 'bg-amber-50/70 hover:bg-amber-100/70 dark:bg-amber-950/20 dark:hover:bg-amber-900/30'
                        : 'hover:bg-gray-50/70 dark:hover:bg-white/5'
                    }`}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-5 whitespace-nowrap">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col items-center justify-between gap-3 border-t border-gray-100 bg-white px-5 py-3 text-xs dark:border-dark-border dark:bg-dark-surface sm:flex-row">
        <span className="text-gray-500 dark:text-gray-400">
          {total} viaje{total === 1 ? '' : 's'} reservado{total === 1 ? '' : 's'}
        </span>
        <div className="flex items-center gap-1">
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage <= 1 || isLoading}
            className="rounded border border-gray-200 px-2.5 py-1 text-xs text-gray-600 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-dark-border dark:text-gray-300 dark:hover:bg-white/5"
          >
            Anterior
          </button>
          <span className="px-2 text-gray-500 dark:text-gray-400">
            Página {currentPage} de {Math.max(totalPages, 1)}
          </span>
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage >= totalPages || isLoading}
            className="rounded border border-gray-200 px-2.5 py-1 text-xs text-gray-600 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-dark-border dark:text-gray-300 dark:hover:bg-white/5"
          >
            Siguiente
          </button>
        </div>
      </div>
    </div>
  );
};
