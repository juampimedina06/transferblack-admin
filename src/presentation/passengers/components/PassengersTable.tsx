import React from 'react';
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Inbox, CheckCircle2, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type {
  PaginatedPassengersResponse,
  PassengerListItem,
} from '../../../core/passengers/interfaces/passenger.interface';
import { AnimatedNumber } from '../../components/common/AnimatedNumber';
import { PassengerStatusBadge } from './PassengerStatusBadge';

interface PassengersTableProps {
  data: PaginatedPassengersResponse | undefined;
  isLoading: boolean;
  isError: boolean;
  onPageChange: (page: number) => void;
  currentPage: number;
}

const columnHelper = createColumnHelper<PassengerListItem>();

export const PassengersTable: React.FC<PassengersTableProps> = ({
  data,
  isLoading,
  isError,
  onPageChange,
  currentPage,
}) => {
  const navigate = useNavigate();

  const columns = React.useMemo(
    () => [
      columnHelper.accessor('fullName', {
        header: 'NOMBRE',
        cell: (info) => (
          <span className="text-[12.5px] font-medium text-gray-900 dark:text-white">
            {info.getValue() || 'Sin nombre'}
          </span>
        ),
      }),
      columnHelper.accessor('email', {
        header: 'EMAIL',
        cell: (info) => (
          <span className="text-[12.5px] font-medium text-gray-600 dark:text-gray-300">
            {info.getValue() || '-'}
          </span>
        ),
      }),
      columnHelper.accessor('phone', {
        header: 'TELÉFONO',
        cell: (info) => (
          <span className="text-[12.5px] font-medium text-gray-600 dark:text-gray-300">
            {info.getValue() || '-'}
          </span>
        ),
      }),
      columnHelper.accessor('emailVerifiedAt', {
        header: 'EMAIL VERIFICADO',
        cell: (info) =>
          info.getValue() ? (
            <span className="inline-flex items-center gap-1 text-[12px] font-medium text-emerald-700 dark:text-emerald-400">
              <CheckCircle2 className="w-3.5 h-3.5" /> Verificado
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-[12px] text-gray-400 dark:text-gray-500">
              <Clock className="w-3.5 h-3.5" /> Pendiente
            </span>
          ),
      }),
      columnHelper.accessor('createdAt', {
        header: 'REGISTRO',
        cell: (info) => (
          <span className="text-[12.5px] font-medium text-gray-600 dark:text-gray-300">
            {format(new Date(info.getValue()), 'dd/MM/yyyy', { locale: es })}
          </span>
        ),
      }),
      columnHelper.accessor('status', {
        header: 'ESTADO',
        cell: (info) => <PassengerStatusBadge status={info.getValue()} />,
      }),
      columnHelper.display({
        id: 'actions',
        header: '',
        cell: ({ row }) => (
          <button
            type="button"
            onClick={() => navigate(`/pasajeros/${row.original.id}`)}
            className="text-[12.5px] font-semibold text-champagne-gold hover:text-yellow-600 transition-colors cursor-pointer"
            aria-label={`Ver detalle de ${row.original.fullName || row.original.email}`}
          >
            Ver detalle
          </button>
        ),
      }),
    ],
    [navigate],
  );

  const table = useReactTable({
    data: data?.data ?? [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    pageCount: data?.pagination.totalPages ?? -1,
  });

  if (isError) {
    return (
      <div className="bg-red-50 dark:bg-red-950/20 p-6 rounded-lg border border-red-200 dark:border-red-900/40 text-center">
        <p className="text-red-600 dark:text-red-400 font-medium">
          Ocurrió un error al cargar los pasajeros.
        </p>
        <p className="text-sm text-red-500 dark:text-red-400/80 mt-1">
          Verificá que el backend tenga habilitado el endpoint <code>/admin/passengers</code> o intentá nuevamente más tarde.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-dark-surface rounded-lg shadow-sm border border-gray-100 dark:border-dark-border flex flex-col w-full overflow-hidden transition-colors">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr
                key={headerGroup.id}
                className="border-b border-gray-100 dark:border-dark-border bg-gray-50/50 dark:bg-dark-card"
              >
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-6 h-[36px] text-[10.5px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap"
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
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td className="py-4 px-6"><div className="h-4 bg-gray-200 dark:bg-white/10 rounded w-32" /></td>
                  <td className="py-4 px-6"><div className="h-4 bg-gray-200 dark:bg-white/10 rounded w-40" /></td>
                  <td className="py-4 px-6"><div className="h-4 bg-gray-200 dark:bg-white/10 rounded w-24" /></td>
                  <td className="py-4 px-6"><div className="h-4 bg-gray-200 dark:bg-white/10 rounded w-20" /></td>
                  <td className="py-4 px-6"><div className="h-4 bg-gray-200 dark:bg-white/10 rounded w-20" /></td>
                  <td className="py-4 px-6"><div className="h-6 bg-gray-200 dark:bg-white/10 rounded-full w-20" /></td>
                  <td className="py-4 px-6"><div className="h-4 bg-gray-200 dark:bg-white/10 rounded w-16" /></td>
                </tr>
              ))
            ) : table.getRowModel().rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="py-12 text-center">
                  <div className="flex flex-col items-center justify-center text-gray-500 dark:text-gray-400">
                    <Inbox className="w-12 h-12 mb-3 text-gray-300 dark:text-gray-600" />
                    <p className="text-lg font-medium text-gray-900 dark:text-white">
                      No se encontraron pasajeros
                    </p>
                    <p className="text-sm">Ajustá los filtros o probá con otra búsqueda.</p>
                  </div>
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  className="hover:bg-gray-50/50 dark:hover:bg-white/5 transition-colors h-[42px] text-gray-800 dark:text-gray-200"
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-6 whitespace-nowrap">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {data?.pagination && data.pagination.totalPages > 0 && (
        <div className="px-6 py-4 border-t border-gray-100 dark:border-dark-border flex items-center justify-between bg-white dark:bg-dark-surface transition-colors">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Mostrando página{' '}
            <span className="font-medium text-gray-900 dark:text-white">{currentPage}</span> de{' '}
            <span className="font-medium text-gray-900 dark:text-white">
              {data.pagination.totalPages}
            </span>
            <span className="mx-2 text-gray-300 dark:text-gray-600">•</span>
            <span className="font-medium text-gray-900 dark:text-white">
              <AnimatedNumber value={data.pagination.totalCount} />
            </span>{' '}
            {data.pagination.totalCount === 1 ? 'pasajero' : 'pasajeros'}
          </div>
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage <= 1 || isLoading}
              className="p-2 border border-gray-200 dark:border-dark-border rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              aria-label="Página anterior"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage >= data.pagination.totalPages || isLoading}
              className="p-2 border border-gray-200 dark:border-dark-border rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              aria-label="Página siguiente"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
