import React, { useState } from 'react';
import { LiveMapKpiBar } from './components/LiveMapKpiBar';
import { LiveMapCanvas } from './components/LiveMapCanvas';
import { ActiveTripsPanel } from './components/ActiveTripsPanel';
import { ManualAssignModal } from './components/ManualAssignModal';
import { useLiveMap } from './hooks/useLiveMap';
import { useManualAssign } from './hooks/useManualAssign';
import { useExpandRadius } from './hooks/useExpandRadius';
import type { TripListItem } from '../../core/trips/interfaces/trip.interface';
import { TripDetailDrawer } from '../trips/components/TripDetailDrawer';

export const LiveMapScreen: React.FC = () => {
  const {
    features,
    allFeatures,
    activeTrips,
    metrics,
    lastUpdated,
    filterStatus,
    setFilterStatus,
    filterCategory,
    setFilterCategory,
    refetchAll,
  } = useLiveMap();

  const [selectedTripForModal, setSelectedTripForModal] = useState<TripListItem | null>(null);
  const [selectedTripDetailId, setSelectedTripDetailId] = useState<string | null>(null);
  const [expandingTripId, setExpandingTripId] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const showNotification = (text: string, type: 'success' | 'error' = 'success') => {
    setNotification({ text, type });
    setTimeout(() => {
      setNotification(null);
    }, 4500);
  };

  const manualAssignMutation = useManualAssign({
    onSuccess: (data) => {
      showNotification(data.message || 'Conductor asignado exitosamente al viaje.');
      setSelectedTripForModal(null);
    },
    onError: (errorMsg) => {
      showNotification(errorMsg, 'error');
    },
  });

  const expandRadiusMutation = useExpandRadius({
    onSuccess: (data) => {
      showNotification(data.message || 'Radio de búsqueda ampliado con éxito.');
      setExpandingTripId(null);
    },
    onError: (errorMsg) => {
      showNotification(errorMsg, 'error');
      setExpandingTripId(null);
    },
  });

  const handleOpenManualAssign = (trip: TripListItem) => {
    setSelectedTripForModal(trip);
  };

  const handleConfirmAssign = async (tripId: string, driverId: string) => {
    await manualAssignMutation.mutateAsync({ tripId, driverId });
  };

  const handleExpandRadius = (tripId: string) => {
    setExpandingTripId(tripId);
    expandRadiusMutation.mutate({ tripId });
  };

  const handleFilterCategoryToggle = (category: string) => {
    if (filterCategory?.toLowerCase() === category.toLowerCase()) {
      setFilterCategory(null);
    } else {
      setFilterCategory(category);
    }
  };

  return (
    <div className="flex flex-col gap-4 h-[calc(100vh-5rem)] min-h-[640px] pb-2">
      {/* Toast de notificación flotante */}
      {notification && (
        <div
          className={`fixed top-5 right-5 z-[1000] px-4 py-3 rounded-xl shadow-xl text-xs font-semibold flex items-center gap-2 border transition-all animate-bounce ${
            notification.type === 'success'
              ? 'bg-emerald-950 text-emerald-200 border-emerald-500/40'
              : 'bg-red-950 text-red-200 border-red-500/40'
          }`}
        >
          <span>{notification.text}</span>
        </div>
      )}

      {/* Barra superior de métricas KPI */}
      <LiveMapKpiBar
        metrics={metrics}
        lastUpdated={lastUpdated}
        activeFilter={filterStatus}
        onFilterChange={setFilterStatus}
        onRefresh={refetchAll}
      />

      {/* Canvas principal: Mapa a la izquierda + Panel de viajes a la derecha */}
      <div className="flex-1 flex flex-col lg:flex-row gap-4 min-h-0 overflow-hidden">
        {/* Mapa interactivo */}
        <div className="flex-1 h-full min-h-[350px]">
          <LiveMapCanvas
            features={features}
            filterStatus={filterStatus}
            onFilterStatusChange={setFilterStatus}
            filterCategory={filterCategory}
            onFilterCategoryToggle={handleFilterCategoryToggle}
            onSelectTrip={(id) => setSelectedTripDetailId(id)}
          />
        </div>

        {/* Panel lateral de viajes activos */}
        <ActiveTripsPanel
          trips={activeTrips}
          onSelectTrip={(id) => setSelectedTripDetailId(id)}
          onOpenManualAssign={handleOpenManualAssign}
          onExpandRadius={handleExpandRadius}
          isExpandingRadiusTripId={expandingTripId}
        />
      </div>

      {/* Modal para asignación manual */}
      <ManualAssignModal
        trip={selectedTripForModal}
        isOpen={Boolean(selectedTripForModal)}
        onClose={() => setSelectedTripForModal(null)}
        availableDrivers={allFeatures}
        onAssign={handleConfirmAssign}
        isLoading={manualAssignMutation.isPending}
      />

      {/* Drawer de detalle de viaje cuando se clickea uno */}
      {selectedTripDetailId && (
        <TripDetailDrawer
          tripId={selectedTripDetailId}
          onClose={() => setSelectedTripDetailId(null)}
        />
      )}
    </div>
  );
};
