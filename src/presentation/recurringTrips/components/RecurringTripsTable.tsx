import React, { useMemo } from 'react';
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
import {
  ArrowRight,
  Clock,
  Inbox,
  User,
  Car,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from 'lucide-react';
import { RecurringTripBadge } from './RecurringTripBadge';
import {
  DAYS_OF_WEEK_OPTIONS,
  type RecurringSchedule,
  type RecurringTripPagination,
} from '../../../core/recurringTrips/recurringTrip.interface';

interface RecurringTripsTableProps {
  schedules: RecurringSchedule[];
  pagination: RecurringTripPagination | undefined;
  isLoading: boolean;
  isFetching?: boolean;
  isPlaceholderData?: boolean;
  isError: boolean;
  onPageChange: (page: number) => void;
  onSelectSchedule: (schedule: RecurringSchedule) => void;
}

const columnHelper = createColumnHelper<RecurringSchedule>();

function formatMoney(amount?: string, currency = 'ARS') {
  if (!amount) return '—';
  const num = parseFloat(amount);
  if (Number.isNaN(num)) return '—';
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: currency || 'ARS',
  }).format(num);
}

export const RecurringTripsTable: React.FC<RecurringTripsTableProps> = ({
  schedules,
  pagination,
  isLoading,
  isFetching,
  isPlaceholderData,
  isError,
  onPageChange,
  onSelectSchedule,
}) => {
  const columns = useMemo(
    () => [
      columnHelper.display({
        id: 'passenger',
        header: 'CLIENTE',
        cell: ({ row }) => {
          const schedule = row.original;
          const p = schedule.passenger;
          const name = p
            ? `${p.first_name || ''} ${p.last_name || ''}`.trim() || p.email
            : schedule.passenger_user_id || schedule.passengerUserId || 'Cliente no asignado';
          const email = p?.email || '';

          return (
            <div className="flex items-center gap-2 max-w-[200px]">
              <div className="w-7 h-7 rounded-full bg-champagne-gold/10 text-champagne-gold flex items-center justify-center shrink-0">
                <User className="w-3.5 h-3.5" />
              </div>
              <div className="truncate">
                <p className="truncate text-xs font-semibold text-gray-900 dark:text-white" title={name}>
                  {name}
                </p>
                {email && <p className="truncate text-[11px] text-gray-500 dark:text-gray-400">{email}</p>}
              </div>
            </div>
          );
        },
      }),
      columnHelper.display({
        id: 'schedule_time',
        header: 'HORARIO Y DÍAS',
        cell: ({ row }) => {
          const days = row.original.days_of_week || row.original.daysOfWeek || [];
          const time = row.original.time_of_day || row.original.timeOfDay || '—';
          const timeFormatted = time.slice(0, 5);

          return (
            <div className="space-y-1">
              <div className="flex items-center gap-1 text-xs font-semibold text-gray-900 dark:text-white">
                <Clock className="w-3.5 h-3.5 text-gray-400" />
                <span>{timeFormatted} hs</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {DAYS_OF_WEEK_OPTIONS.map((day) => {
                  const isActive = days.includes(day.value);
                  return (
                    <span
                      key={day.value}
                      className={`text-[10px] px-1.5 py-0.2 rounded font-medium ${
                        isActive
                          ? 'bg-champagne-gold/20 text-champagne-gold border border-champagne-gold/30 font-bold'
                          : 'bg-gray-100 dark:bg-white/5 text-gray-400 opacity-60'
                      }`}
                      title={day.label}
                    >
                      {day.shortLabel}
                    </span>
                  );
                })}
              </div>
            </div>
          );
        },
      }),
      columnHelper.display({
        id: 'route',
        header: 'ORIGEN → DESTINO',
        cell: ({ row }) => {
          const orig = row.original.origin_address || row.original.originAddress || '—';
          const dest = row.original.destination_address || row.original.destinationAddress || '—';
          return (
            <div
              className="flex max-w-[220px] items-center gap-1.5 truncate text-xs text-gray-600 dark:text-gray-300"
              title={`${orig} → ${dest}`}
            >
              <span className="truncate">{orig}</span>
              <ArrowRight className="h-3 w-3 shrink-0 text-gray-400" />
              <span className="truncate">{dest}</span>
            </div>
          );
        },
      }),
      columnHelper.display({
        id: 'unit_fare',
        header: 'TARIFA UNITARIA',
        cell: ({ row }) => {
          const fare = row.original.unit_fare || row.original.unitFare;
          const currency = row.original.currency;
          return (
            <span className="whitespace-nowrap font-mono text-xs font-semibold text-gray-900 dark:text-white">
              {formatMoney(fare, currency)}
            </span>
          );
        },
      }),
      columnHelper.display({
        id: 'driver',
        header: 'CHOFER FIJO',
        cell: ({ row }) => {
          const driver = row.original.reserved_driver || row.original.reservedDriver;
          if (!driver) {
            return <span className="text-xs italic text-gray-400">Sin chofer asignado</span>;
          }
          const driverName = `${driver.first_name || ''} ${driver.last_name || ''}`.trim() || 'Chofer';
          return (
            <div className="flex items-center gap-1.5 truncate text-xs text-gray-800 dark:text-gray-200">
              <Car className="w-3.5 h-3.5 text-gray-400 shrink-0" />
              <span className="truncate font-medium">{driverName}</span>
            </div>
          );
        },
      }),
      columnHelper.accessor('status', {
        header: 'ESTADO',
        cell: (info) => <RecurringTripBadge status={info.getValue()} />,
      }),
    ],
    []
  );

  const table = useReactTable({
    data: schedules,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const showSkeleton = isLoading || isPlaceholderData;

  return (
    <div className="relative flex w-full flex-col overflow-hidden rounded-xl border border-gray-200/80 bg-white shadow-sm dark:border-dark-border dark:bg-dark-surface transition-colors">
      {/* Top accent loading bar for active fetching / pagination */}
      {isFetching && (
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-champagne-gold/20 overflow-hidden z-20">
          <div className="h-full bg-champagne-gold animate-pulse" />
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr
                key={headerGroup.id}
                className="border-b border-gray-100 bg-gray-50/60 dark:border-dark-border dark:bg-dark-card"
              >
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
            {showSkeleton ? (
              // High-fidelity skeleton rows matching exact column structure
              Array.from({ length: 6 }).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  {/* Cliente */}
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2 max-w-[200px]">
                      <div className="w-7 h-7 rounded-full bg-gray-200 dark:bg-white/10 shrink-0" />
                      <div className="space-y-1.5 flex-1">
                        <div className="h-3 w-28 bg-gray-200 dark:bg-white/10 rounded" />
                        <div className="h-2 w-36 bg-gray-100 dark:bg-white/5 rounded" />
                      </div>
                    </div>
                  </td>
                  {/* Horario y días */}
                  <td className="px-5 py-3.5">
                    <div className="space-y-1.5">
                      <div className="h-3 w-16 bg-gray-200 dark:bg-white/10 rounded" />
                      <div className="flex gap-1">
                        {Array.from({ length: 7 }).map((_, d) => (
                          <div key={d} className="h-3.5 w-4 rounded bg-gray-100 dark:bg-white/5" />
                        ))}
                      </div>
                    </div>
                  </td>
                  {/* Origen -> Destino */}
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-1.5 max-w-[220px]">
                      <div className="h-3 w-20 bg-gray-200 dark:bg-white/10 rounded" />
                      <div className="h-2 w-3 bg-gray-200 dark:bg-white/10 rounded" />
                      <div className="h-3 w-20 bg-gray-200 dark:bg-white/10 rounded" />
                    </div>
                  </td>
                  {/* Tarifa unitaria */}
                  <td className="px-5 py-3.5">
                    <div className="h-3.5 w-16 bg-gray-200 dark:bg-white/10 rounded" />
                  </td>
                  {/* Chofer fijo */}
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-1.5">
                      <div className="w-3.5 h-3.5 rounded bg-gray-200 dark:bg-white/10" />
                      <div className="h-3 w-24 bg-gray-200 dark:bg-white/10 rounded" />
                    </div>
                  </td>
                  {/* Estado */}
                  <td className="px-5 py-3.5">
                    <div className="h-5 w-16 rounded-full bg-gray-200 dark:bg-white/10" />
                  </td>
                </tr>
              ))
            ) : isError ? (
              <tr>
                <td colSpan={columns.length} className="px-5 py-8 text-center text-xs text-rose-500">
                  Ocurrió un error al cargar los traslados recurrentes.
                </td>
              </tr>
            ) : schedules.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-5 py-12 text-center">
                  <div className="flex flex-col items-center justify-center text-gray-400 dark:text-gray-500">
                    <Inbox className="w-10 h-10 mb-2 stroke-[1.5]" />
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      No hay abonos recurrentes registrados
                    </p>
                    <p className="text-xs mt-0.5">
                      Podés dar de alta uno nuevo haciendo click en "Nuevo Abono".
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  onClick={() => onSelectSchedule(row.original)}
                  className="hover:bg-gray-50 dark:hover:bg-white/[0.02] cursor-pointer transition-colors"
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-5 py-3.5 text-xs text-gray-700 dark:text-gray-300">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {pagination && pagination.total_pages > 1 && (
        <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100 bg-gray-50/60 dark:border-dark-border dark:bg-dark-card text-xs text-gray-500">
          <div className="flex items-center gap-2">
            <span>
              Página <span className="font-semibold text-gray-800 dark:text-gray-200">{pagination.page}</span> de{' '}
              <span className="font-semibold text-gray-800 dark:text-gray-200">{pagination.total_pages}</span> ({pagination.total} en total)
            </span>
            {isFetching && (
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-champagne-gold animate-fade-in">
                <Loader2 className="w-3 h-3 animate-spin" />
                Cargando...
              </span>
            )}
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => onPageChange(pagination.page - 1)}
              disabled={pagination.page <= 1 || isFetching}
              className="p-1 rounded hover:bg-gray-200 dark:hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              title="Anterior"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => onPageChange(pagination.page + 1)}
              disabled={pagination.page >= pagination.total_pages || isFetching}
              className="p-1 rounded hover:bg-gray-200 dark:hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              title="Siguiente"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
