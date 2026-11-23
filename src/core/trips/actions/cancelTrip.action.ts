import { adminApi } from '../../api/adminApi';

export interface CancellationPreview {
  cancellable: boolean;
  penalty_amount: string;
  refund_amount: string;
  refund_kind: string;
  refund_mode: 'automatic' | 'claim' | 'none';
  currency: string;
}

/** Que pasa si el admin cancela ahora (reintegro, penalidad), sin cancelar. */
export const getCancellationPreview = async (tripId: string): Promise<CancellationPreview> => {
  const { data } = await adminApi.get<{ data: CancellationPreview }>(`/rides/${tripId}/cancellation-preview`);
  return data.data;
};

/** Cancela el viaje como admin. `reason_code` en minusculas y guiones bajos. */
export const cancelTrip = async (tripId: string, reasonCode: string, notes?: string): Promise<void> => {
  await adminApi.post(`/rides/${tripId}/cancel`, { reason_code: reasonCode, ...(notes ? { notes } : {}) });
};
