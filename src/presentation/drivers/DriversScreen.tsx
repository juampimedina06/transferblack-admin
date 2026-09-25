import React, { useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useDrivers } from './hooks/useDrivers';
import { DriversTable } from './components/DriversTable';
import { Search } from 'lucide-react';
import type { GetDriversFilters } from '../../core/drivers/interfaces/driver.interface';

const STATUS_OPTIONS = [
  { value: 'all', label: 'Todos' },
  { value: 'pending', label: 'Pendientes' },
  { value: 'approved', label: 'Aprobados' },
  { value: 'rejected', label: 'Rechazados' },
  { value: 'suspended', label: 'Suspendidos' },
];

export const DriversScreen: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // URL state sync
  const currentPage = parseInt(searchParams.get('page') || '1', 10);
  const statusParam = searchParams.get('status') || 'all';
  const searchTerm = searchParams.get('search') || '';
  const orderParam = (searchParams.get('order') as 'asc' | 'desc') || 'desc';

  const filters: GetDriversFilters = {
    page: currentPage,
    limit: 10,
    ...(statusParam !== 'all' && { status: statusParam }),
    ...(searchTerm && { search: searchTerm }),
    order: orderParam,
  };

  const { data, isLoading, isError } = useDrivers(filters);

  const handlePageChange = useCallback((newPage: number) => {
    setSearchParams(prev => {
      prev.set('page', newPage.toString());
      return prev;
    });
  }, [setSearchParams]);

  const handleStatusChange = useCallback((newStatus: string) => {
    setSearchParams(prev => {
      if (newStatus === 'all') {
        prev.delete('status');
      } else {
        prev.set('status', newStatus);
      }
      prev.set('page', '1'); // Reset to page 1 on filter change
      return prev;
    });
  }, [setSearchParams]);

  const handleSearch = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchParams(prev => {
      if (!value) {
        prev.delete('search');
      } else {
        prev.set('search', value);
      }
      prev.set('page', '1'); // Reset to page 1 on search
      return prev;
    });
  }, [setSearchParams]);

  const toggleOrder = useCallback(() => {
    setSearchParams(prev => {
      prev.set('order', orderParam === 'desc' ? 'asc' : 'desc');
      prev.set('page', '1'); // Reset to page 1 when changing order
      return prev;
    });
  }, [setSearchParams, orderParam]);

  return (
    <div className="flex flex-col gap-6 w-full px-4 py-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-[18px] font-semibold text-gray-900 dark:text-white tracking-tight">Conductores</h1>
        
        <div className="flex w-full sm:w-auto items-center relative gap-3">
          <div className="relative w-full sm:w-auto">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              placeholder="Buscar por nombre o email..."
              value={searchTerm}
              onChange={handleSearch}
              className="w-full sm:w-72 pl-9 pr-4 py-2 bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border rounded-lg text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-champagne-gold/50 focus:border-champagne-gold transition-all shadow-sm"
            />
          </div>
          
          <button
            onClick={toggleOrder}
            className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors shadow-sm whitespace-nowrap"
            title="Alternar orden"
          >
            {orderParam === 'desc' ? 'Más recientes' : 'Más antiguos'}
          </button>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 hide-scrollbar">
        {STATUS_OPTIONS.map((option) => (
          <button
            key={option.value}
            onClick={() => handleStatusChange(option.value)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
              statusParam === option.value
                ? 'bg-obsidian dark:bg-champagne-gold text-white dark:text-obsidian font-semibold shadow-sm'
                : 'bg-white dark:bg-dark-surface text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-dark-border hover:bg-gray-50 dark:hover:bg-white/5'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>

      <DriversTable
        data={data}
        isLoading={isLoading}
        isError={isError}
        onPageChange={handlePageChange}
        currentPage={currentPage}
      />
    </div>
  );
};

export default DriversScreen;
