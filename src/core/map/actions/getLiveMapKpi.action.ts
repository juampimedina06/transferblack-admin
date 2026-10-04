import { adminApi } from '../../api/adminApi';
import type { LiveMapMetrics } from '../interfaces/live-map.interface';

export const getLiveMapKpi = async (): Promise<Partial<LiveMapMetrics> | null> => {
  try {
    const response = await adminApi.get('/admin/dashboard');
    const data = response.data;
    if (!data) return null;

    return {
      onlineDrivers: data.onlineDrivers ?? data.conductoresEnLinea ?? data.online_drivers,
      inTripDrivers: data.inTripDrivers ?? data.conductoresEnViaje ?? data.in_trip_drivers,
      activeTrips: data.activeTrips ?? data.viajesEnCurso ?? data.active_trips,
      searchingTrips: data.searchingTrips ?? data.buscandoConductor ?? data.searching_trips,
      offlineDrivers: data.offlineDrivers ?? data.desconectados ?? data.offline_drivers,
      waitingMoreThan3Min: data.waitingMoreThan3Min ?? data.esperandoMasDe3Min ?? 0,
    };
  } catch (error) {
    // Si el endpoint no existe o no tiene ese formato, se calcula de la flota y viajes activos
    return null;
  }
};
