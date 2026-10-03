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
    refetchAll,
  } = useLiveMap();

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showTripsInFullscreen, setShowTripsInFullscreen] = useState(false);
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

  return (
    <div
      className={
        isFullscreen
          ? '-m-4 lg:-m-8 h-[calc(100vh-4rem)] p-3 lg:p-4 bg-gray-50 dark:bg-dark-bg z-20 flex flex-col gap-3 transition-all duration-300'
          : 'flex flex-col gap-4 h-[calc(100vh-5rem)] min-h-[640px] pb-2 transition-all duration-300'
      }
    >
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
      <div className="relative flex-1 flex flex-col lg:flex-row gap-4 min-h-0 overflow-hidden">
        {/* Mapa interactivo */}
        <div className="flex-1 h-full min-h-[350px]">
          <LiveMapCanvas
            features={features}
            filterStatus={filterStatus}
            onFilterStatusChange={setFilterStatus}
            onSelectTrip={(id) => setSelectedTripDetailId(id)}
            isFullscreen={isFullscreen}
            onToggleFullscreen={() => setIsFullscreen((prev) => !prev)}
          />
        </div>

        {/* Panel lateral de viajes activos */}
        {(!isFullscreen || showTripsInFullscreen) && (
          <div
            className={
              isFullscreen
                ? 'absolute top-0 right-0 bottom-0 z-[450] shadow-2xl h-full'
                : 'h-full flex-shrink-0'
            }
          >
            <ActiveTripsPanel
              trips={activeTrips}
              onSelectTrip={(id) => setSelectedTripDetailId(id)}
              onOpenManualAssign={handleOpenManualAssign}
              onExpandRadius={handleExpandRadius}
              isExpandingRadiusTripId={expandingTripId}
            />
          </div>
        )}

        {/* Botón flotante para ver panel de viajes si está en pantalla completa */}
        {isFullscreen && (
          <button
            type="button"
            onClick={() => setShowTripsInFullscreen((prev) => !prev)}
            className="absolute bottom-4 right-32 z-[400] flex items-center gap-1.5 bg-neutral-900/90 hover:bg-neutral-800 text-white text-xs font-semibold px-3 py-2 rounded-lg shadow-xl border border-white/10 backdrop-blur-md transition-all"
          >
            <span>{showTripsInFullscreen ? 'Ocultar viajes' : `Ver viajes (${activeTrips.length})`}</span>
          </button>
        )}
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
