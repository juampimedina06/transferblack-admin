import React, { useState, useMemo, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { TripsToolbar, type TripsFilterState } from './components/TripsToolbar';
import { TripsTable } from './components/TripsTable';
import { TripDetailDrawer } from './components/TripDetailDrawer';
import { useTrips } from './hooks/useTrips';
import type { GetTripsFilters, TripStatus } from '../../core/trips/interfaces/trip.interface';

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
      passengerId: searchParams.get('passengerId') || '',
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
      q.dateFrom = new Date(filterState.startDate + 'T00:00:00.000Z').toISOString();
    }
    if (filterState.endDate) {
      q.dateTo = new Date(filterState.endDate + 'T23:59:59.999Z').toISOString();
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
      if (newFilters.passengerId) params.set('passengerId', newFilters.passengerId);
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
      passengerId: '',
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

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Page Title */}
      <div>
        <h1 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">
          Historial de Viajes
        </h1>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
          Auditoría en tiempo real, trazabilidad de estados y tarifas de la flota.
        </p>
      </div>

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

      {/* Drawer Detalle de Viaje */}
      <TripDetailDrawer tripId={selectedTripId} onClose={handleCloseDrawer} />
    </div>
  );
};

export default TripsScreen;
