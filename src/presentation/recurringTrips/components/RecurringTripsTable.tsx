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

  return (
    <div className="bg-white dark:bg-dark-surface rounded-xl border border-gray-100 dark:border-dark-border shadow-sm overflow-hidden flex flex-col">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr
                key={headerGroup.id}
                className="border-b border-gray-100 dark:border-dark-border bg-gray-50/50 dark:bg-white/[0.02]"
              >
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-4 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap"
                  >
                    {flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-dark-border">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td colSpan={columns.length} className="px-4 py-4">
                    <div className="h-4 bg-gray-200 dark:bg-white/5 rounded w-full" />
                  </td>
                </tr>
              ))
            ) : isError ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-8 text-center text-xs text-rose-500">
                  Ocurrió un error al cargar los traslados recurrentes.
                </td>
              </tr>
            ) : schedules.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-12 text-center">
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
                    <td key={cell.id} className="px-4 py-3.5 text-xs">
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
        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 dark:border-dark-border bg-gray-50/50 dark:bg-white/[0.02] text-xs text-gray-500">
          <div>
            Página <span className="font-semibold text-gray-800 dark:text-gray-200">{pagination.page}</span> de{' '}
            <span className="font-semibold text-gray-800 dark:text-gray-200">{pagination.total_pages}</span> ({pagination.total} en total)
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => onPageChange(pagination.page - 1)}
              disabled={pagination.page <= 1}
              className="p-1 rounded hover:bg-gray-200 dark:hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              title="Anterior"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => onPageChange(pagination.page + 1)}
              disabled={pagination.page >= pagination.total_pages}
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
