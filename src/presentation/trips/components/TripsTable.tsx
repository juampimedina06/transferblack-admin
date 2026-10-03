import React, { useMemo } from 'react';
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Inbox, Users, ArrowRight } from 'lucide-react';
import type { TripListItem, PaginatedTripsResponse } from '../../../core/trips/interfaces/trip.interface';
import { TripsBadge } from './TripsBadge';
import { AnimatedNumber } from '../../components/common/AnimatedNumber';

interface TripsTableProps {
  data: PaginatedTripsResponse | undefined;
  isLoading: boolean;
  isError: boolean;
  currentPage: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  onSelectTrip: (tripId: string) => void;
}

const columnHelper = createColumnHelper<TripListItem>();

const formatCurrency = (amount: string | number | null | undefined, currency = 'ARS') => {
  if (amount === null || amount === undefined || amount === '') return '—';
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(num) || num <= 0) return '—';

  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: currency || 'ARS',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);
};

export const TripsTable: React.FC<TripsTableProps> = ({
  data,
  isLoading,
  isError,
  currentPage,
  pageSize,
  onPageChange,
  onPageSizeChange,
  onSelectTrip,
}) => {
  const columns = useMemo(
    () => [
      columnHelper.accessor('publicCode', {
        header: 'CÓDIGO',
        cell: (info) => (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onSelectTrip(info.row.original.id);
            }}
            className="text-xs font-bold text-gray-900 dark:text-white hover:text-champagne-gold transition-colors text-left"
          >
            {info.getValue() || 'TB-0000'}
          </button>
        ),
      }),
      columnHelper.accessor('createdAt', {
        header: 'FECHA Y HORA',
        cell: (info) => {
          try {
            return (
              <span className="text-xs text-gray-600 dark:text-gray-300 whitespace-nowrap">
                {format(new Date(info.getValue()), 'dd/MM HH:mm', { locale: es })}
              </span>
            );
          } catch {
            return <span className="text-xs text-gray-500">—</span>;
          }
        },
      }),
      columnHelper.accessor('passenger', {
        header: 'PASAJERO',
        cell: (info) => {
          const trip = info.row.original;
          const isThirdParty = Boolean(trip.thirdParty);
          const passengerName = trip.passenger
            ? `${trip.passenger.firstName} ${trip.passenger.lastName}`.trim()
            : 'Pasajero';

          return (
            <div className="flex items-center gap-1.5 max-w-[180px]">
              <span className="text-xs font-medium text-gray-900 dark:text-white truncate" title={passengerName}>
                {passengerName}
              </span>
              {isThirdParty && (
                <span
                  title={`Viaje solicitado para: ${trip.thirdParty?.name || 'Tercero'}`}
                  className="inline-flex items-center text-champagne-gold shrink-0 cursor-help"
                >
                  <Users className="w-3.5 h-3.5" />
                  <span className="text-[10px] font-bold leading-none ml-0.5">*</span>
                </span>
              )}
            </div>
          );
        },
      }),
      columnHelper.accessor('driver', {
        header: 'CONDUCTOR',
        cell: (info) => {
          const driver = info.getValue();
          if (!driver || !driver.firstName) {
            return <span className="text-xs text-gray-400 italic">Sin asignar</span>;
          }
          const driverName = `${driver.firstName} ${driver.lastName}`.trim();
          return (
            <span className="text-xs font-medium text-gray-800 dark:text-gray-200 truncate max-w-[160px]" title={driverName}>
              {driverName}
            </span>
          );
        },
      }),
      columnHelper.accessor('bookingType', {
        header: 'TIPO',
        cell: (info) => {
          const isScheduled = info.getValue() === 'scheduled';
          return (
            <span className="text-xs text-gray-600 dark:text-gray-300">
              {isScheduled ? 'Programado' : 'Inmediato'}
            </span>
          );
        },
      }),
      columnHelper.display({
        id: 'route',
        header: 'ORIGEN → DESTINO',
        cell: ({ row }) => {
          const origin = row.original.originAddress;
          const destination = row.original.destinationAddress;

          if (!origin && !destination) {
            return <span className="text-xs text-gray-400">—</span>;
          }

          const routeSummary = `${origin || 'Origen'} → ${destination || 'Destino'}`;

          return (
            <div
              className="flex items-center gap-1 max-w-[220px] text-xs text-gray-600 dark:text-gray-300 truncate"
              title={routeSummary}
            >
              <span className="truncate">{origin || 'Origen'}</span>
              <ArrowRight className="w-3 h-3 text-gray-400 shrink-0" />
              <span className="truncate">{destination || 'Destino'}</span>
            </div>
          );
        },
      }),
      columnHelper.display({
        id: 'fare',
        header: 'TARIFA',
        cell: ({ row }) => {
          const trip = row.original;
          const fare = trip.finalFare || trip.estimatedFare;
          const formatted = formatCurrency(fare, trip.currency);

          return (
            <span className="text-xs font-semibold text-gray-900 dark:text-white font-mono whitespace-nowrap">
              {formatted}
            </span>
          );
        },
      }),
      columnHelper.accessor('status', {
        header: 'ESTADO',
        cell: (info) => <TripsBadge status={info.getValue()} />,
      }),
    ],
    [onSelectTrip]
  );

  const table = useReactTable({
    data: data?.data ?? [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    pageCount: data?.totalPages ?? -1,
  });

  if (isError) {
    return (
      <div className="bg-red-50 dark:bg-red-950/20 p-6 rounded-xl border border-red-200 dark:border-red-900/40 text-center">
        <p className="text-red-600 dark:text-red-400 font-medium">Ocurrió un error al cargar los viajes.</p>
        <p className="text-xs text-red-500 mt-1">Por favor, verificá la conexión o intentá nuevamente más tarde.</p>
      </div>
    );
  }

  const total = data?.total ?? 0;
  const totalPages = data?.totalPages ?? 1;
  const startItem = total === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, total);

  // Generate page numbers for pagination
  const pageNumbers = useMemo(() => {
    const pages: (number | string)[] = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push('...');
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      for (let i = start; i <= end; i++) {
        if (!pages.includes(i)) pages.push(i);
      }
      if (currentPage < totalPages - 2) pages.push('...');
      if (!pages.includes(totalPages)) pages.push(totalPages);
    }
    return pages;
  }, [totalPages, currentPage]);

  return (
    <div className="bg-white dark:bg-dark-surface rounded-xl shadow-sm border border-gray-200/80 dark:border-dark-border flex flex-col w-full overflow-hidden transition-colors">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr
                key={headerGroup.id}
                className="border-b border-gray-100 dark:border-dark-border bg-gray-50/60 dark:bg-dark-card"
              >
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-5 py-3 text-[10.5px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap"
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>

          <tbody className="divide-y divide-gray-100 dark:divide-dark-border">
            {isLoading ? (
              // Skeleton loading rows
              Array.from({ length: 8 }).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td className="py-3 px-5"><div className="h-4 bg-gray-200 dark:bg-white/10 rounded w-16" /></td>
                  <td className="py-3 px-5"><div className="h-4 bg-gray-200 dark:bg-white/10 rounded w-20" /></td>
                  <td className="py-3 px-5"><div className="h-4 bg-gray-200 dark:bg-white/10 rounded w-28" /></td>
                  <td className="py-3 px-5"><div className="h-4 bg-gray-200 dark:bg-white/10 rounded w-28" /></td>
                  <td className="py-3 px-5"><div className="h-4 bg-gray-200 dark:bg-white/10 rounded w-16" /></td>
                  <td className="py-3 px-5"><div className="h-4 bg-gray-200 dark:bg-white/10 rounded w-36" /></td>
                  <td className="py-3 px-5"><div className="h-4 bg-gray-200 dark:bg-white/10 rounded w-20" /></td>
                  <td className="py-3 px-5"><div className="h-6 bg-gray-200 dark:bg-white/10 rounded-full w-24" /></td>
                </tr>
              ))
            ) : table.getRowModel().rows.length === 0 ? (
              // Empty state
              <tr>
                <td colSpan={columns.length} className="py-14 text-center">
                  <div className="flex flex-col items-center justify-center text-gray-500 dark:text-gray-400">
                    <Inbox className="w-12 h-12 mb-3 text-gray-300 dark:text-gray-600" />
                    <p className="text-base font-semibold text-gray-900 dark:text-white">
                      No se encontraron viajes
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Ajustá los filtros o probá con otro rango de fechas o búsqueda.
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              // Data Rows
              table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  onClick={() => onSelectTrip(row.original.id)}
                  className="hover:bg-gray-50/70 dark:hover:bg-white/5 transition-colors cursor-pointer text-gray-800 dark:text-gray-200 h-[46px]"
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-5 whitespace-nowrap">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Table Footer matching Screenshot 1 */}
      <div className="px-5 py-3 border-t border-gray-100 dark:border-dark-border flex flex-col sm:flex-row items-center justify-between gap-3 text-xs bg-white dark:bg-dark-surface transition-colors">
        {/* Left Side: Summary + Page Size + Legend */}
        <div className="flex items-center gap-4 flex-wrap text-gray-500 dark:text-gray-400">
          <div>
            Mostrando {startItem}–{endItem} de{' '}
            <span className="font-semibold text-gray-900 dark:text-white">
              <AnimatedNumber value={total} />
            </span>{' '}
            viajes
          </div>

          <div className="flex items-center gap-1.5">
            <span>Filas por página</span>
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              className="border border-gray-200 dark:border-dark-border rounded px-2 py-1 bg-gray-50 dark:bg-dark-card text-gray-800 dark:text-gray-200 text-xs focus:outline-none"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>

          <div className="hidden md:flex items-center gap-1 text-[11px] text-gray-400">
            <Users className="w-3 h-3 text-champagne-gold" />
            <span>* indica viaje pedido para un tercero</span>
          </div>
        </div>

        {/* Right Side: Page buttons */}
        <div className="flex items-center space-x-1">
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage <= 1 || isLoading}
            className="px-2.5 py-1 text-xs border border-gray-200 dark:border-dark-border rounded text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Anterior
          </button>

          {pageNumbers.map((page, index) =>
            typeof page === 'number' ? (
              <button
                key={index}
                onClick={() => onPageChange(page)}
                disabled={isLoading}
                className={`w-7 h-7 flex items-center justify-center rounded text-xs font-medium transition-colors ${
                  currentPage === page
                    ? 'bg-obsidian text-white dark:bg-white dark:text-obsidian font-bold'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5'
                }`}
              >
                {page}
              </button>
            ) : (
              <span key={index} className="px-1 text-gray-400">
                {page}
              </span>
            )
          )}

          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage >= totalPages || isLoading}
            className="px-2.5 py-1 text-xs border border-gray-200 dark:border-dark-border rounded text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Siguiente
          </button>
        </div>
      </div>
    </div>
  );
};
