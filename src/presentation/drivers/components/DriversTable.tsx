import React from 'react';
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import type { DriverListItem, PaginatedDriversResponse } from '../../../core/drivers/interfaces/driver.interface';
import { DriverBadge } from './DriverBadge';
import { ChevronLeft, ChevronRight, Inbox } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface DriversTableProps {
  data: PaginatedDriversResponse | undefined;
  isLoading: boolean;
  isError: boolean;
  onPageChange: (page: number) => void;
  currentPage: number;
}

const columnHelper = createColumnHelper<DriverListItem>();

export const DriversTable: React.FC<DriversTableProps> = ({
  data,
  isLoading,
  isError,
  onPageChange,
  currentPage,
}) => {
  const navigate = useNavigate();

  const columns = React.useMemo(() => [
    columnHelper.accessor('fullName', {
      header: 'NOMBRE',
      cell: (info) => (
        <span className="text-[12.5px] font-medium text-gray-900 dark:text-white">{info.getValue()}</span>
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
    columnHelper.accessor('createdAt', {
      header: 'POSTULACIÓN',
      cell: (info) => (
        <span className="text-[12.5px] font-medium text-gray-600 dark:text-gray-300">
          {format(new Date(info.getValue()), 'dd/MM/yyyy', { locale: es })}
        </span>
      ),
    }),
    columnHelper.accessor('meetingStatus', {
      header: 'REUNIÓN',
      cell: (info) => (
        <span className="text-[12.5px] font-medium text-gray-600 dark:text-gray-300">{info.getValue() || 'Sin agendar'}</span>
      ),
    }),
    columnHelper.accessor('approvalStatus', {
      header: 'ESTADO DEL LEGAJO',
      cell: (info) => <DriverBadge status={info.getValue()} />,
    }),
    columnHelper.display({
      id: 'actions',
      header: '',
      cell: ({ row }) => (
        <button
          onClick={() => navigate(`/conductores/${row.original.id}`)}
          className="text-[12.5px] font-semibold text-champagne-gold hover:text-yellow-600 transition-colors"
          aria-label={`Revisar conductor ${row.original.fullName}`}
        >
          Revisar
        </button>
      ),
    }),
  ], [navigate]);

  const table = useReactTable({
    data: data?.data ?? [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    pageCount: data?.pagination.totalPages ?? -1,
  });

  if (isError) {
    return (
      <div className="bg-red-50 p-6 rounded-lg border border-red-200 text-center">
        <p className="text-red-600 font-medium">Ocurrió un error al cargar los conductores.</p>
        <p className="text-sm text-red-500 mt-1">Por favor, intente nuevamente más tarde.</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-dark-surface rounded-lg shadow-sm border border-gray-100 dark:border-dark-border flex flex-col w-full overflow-hidden transition-colors">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id} className="border-b border-gray-100 dark:border-dark-border bg-gray-50/50 dark:bg-dark-card">
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
              // Loading Skeleton
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td className="py-4 px-6"><div className="h-4 bg-gray-200 dark:bg-white/10 rounded w-32"></div></td>
                  <td className="py-4 px-6"><div className="h-4 bg-gray-200 dark:bg-white/10 rounded w-32"></div></td>
                  <td className="py-4 px-6"><div className="h-4 bg-gray-200 dark:bg-white/10 rounded w-24"></div></td>
                  <td className="py-4 px-6"><div className="h-4 bg-gray-200 dark:bg-white/10 rounded w-24"></div></td>
                  <td className="py-4 px-6"><div className="h-4 bg-gray-200 dark:bg-white/10 rounded w-24"></div></td>
                  <td className="py-4 px-6"><div className="h-6 bg-gray-200 dark:bg-white/10 rounded-full w-28"></div></td>
                  <td className="py-4 px-6"><div className="h-4 bg-gray-200 dark:bg-white/10 rounded w-16"></div></td>
                </tr>
              ))
            ) : table.getRowModel().rows.length === 0 ? (
              // Empty State
              <tr>
                <td colSpan={columns.length} className="py-12 text-center">
                  <div className="flex flex-col items-center justify-center text-gray-500 dark:text-gray-400">
                    <Inbox className="w-12 h-12 mb-3 text-gray-300 dark:text-gray-600" />
                    <p className="text-lg font-medium text-gray-900 dark:text-white">No se encontraron resultados</p>
                    <p className="text-sm">Ajustá los filtros o probá con otra búsqueda.</p>
                  </div>
                </td>
              </tr>
            ) : (
              // Data Rows
              table.getRowModel().rows.map((row) => (
                <tr key={row.id} className="hover:bg-gray-50/50 dark:hover:bg-white/5 transition-colors h-[36px] text-gray-800 dark:text-gray-200">
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

      {/* Pagination Controls */}
      {data?.pagination && data.pagination.totalPages > 0 && (
        <div className="px-6 py-4 border-t border-gray-100 dark:border-dark-border flex items-center justify-between bg-white dark:bg-dark-surface transition-colors">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Mostrando página <span className="font-medium text-gray-900 dark:text-white">{currentPage}</span> de <span className="font-medium text-gray-900 dark:text-white">{data.pagination.totalPages}</span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage <= 1 || isLoading}
              className="p-2 border border-gray-200 dark:border-dark-border rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              aria-label="Página anterior"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
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
