import { useMemo, useState } from 'react';
import { useScheduledTrips } from './hooks/useScheduledTrips';
import { useScheduledTripAlerts } from './hooks/useScheduledTripAlerts';
import { ScheduledTripsToolbar, type ScheduledTripsFilterState } from './components/ScheduledTripsToolbar';
import { ScheduledTripsTable } from './components/ScheduledTripsTable';
import { ScheduledTripsAlertsPanel } from './components/ScheduledTripsAlertsPanel';
import { CreateScheduledTripModal } from './components/CreateScheduledTripModal';
import { ScheduledTripDetailDrawer } from './components/ScheduledTripDetailDrawer';
import type { GetScheduledTripsFilters, ScheduledTrip } from '../../core/scheduledTrips/scheduledTrip.api';

const EMPTY_FILTERS: ScheduledTripsFilterState = { status: '', from: '', to: '' };

export const ScheduledTripsScreen: React.FC = () => {
  const [filters, setFilters] = useState<ScheduledTripsFilterState>(EMPTY_FILTERS);
  const [page, setPage] = useState(1);
  const [selectedTripId, setSelectedTripId] = useState<string | null>(null);
  // El backend no expone un `GET` de detalle (ver scheduledTrip.api.ts): el
  // detalle sale del listado ya cargado. Si una mutacion invalida la lista y
  // el viaje sale de la pagina actual (cambio de filtro, pagina, etc.), esta
  // ultima version conocida evita que el drawer se quede con datos viejos.
  const [selectedTripSnapshot, setSelectedTripSnapshot] = useState<ScheduledTrip | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const queryFilters: GetScheduledTripsFilters = useMemo(
    () => ({
      page,
      limit: 20,
      status: filters.status || undefined,
      from: filters.from ? `${filters.from}T00:00:00-03:00` : undefined,
      to: filters.to ? `${filters.to}T23:59:59-03:00` : undefined,
    }),
    [filters, page],
  );

  const { data, isLoading, isError } = useScheduledTrips(queryFilters);
  const { data: alerts = [] } = useScheduledTripAlerts();

  const attentionTripIds = useMemo(
    () => new Set(alerts.map((alert) => alert.trip_id).filter((id): id is string => Boolean(id))),
    [alerts],
  );

  const selectedTrip = selectedTripId
    ? data?.data.find((candidate) => candidate.id === selectedTripId) ?? selectedTripSnapshot
    : null;

  const selectTrip = (trip: ScheduledTrip) => {
    setSelectedTripId(trip.id);
    setSelectedTripSnapshot(trip);
  };

  const selectTripById = (tripId: string) => {
    const trip = data?.data.find((candidate) => candidate.id === tripId);
    if (trip) selectTrip(trip);
  };

  const closeDetail = () => {
    setSelectedTripId(null);
    setSelectedTripSnapshot(null);
  };

  if (selectedTrip) {
    return (
      <ScheduledTripDetailDrawer
        trip={selectedTrip}
        onClose={closeDetail}
        onUpdated={setSelectedTripSnapshot}
        onCancelled={closeDetail}
      />
    );
  }

  return (
    <div className="animate-fade-in space-y-5">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">Viajes reservados</h1>
        <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
          Reservas que la agencia arma y cobra por adelantado para activarse cerca de la hora de retiro.
        </p>
      </div>

      <ScheduledTripsAlertsPanel onSelectTrip={selectTripById} />

      <ScheduledTripsToolbar
        filters={filters}
        onChange={(next) => {
          setFilters(next);
          setPage(1);
        }}
        onReset={() => {
          setFilters(EMPTY_FILTERS);
          setPage(1);
        }}
        onCreate={() => setIsCreateOpen(true)}
      />

      <ScheduledTripsTable
        trips={data?.data ?? []}
        pagination={data?.pagination}
        isLoading={isLoading}
        isError={isError}
        attentionTripIds={attentionTripIds}
        onPageChange={setPage}
        onSelectTrip={selectTrip}
      />

      {isCreateOpen && (
        <CreateScheduledTripModal
          onClose={() => setIsCreateOpen(false)}
          onCreated={() => {
            setIsCreateOpen(false);
            setPage(1);
          }}
        />
      )}
    </div>
  );
};

export default ScheduledTripsScreen;
