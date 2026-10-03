import { useState, useMemo, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getFleetLocations } from '../../../core/map/actions/getFleetLocations.action';
import { getActiveTrips } from '../../../core/map/actions/getActiveTrips.action';
import { getLiveMapKpi } from '../../../core/map/actions/getLiveMapKpi.action';
import { getDrivers } from '../../../core/drivers/actions/getDrivers.action';
import type { FleetGeoJsonResponse, LiveMapMetrics } from '../../../core/map/interfaces/live-map.interface';
import { useLiveMapSocket } from './useLiveMapSocket';

export const useLiveMap = () => {
  const queryClient = useQueryClient();
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [filterStatus, setFilterStatus] = useState<'all' | 'online' | 'in_trip' | 'offline'>('all');
  const [filterCategory, setFilterCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // 1. Carga de ubicaciones de flota (con fallback polling cada 10s)
  const {
    data: fleetData,
    isLoading: isLoadingFleet,
    refetch: refetchFleet,
  } = useQuery<FleetGeoJsonResponse>({
    queryKey: ['fleet-locations'],
    queryFn: async () => {
      const data = await getFleetLocations('all');
      setLastUpdated(new Date());
      return data;
    },
    refetchInterval: 10000,
    staleTime: 5000,
  });

  // 2. Carga de viajes activos
  const {
    data: activeTrips = [],
    isLoading: isLoadingTrips,
    refetch: refetchTrips,
  } = useQuery({
    queryKey: ['active-trips'],
    queryFn: async () => {
      const trips = await getActiveTrips();
      setLastUpdated(new Date());
      return trips;
    },
    refetchInterval: 10000,
    staleTime: 5000,
  });

  // 3. Carga de métricas de dashboard
  const {
    data: kpiData,
    refetch: refetchKpi,
  } = useQuery({
    queryKey: ['live-map-kpis'],
    queryFn: getLiveMapKpi,
    refetchInterval: 10000,
    staleTime: 5000,
  });

  // 4. Carga del total de conductores aprobados de la flota para calcular desconectados
  const {
    data: approvedDriversData,
    refetch: refetchApprovedDrivers,
  } = useQuery({
    queryKey: ['approved-drivers-count'],
    queryFn: () => getDrivers({ page: 1, limit: 1, status: 'approved' }),
    staleTime: 15000,
    refetchInterval: 15000,
  });

  // Manejo de reconexión de sockets: refresca REST
  const handleReconnect = useCallback(() => {
    refetchFleet();
    refetchTrips();
    refetchKpi();
    refetchApprovedDrivers();
  }, [refetchFleet, refetchTrips, refetchKpi, refetchApprovedDrivers]);

  // Manejo de actualización de ubicación en tiempo real
  const handleDriverLocationUpdated = useCallback(
    (data: {
      driverId: string;
      latitude: number;
      longitude: number;
      availabilityStatus?: 'online' | 'in_trip' | 'offline';
      properties?: Record<string, unknown>;
    }) => {
      queryClient.setQueryData<FleetGeoJsonResponse>(['fleet-locations'], (old) => {
        if (!old) return old;

        const existingIndex = old.features.findIndex(
          (f) => f.properties.driverId === data.driverId
        );

        if (existingIndex >= 0) {
          const updatedFeatures = [...old.features];
          const prev = updatedFeatures[existingIndex];
          updatedFeatures[existingIndex] = {
            ...prev,
            geometry: {
              type: 'Point',
              coordinates: [data.longitude, data.latitude],
            },
            properties: {
              ...prev.properties,
              ...data.properties,
              availabilityStatus:
                data.availabilityStatus || prev.properties.availabilityStatus,
              lastLocationUpdateAt: new Date().toISOString(),
            },
          };
          return {
            ...old,
            features: updatedFeatures,
          };
        }

        return old;
      });
      setLastUpdated(new Date());
    },
    [queryClient]
  );

  // Manejo de actualización de métricas en tiempo real por socket
  const handleMetricsUpdated = useCallback(
    (data: Partial<LiveMapMetrics>) => {
      queryClient.setQueryData<Partial<LiveMapMetrics> | null>(['live-map-kpis'], (old) => ({
        ...old,
        ...data,
      }));
      setLastUpdated(new Date());
    },
    [queryClient]
  );

  // Manejo de eventos de viaje (actualizar lista y marcadores)
  const handleTripStatusUpdated = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['active-trips'] });
    queryClient.invalidateQueries({ queryKey: ['fleet-locations'] });
    queryClient.invalidateQueries({ queryKey: ['live-map-kpis'] });
    queryClient.invalidateQueries({ queryKey: ['approved-drivers-count'] });
    setLastUpdated(new Date());
  }, [queryClient]);

  // Conexión WebSocket
  useLiveMapSocket({
    onDriverLocationUpdated: handleDriverLocationUpdated,
    onMetricsUpdated: handleMetricsUpdated,
    onTripStatusUpdated: handleTripStatusUpdated,
    onReconnect: handleReconnect,
  });

  // Cálculo de KPIs combinando endpoint REST y estado local
  const metrics: LiveMapMetrics = useMemo(() => {
    const features = fleetData?.features || [];
    const onlineDriversCount = features.filter(
      (f) => f.properties.availabilityStatus === 'online'
    ).length;
    const inTripDriversCount = features.filter(
      (f) => f.properties.availabilityStatus === 'in_trip'
    ).length;
    const offlineDriversCount = features.filter(
      (f) => f.properties.availabilityStatus === 'offline'
    ).length;

    const tripsInCourse = activeTrips.filter(
      (t) => ['assigned', 'driver_arriving', 'driver_arrived', 'in_progress'].includes(t.status)
    ).length;

    const searchingTripsList = activeTrips.filter((t) => t.status === 'searching');
    const searchingTripsCount = searchingTripsList.length;

    const now = Date.now();
    const waitingMoreThan3MinCount = searchingTripsList.filter((t) => {
      const created = new Date(t.createdAt).getTime();
      return !isNaN(created) && now - created > 3 * 60 * 1000;
    }).length;

    // Conteo de choferes desconectados:
    // Si la telemetría solo reporta activos, desconectados = total aprobados - en línea - en viaje.
    const totalApproved = approvedDriversData?.pagination?.totalCount ?? 0;
    const computedOffline = totalApproved > 0
      ? Math.max(0, totalApproved - onlineDriversCount - inTripDriversCount)
      : offlineDriversCount;

    return {
      onlineDrivers: kpiData?.onlineDrivers ?? onlineDriversCount,
      inTripDrivers: kpiData?.inTripDrivers ?? inTripDriversCount,
      activeTrips: kpiData?.activeTrips ?? tripsInCourse,
      searchingTrips: kpiData?.searchingTrips ?? searchingTripsCount,
      offlineDrivers: kpiData?.offlineDrivers ?? (offlineDriversCount > 0 ? offlineDriversCount : computedOffline),
      waitingMoreThan3Min: kpiData?.waitingMoreThan3Min ?? waitingMoreThan3MinCount,
    };
  }, [fleetData, activeTrips, kpiData, approvedDriversData]);

  // Filtrado de conductores para el mapa
  const filteredFeatures = useMemo(() => {
    const features = fleetData?.features || [];
    return features.filter((feat) => {
      const props = feat.properties;
      // Filtro de estado
      if (filterStatus !== 'all' && props.availabilityStatus !== filterStatus) {
        return false;
      }
      // Filtro de categoría
      if (filterCategory) {
        const vehicleCategory = props.vehicle?.model?.toLowerCase();
        if (!vehicleCategory?.includes(filterCategory.toLowerCase())) {
          return false;
        }
      }
      // Búsqueda libre
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = props.fullName?.toLowerCase().includes(q);
        const matchesPlate = props.vehicle?.plate?.toLowerCase().includes(q);
        const matchesTrip = props.currentTripId?.toLowerCase().includes(q);
        if (!matchesName && !matchesPlate && !matchesTrip) {
          return false;
        }
      }
      return true;
    });
  }, [fleetData, filterStatus, filterCategory, searchQuery]);

  return {
    fleetData,
    features: filteredFeatures,
    allFeatures: fleetData?.features || [],
    activeTrips,
    metrics,
    isLoading: isLoadingFleet || isLoadingTrips,
    lastUpdated,
    filterStatus,
    setFilterStatus,
    filterCategory,
    setFilterCategory,
    searchQuery,
    setSearchQuery,
    refetchAll: handleReconnect,
  };
};
