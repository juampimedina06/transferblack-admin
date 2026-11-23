import React, { useState, useMemo, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { TripsToolbar, type TripsFilterState } from './components/TripsToolbar';
import { TripsTable } from './components/TripsTable';
import { TripDetailDrawer } from './components/TripDetailDrawer';
import { useTrips } from './hooks/useTrips';
import type { GetTripsFilters, TripStatus } from '../../core/trips/interfaces/trip.interface';
import { endOfDayISO, startOfDayISO } from '../utils/dates';
import { Download } from 'lucide-react';
import { exportTripsCsv, MAX_EXPORT_ROWS } from './exportTripsCsv';

export const TripsScreen: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Selected trip for drawer
  const [selectedTripId, setSelectedTripId] = useState<string | null>(
    searchParams.get('tripId') || null
  );

  // Extract initial filters from URL params
  const initialFilters: TripsFilterState = useMemo(() => {
    const rawStatus = searchParams.get('status');
    const parsedStatus: TripStatus[] = rawStatus
      ? (rawStatus.split(',') as TripStatus[])
      : [];

    return {
      startDate: searchParams.get('dateFrom') || '',
      endDate: searchParams.get('dateTo') || '',
      status: parsedStatus,
      driverId: searchParams.get('driverId') || '',
      driverLabel: searchParams.get('driverName') || '',
      passengerId: searchParams.get('passengerId') || '',
      passengerLabel: searchParams.get('passengerName') || '',
      search: searchParams.get('search') || '',
      quickFilter: (searchParams.get('quickFilter') as any) || 'none',
    };
  }, [searchParams]);

  const [filterState, setFilterState] = useState<TripsFilterState>(initialFilters);

  const currentPage = Number(searchParams.get('page')) || 1;
  const pageSize = Number(searchParams.get('limit')) || 20;

  // Build query filters for TanStack Query
  const queryFilters: GetTripsFilters = useMemo(() => {
    const q: GetTripsFilters = {
      page: currentPage,
      limit: pageSize,
      search: filterState.search || undefined,
      driverId: filterState.driverId || undefined,
      passengerId: filterState.passengerId || undefined,
      status: filterState.status.length > 0 ? filterState.status : undefined,
    };

    if (filterState.startDate) {
      q.dateFrom = startOfDayISO(filterState.startDate);
    }
    if (filterState.endDate) {
      q.dateTo = endOfDayISO(filterState.endDate);
    }

    // Apply quick filters
    if (filterState.quickFilter === 'scheduled') {
      q.bookingType = 'scheduled';
    } else if (filterState.quickFilter === 'third_party') {
      q.isThirdParty = true;
    } else if (filterState.quickFilter === 'driver_cancelled') {
      q.status = ['cancelled'];
    } else if (filterState.quickFilter === 'corporate') {
      q.isCorporate = true;
    }

    return q;
  }, [filterState, currentPage, pageSize]);

  // Fetch data
  const { data, isLoading, isError } = useTrips(queryFilters);

  // Update URL search parameters
  const updateUrlParams = useCallback(
    (newFilters: TripsFilterState, newPage = 1, newLimit = pageSize, tripId = selectedTripId) => {
      const params = new URLSearchParams();

      if (newPage > 1) params.set('page', newPage.toString());
      if (newLimit !== 20) params.set('limit', newLimit.toString());
      if (newFilters.search) params.set('search', newFilters.search);
      if (newFilters.startDate) params.set('dateFrom', newFilters.startDate);
      if (newFilters.endDate) params.set('dateTo', newFilters.endDate);
      if (newFilters.driverId) params.set('driverId', newFilters.driverId);
      if (newFilters.driverId && newFilters.driverLabel) params.set('driverName', newFilters.driverLabel);
      if (newFilters.passengerId) params.set('passengerId', newFilters.passengerId);
      if (newFilters.passengerId && newFilters.passengerLabel) params.set('passengerName', newFilters.passengerLabel);
      if (newFilters.status.length > 0) params.set('status', newFilters.status.join(','));
      if (newFilters.quickFilter !== 'none') params.set('quickFilter', newFilters.quickFilter);
      if (tripId) params.set('tripId', tripId);

      setSearchParams(params);
    },
    [pageSize, selectedTripId, setSearchParams]
  );

  const handleApplyFilters = (newFilters: TripsFilterState) => {
    setFilterState(newFilters);
    updateUrlParams(newFilters, 1);
  };

  const handleResetFilters = () => {
    const emptyFilters: TripsFilterState = {
      startDate: '',
      endDate: '',
      status: [],
      driverId: '',
      driverLabel: '',
      passengerId: '',
      passengerLabel: '',
      search: '',
      quickFilter: 'none',
    };
    setFilterState(emptyFilters);
    updateUrlParams(emptyFilters, 1);
  };

  const handlePageChange = (newPage: number) => {
    updateUrlParams(filterState, newPage);
  };

  const handlePageSizeChange = (newPageSize: number) => {
    updateUrlParams(filterState, 1, newPageSize);
  };

  const handleSelectTrip = (id: string) => {
    setSelectedTripId(id);
    updateUrlParams(filterState, currentPage, pageSize, id);
  };

  const handleCloseDrawer = () => {
    setSelectedTripId(null);
    updateUrlParams(filterState, currentPage, pageSize, null);
  };

  const [isExporting, setIsExporting] = useState(false);
  const [exportNotice, setExportNotice] = useState<string | null>(null);

  // Exporta lo filtrado (todas las paginas), no solo la pagina que se ve.
  const handleExport = async () => {
    setIsExporting(true);
    setExportNotice(null);
    try {
      const { truncated } = await exportTripsCsv({ ...queryFilters, page: 1 });
      if (truncated) {
        setExportNotice(`Se exportaron los primeros ${MAX_EXPORT_ROWS} viajes. Acotá las fechas para bajar el resto.`);
      }
    } catch {
      setExportNotice('No pudimos exportar los viajes. Probá de nuevo.');
    } finally {
      setIsExporting(false);
    }
  };

  if (selectedTripId) {
    return (
      <TripDetailDrawer tripId={selectedTripId} onClose={handleCloseDrawer} />
    );
  }

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Page Title */}
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">Historial de viajes</h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Todos los viajes pedidos, con su estado, conductor y tarifa.
          </p>
        </div>
        <button
          type="button"
          onClick={handleExport}
          disabled={isExporting || !data?.total}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border border-gray-300 dark:border-dark-border bg-white dark:bg-dark-surface text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-white/5 disabled:opacity-50 transition-colors"
        >
          <Download className="w-4 h-4" />
          {isExporting ? 'Exportando…' : 'Exportar CSV'}
        </button>
      </div>
      {exportNotice && <p className="text-xs text-amber-600 dark:text-amber-400">{exportNotice}</p>}

      {/* Toolbar */}
      <TripsToolbar
        filters={filterState}
        onApplyFilters={handleApplyFilters}
        onResetFilters={handleResetFilters}
      />

      {/* Advanced Data Table */}
      <TripsTable
        data={data}
        isLoading={isLoading}
        isError={isError}
        currentPage={currentPage}
        pageSize={pageSize}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
        onSelectTrip={handleSelectTrip}
      />
    </div>
  );
};

export default TripsScreen;
