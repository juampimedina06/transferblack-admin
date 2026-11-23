import { adminApi } from '../../api/adminApi';
import type { LiveMapMetrics } from '../interfaces/live-map.interface';

/** Contadores del mapa en vivo (`GET /admin/live-map/kpis`). `null` si fallan: el mapa los calcula de la flota. */
export const getLiveMapKpi = async (): Promise<Partial<LiveMapMetrics> | null> => {
  try {
    const response = await adminApi.get<{ data: LiveMapMetrics }>('/admin/live-map/kpis');
    return response.data.data ?? null;
  } catch {
    return null;
  }
};
