import { adminApi } from '../../api/adminApi';
import type { TripStatusHistoryItem } from '../interfaces/trip.interface';

export const getTripStatusHistory = async (tripId: string): Promise<TripStatusHistoryItem[]> => {
  const response = await adminApi.get<{ data: { history: any[] } } | { history: any[] }>(
    `/rides/${tripId}/status-history`
  );

  const rawHistory =
    (response.data as any)?.data?.history || (response.data as any)?.history || [];

  return rawHistory.map((item: any) => ({
    id: item.id,
    fromStatus: item.from_status || item.fromStatus || null,
    toStatus: item.to_status || item.toStatus,
    actorUserId: item.actor_user_id || item.actorUserId || null,
    actorType: item.actor_type || item.actorType || 'system',
    reasonCode: item.reason_code || item.reasonCode || null,
    notes: item.notes || null,
    metadata: item.metadata || null,
    location: item.location || null,
    createdAt: item.created_at || item.createdAt || new Date().toISOString(),
  }));
};
