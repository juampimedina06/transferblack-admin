import { z } from 'zod';
import { adminApi } from '../api/adminApi';

/**
 * Reclamos de reembolso (`payment.refundStatus: 'claim_required'`): el
 * reintegro quedo calculado al cancelar (fuera de la ventana de reembolso
 * automatico, o viaje reservado prepago) pero nadie llamo a Mercado Pago. Un
 * admin lo cierra aca: por Mercado Pago (si el cobro de verdad entro por ahi)
 * o a mano (transferencia bancaria de vuelta, con referencia).
 *
 * El DTO del backend (`admin-refund.dto.ts`) solo trae `passenger_user_id`
 * (sin nombre/email) y un unico `amount` (el total reclamado, no el desglose
 * pendiente/ya devuelto de una resolucion parcial). El nombre, el email y si
 * el viaje es reservado se completan aparte con `getTripDetail` (mismo
 * `GET /rides/:tripId` que ya usa el detalle de viajes), sin tocar el
 * backend.
 */

export const refundClaimListStatuses = ['pending', 'resolved'] as const;
export type RefundClaimListStatus = (typeof refundClaimListStatuses)[number];

export const refundResolutionModes = ['mercado_pago', 'manual'] as const;
export type RefundResolutionMode = (typeof refundResolutionModes)[number];

const refundClaimApiSchema = z.object({
  trip_id: z.string(),
  trip_public_code: z.string(),
  passenger_user_id: z.string(),
  payment_id: z.string(),
  payment_method: z.string(),
  amount: z.string(),
  currency: z.string(),
  refund_status: z.string(),
  refund_resolution_mode: z.enum(refundResolutionModes).nullable(),
  cancelled_at: z.string().nullable(),
  cancellation_reason_code: z.string().nullable(),
});

const refundClaimListApiSchema = z.object({
  data: z.array(refundClaimApiSchema),
  pagination: z.object({
    page: z.number(),
    limit: z.number(),
    total: z.number(),
    total_pages: z.number(),
  }),
});

const resolveRefundClaimResponseApiSchema = z.object({
  payment_id: z.string(),
  trip_id: z.string(),
  refund_status: z.string(),
  refund_resolution_mode: z.enum(refundResolutionModes),
  amount_refunded: z.string(),
  provider_refund_id: z.string().nullable(),
  manual_reference: z.string().nullable(),
});

export interface RefundClaim {
  tripId: string;
  tripPublicCode: string;
  passengerUserId: string;
  paymentId: string;
  paymentMethod: string;
  amount: string;
  currency: string;
  refundStatus: string;
  refundResolutionMode: RefundResolutionMode | null;
  cancelledAt: string | null;
  cancellationReasonCode: string | null;
}

export interface RefundClaimPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface RefundClaimListResult {
  claims: RefundClaim[];
  pagination: RefundClaimPagination;
}

export interface ListRefundClaimsFilters {
  status: RefundClaimListStatus;
  page?: number;
  limit?: number;
}

export interface ResolveRefundClaimPayload {
  mode: RefundResolutionMode;
  amount?: string;
  reference?: string;
  notes?: string;
}

export interface ResolveRefundClaimResult {
  paymentId: string;
  tripId: string;
  refundStatus: string;
  refundResolutionMode: RefundResolutionMode;
  amountRefunded: string;
  providerRefundId: string | null;
  manualReference: string | null;
}

function mapClaim(dto: z.infer<typeof refundClaimApiSchema>): RefundClaim {
  return {
    tripId: dto.trip_id,
    tripPublicCode: dto.trip_public_code,
    passengerUserId: dto.passenger_user_id,
    paymentId: dto.payment_id,
    paymentMethod: dto.payment_method,
    amount: dto.amount,
    currency: dto.currency,
    refundStatus: dto.refund_status,
    refundResolutionMode: dto.refund_resolution_mode,
    cancelledAt: dto.cancelled_at,
    cancellationReasonCode: dto.cancellation_reason_code,
  };
}

export async function getRefundClaims(
  filters: ListRefundClaimsFilters,
  signal?: AbortSignal,
): Promise<RefundClaimListResult> {
  const { data } = await adminApi.get('/admin/refund-claims', {
    params: {
      status: filters.status,
      page: filters.page ?? 1,
      limit: filters.limit ?? 20,
    },
    signal,
  });
  const parsed = refundClaimListApiSchema.parse(data);
  return {
    claims: parsed.data.map(mapClaim),
    pagination: {
      page: parsed.pagination.page,
      limit: parsed.pagination.limit,
      total: parsed.pagination.total,
      totalPages: parsed.pagination.total_pages,
    },
  };
}

/**
 * Resuelve un reclamo. Exige `Idempotency-Key`: el llamador decide cuando
 * reusarla (mismo intento, mismo monto/modo) y cuando pedir una nueva (otro
 * intento, o cambio de monto/modo) - ver `useResolveRefundClaimForm`.
 */
export async function resolveRefundClaim(
  tripId: string,
  idempotencyKey: string,
  payload: ResolveRefundClaimPayload,
): Promise<ResolveRefundClaimResult> {
  const { data } = await adminApi.post(
    `/admin/rides/${tripId}/refund`,
    {
      mode: payload.mode,
      ...(payload.amount ? { amount: payload.amount } : {}),
      ...(payload.reference ? { reference: payload.reference } : {}),
      ...(payload.notes ? { notes: payload.notes } : {}),
    },
    { headers: { 'Idempotency-Key': idempotencyKey } },
  );
  const parsed = resolveRefundClaimResponseApiSchema.parse(data.data);
  return {
    paymentId: parsed.payment_id,
    tripId: parsed.trip_id,
    refundStatus: parsed.refund_status,
    refundResolutionMode: parsed.refund_resolution_mode,
    amountRefunded: parsed.amount_refunded,
    providerRefundId: parsed.provider_refund_id,
    manualReference: parsed.manual_reference,
  };
}

/**
 * Medio de pago (`payment.type` del backend): el unico valor que de verdad
 * paso por Mercado Pago es `account_money`. `cash`, `voucher` y `corporate`
 * nunca tienen un cobro en la pasarela, asi que el modo "Mercado Pago" de la
 * resolucion no aplica. Es una inferencia del lado del panel (el DTO de la
 * lista no trae un campo explicito "paso por MP"): el backend confirma o
 * corrige esto con `409 REFUND_REQUIRES_MANUAL_MODE` al resolver.
 */
export const PAYMENT_METHOD_LABELS: Record<string, string> = {
  account_money: 'Mercado Pago',
  cash: 'Efectivo',
  voucher: 'Voucher',
  corporate: 'Cuenta corporativa',
};

export function paymentMethodLabel(method: string): string {
  return PAYMENT_METHOD_LABELS[method] ?? method;
}

export function canAttemptMercadoPagoRefund(paymentMethod: string): boolean {
  return paymentMethod === 'account_money';
}

/**
 * Motivos de cancelacion conocidos. Mismo mapa que
 * `cancellation-copy.ts` de la app del pasajero para los que el pasajero
 * tambien ve (`passenger_cancelled`, `no_driver_found`, `draft_expired`), mas
 * los que solo se generan del lado de choferes/admin/reservados. `reason_code`
 * es texto libre en el backend (sin enum): cualquier otro codigo cae al
 * fallback humanizado.
 */
export const CANCELLATION_REASON_LABELS: Record<string, string> = {
  passenger_cancelled: 'Cancelado por el pasajero',
  no_driver_found: 'Sin chofer disponible',
  draft_expired: 'Venció sin confirmarse',
  driver_cancelled: 'Cancelado por el chofer',
  admin_cancelled: 'Cancelado por un admin',
  passenger_request: 'Pedido del pasajero',
  passenger_changed_plans: 'El pasajero cambió de planes',
  agency_request: 'Pedido de la agencia',
  driver_unavailable: 'Chofer no disponible',
  changed_mind: 'Cambio de planes',
  no_show: 'El pasajero no se presentó',
};

export function cancellationReasonLabel(reasonCode: string | null): string {
  if (!reasonCode) return '—';
  if (CANCELLATION_REASON_LABELS[reasonCode]) return CANCELLATION_REASON_LABELS[reasonCode];
  // Fallback humanizado: "sin_chofer_zona" -> "Sin chofer zona".
  const humanized = reasonCode.replace(/_/g, ' ').trim();
  return humanized.charAt(0).toUpperCase() + humanized.slice(1);
}

export function extractErrorCode(error: unknown): string | undefined {
  return (error as { response?: { data?: { error?: { code?: string } } } })?.response?.data?.error?.code;
}

export function extractErrorDetails(error: unknown): Record<string, unknown> | undefined {
  const details = (error as { response?: { data?: { error?: { details?: unknown } } } })?.response?.data?.error
    ?.details;
  return details && typeof details === 'object' ? (details as Record<string, unknown>) : undefined;
}

/**
 * `true` para los codigos donde reintentar con la MISMA Idempotency-Key es lo
 * correcto (el intento anterior puede haber quedado "en vuelo" del lado de
 * Mercado Pago): `REFUND_PROCESSING` (409), `PAYMENT_PROVIDER_UNAVAILABLE`
 * (503) y los errores de red/timeout (sin respuesta del backend). El resto
 * (validacion, reclamo inexistente, modo invalido) necesita que el admin
 * cambie algo, y un cambio de monto/modo ya genera una clave nueva.
 */
export function isRetryableWithSameKey(error: unknown): boolean {
  const code = extractErrorCode(error);
  if (code === 'REFUND_PROCESSING' || code === 'PAYMENT_PROVIDER_UNAVAILABLE') return true;
  const status = (error as { response?: { status?: number } })?.response?.status;
  return status === undefined; // sin respuesta: error de red o timeout
}

/**
 * Copia amigable para los codigos de negocio de la resolucion (409/422/503).
 * `null` si no es uno de estos, para que el llamador siga con el mensaje
 * generico (`extractApiErrorMessage`).
 */
export function friendlyRefundErrorMessage(error: unknown): string | null {
  const code = extractErrorCode(error);
  switch (code) {
    case 'REFUND_CLAIM_NOT_FOUND':
      return 'Este viaje ya no tiene un reclamo de reembolso pendiente. Actualizá la lista.';
    case 'REFUND_REQUIRES_MANUAL_MODE':
      return 'Este cobro no entró por Mercado Pago: resolvé el reclamo en modo manual.';
    case 'REFUND_PROCESSING':
      return 'Mercado Pago todavía está procesando la devolución. Reintentá en unos minutos.';
    case 'PAYMENT_REJECTED':
      return 'Mercado Pago rechazó el reembolso.';
    case 'PAYMENT_PROVIDER_UNAVAILABLE':
      return 'Mercado Pago no está disponible en este momento. Reintentá en unos minutos.';
    case 'REFUND_AMOUNT_EXCEEDS_CLAIM': {
      const pending = extractErrorDetails(error)?.pending;
      return typeof pending === 'string'
        ? `El importe no puede superar lo pendiente de reembolso ($${pending}).`
        : 'El importe no puede superar lo pendiente de reembolso.';
    }
    case 'IDEMPOTENCY_KEY_REUSED':
      return 'Hubo un problema de sincronización al reintentar. Cerrá el modal y volvé a intentar.';
    case 'REFUND_RESOLUTION_IN_PROGRESS':
      return 'Ya hay una resolución en curso para este reclamo. Esperá un momento.';
    default:
      return null;
  }
}
