import { z } from 'zod';
import { adminApi } from '../api/adminApi';
import { extractErrorCode, isValidCalendarDate, moneyAmount } from './shared';

/**
 * Cobro por adelantado de un viaje reservado: link de Checkout Pro o
 * transferencia registrada a mano. Mismo patron que la carga de saldo de
 * empresas (`companyTopUps.api.ts`), pero con la propia idempotencia de
 * `scheduled-trip-payment.service.ts` del backend.
 */

export const scheduledTripPaymentMethods = ['mercado_pago', 'bank_transfer'] as const;
export type ScheduledTripPaymentMethod = (typeof scheduledTripPaymentMethods)[number];

export const scheduledTripPaymentStatuses = ['pending', 'paid', 'failed', 'requires_refund'] as const;
export type ScheduledTripPaymentStatus = (typeof scheduledTripPaymentStatuses)[number];

const paymentSchema = z.object({
  id: z.string().uuid(),
  trip_id: z.string().uuid(),
  method: z.enum(scheduledTripPaymentMethods),
  status: z.enum(scheduledTripPaymentStatuses),
  amount: z.string(),
  currency: z.string(),
  reference: z.string().nullable(),
  paid_at: z.string().nullable(),
  created_at: z.string(),
});

const paymentListSchema = z.object({ payments: z.array(paymentSchema) });

const paymentLinkSchema = z.object({ checkout_url: z.string(), expires_at: z.string() });

export type ScheduledTripPayment = z.infer<typeof paymentSchema>;
export type ScheduledTripPaymentLink = z.infer<typeof paymentLinkSchema>;

export async function getScheduledTripPayments(tripId: string, signal?: AbortSignal): Promise<ScheduledTripPayment[]> {
  const { data } = await adminApi.get(`/admin/scheduled-trips/${tripId}/payments`, { signal });
  return paymentListSchema.parse(data.data).payments;
}

// Cada click pide una Idempotency-Key nueva: repetir la solicitud con la
// misma clave devolveria el mismo link ya vencido en vez de generar uno
// nuevo (mismo patron que `createTopUpPaymentLink`).
export async function createScheduledTripPaymentLink(tripId: string): Promise<ScheduledTripPaymentLink> {
  const { data } = await adminApi.post(
    `/admin/scheduled-trips/${tripId}/payment-link`,
    {},
    { headers: { 'Idempotency-Key': crypto.randomUUID() } },
  );
  return paymentLinkSchema.parse(data.data);
}

export const registerScheduledTripTransferFormSchema = z.object({
  amount: moneyAmount,
  reference: z.string().trim().min(1, 'Ingresá la referencia de la transferencia').max(100),
  paid_at: z
    .string()
    .trim()
    .min(1, 'Ingresá la fecha del pago')
    .refine(isValidCalendarDate, 'Ingresá una fecha válida'),
});
export type RegisterScheduledTripTransferFormValues = z.infer<typeof registerScheduledTripTransferFormSchema>;
export const registerScheduledTripTransferFormFields = [
  'amount',
  'reference',
  'paid_at',
] as const satisfies readonly (keyof RegisterScheduledTripTransferFormValues)[];

export async function registerScheduledTripTransfer(
  tripId: string,
  values: RegisterScheduledTripTransferFormValues,
): Promise<ScheduledTripPayment> {
  const { data } = await adminApi.post(`/admin/scheduled-trips/${tripId}/transfer`, {
    amount: values.amount,
    reference: values.reference,
    // Mediodia en el offset fijo de Argentina, igual que `registerTopUpManualTransfer`.
    paid_at: `${values.paid_at}T12:00:00-03:00`,
  });
  return paymentSchema.parse(data.data);
}

/**
 * Copia amigable para los codigos de negocio del cobro (409/404): igual
 * motivo que `friendlyTopUpErrorMessage`. `null` si no es uno de estos.
 */
export function friendlyScheduledTripPaymentErrorMessage(error: unknown): string | null {
  switch (extractErrorCode(error)) {
    case 'SCHEDULED_TRIP_ALREADY_PREPAID':
      return 'Este viaje ya está pago.';
    case 'SCHEDULED_TRIP_CANCELLED':
      return 'Este viaje está cancelado, no se le puede registrar un cobro.';
    case 'SCHEDULED_TRIP_PAYMENT_AMOUNT_MISMATCH':
      return 'Esa referencia ya se registró con otro importe. El importe tiene que ser igual al precio acordado.';
    case 'SCHEDULED_TRIP_PAYMENT_LINK_IN_PROGRESS':
      return 'Ya hay un link en curso para este viaje. Esperá un momento y volvé a intentar.';
    case 'IDEMPOTENCY_KEY_REUSED':
      return 'Hubo un problema generando el link. Volvé a intentar.';
    case 'SCHEDULED_TRIP_NOT_FOUND':
      return 'El viaje reservado no existe o ya no está disponible.';
    default:
      return null;
  }
}
