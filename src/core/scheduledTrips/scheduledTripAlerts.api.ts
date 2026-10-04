import { z } from 'zod';
import { adminApi } from '../api/adminApi';

/**
 * El panel todavia no tiene una pantalla general de alertas operativas
 * (`operational_alerts`): esto solo trae las alertas de viajes reservados
 * para el panel chico de la pantalla de "Viajes reservados" (alcance
 * acotado, pedido del usuario). Si en el futuro se construye una pantalla
 * de alertas general, este archivo se puede fusionar con ese modulo.
 */

// Los 5 tipos nuevos de `operational-alert.model.ts` (ramas
// `feature/viajes-reservados` y `feature/politica-reembolsos` del backend).
// Los otros 3 tipos existentes (`trip_search_timeout`, `active_trip_gps_stale`,
// `consecutive_cancellations`) no son de viajes reservados y no se muestran
// en este panel chico.
export const scheduledTripAlertTypes = [
  'scheduled_trip_driver_unavailable',
  'scheduled_trip_unpaid',
  'scheduled_trip_unaccepted',
  'scheduled_trip_duplicate_payment',
  // Se cancelo un reservado que ya estaba prepago (link de MP o
  // transferencia): el reembolso nunca lo intenta Mercado Pago solo, queda
  // como reclamo en la pantalla de "Reclamos de reembolso".
  'scheduled_trip_cancelled_refund_due',
] as const;
export type ScheduledTripAlertType = (typeof scheduledTripAlertTypes)[number];

export const scheduledTripAlertLabels: Record<ScheduledTripAlertType, string> = {
  scheduled_trip_driver_unavailable: 'Chofer reservado no disponible',
  scheduled_trip_unpaid: 'Viaje reservado sin cobrar',
  scheduled_trip_unaccepted: 'Nadie aceptó el viaje reservado',
  scheduled_trip_duplicate_payment: 'Cobro duplicado en un viaje reservado',
  scheduled_trip_cancelled_refund_due: 'Reservado cancelado: reembolso pendiente',
};

const alertSchema = z.object({
  id: z.string().uuid(),
  type: z.string(),
  severity: z.enum(['warning', 'critical']),
  status: z.enum(['open', 'resolved']),
  trip_id: z.string().nullable(),
  details: z.record(z.string(), z.unknown()),
  detected_at: z.string(),
  resolved_at: z.string().nullable(),
});

const alertListSchema = z.object({
  alerts: z.array(alertSchema),
  pagination: z.object({ page: z.number(), limit: z.number(), total: z.number(), pages: z.number() }),
});

export type OperationalAlert = z.infer<typeof alertSchema>;

function isScheduledTripAlertType(type: string): type is ScheduledTripAlertType {
  return (scheduledTripAlertTypes as readonly string[]).includes(type);
}

/**
 * Trae las alertas abiertas mas recientes y se queda solo con las de viajes
 * reservados: el endpoint (`GET /admin/alerts`) filtra por un unico `type`
 * a la vez, y este panel necesita los 4 tipos juntos.
 */
export async function getOpenScheduledTripAlerts(limit = 20, signal?: AbortSignal): Promise<OperationalAlert[]> {
  const { data } = await adminApi.get('/admin/alerts', {
    params: { status: 'open', page: 1, limit },
    signal,
  });
  const { alerts } = alertListSchema.parse(data.data);
  return alerts.filter((alert) => isScheduledTripAlertType(alert.type));
}
