import { z } from 'zod';
import { adminApi } from '../api/adminApi';
import { isValidCalendarDate } from './companyStatements.api';

export const companyTopUpMethods = ['mercado_pago', 'bank_transfer'] as const;
export type CompanyTopUpMethod = (typeof companyTopUpMethods)[number];

// `superseded` no se genera hoy desde el panel (una carga nunca reemplaza a
// otra, ver `company-top-up.model.ts` del backend), pero queda en el catalogo
// para no romper si el backend llega a usarlo.
export const companyTopUpStatuses = ['pending', 'paid', 'failed', 'superseded'] as const;
export type CompanyTopUpStatus = (typeof companyTopUpStatuses)[number];

const topUpSchema = z.object({
  id: z.string().uuid(),
  company_id: z.string().uuid(),
  method: z.enum(companyTopUpMethods),
  status: z.enum(companyTopUpStatuses),
  amount: z.string(),
  currency: z.string(),
  reference: z.string().nullable(),
  paid_at: z.string().nullable(),
  created_at: z.string(),
});

const topUpListSchema = z.object({
  top_ups: z.array(topUpSchema),
});

const topUpPaymentLinkSchema = z.object({
  checkout_url: z.string(),
  expires_at: z.string(),
});

const moneyAmount = z
  .string()
  .trim()
  .regex(/^\d{1,10}(\.\d{1,2})?$/, 'Ingresá un importe positivo con hasta 2 decimales')
  .refine((value) => Number(value) > 0, 'Ingresá un importe positivo con hasta 2 decimales');

export const topUpPaymentLinkFormSchema = z.object({ amount: moneyAmount });

export const topUpPaymentLinkFormFields = Object.keys(topUpPaymentLinkFormSchema.shape) as Array<
  keyof z.infer<typeof topUpPaymentLinkFormSchema>
>;

export const registerTopUpManualTransferFormSchema = z.object({
  amount: moneyAmount,
  reference: z.string().trim().min(1, 'Ingresá la referencia de la transferencia').max(100),
  paid_at: z
    .string()
    .trim()
    .min(1, 'Ingresá la fecha de la carga')
    .refine(isValidCalendarDate, 'Ingresá una fecha válida'),
});

export const registerTopUpManualTransferFormFields = Object.keys(
  registerTopUpManualTransferFormSchema.shape,
) as Array<keyof z.infer<typeof registerTopUpManualTransferFormSchema>>;

export type CompanyTopUp = z.infer<typeof topUpSchema>;
export type TopUpPaymentLink = z.infer<typeof topUpPaymentLinkSchema>;
export type TopUpPaymentLinkFormValues = z.infer<typeof topUpPaymentLinkFormSchema>;
export type RegisterTopUpManualTransferFormValues = z.infer<typeof registerTopUpManualTransferFormSchema>;

export async function getCompanyTopUps(companyId: string, signal?: AbortSignal) {
  const response = await adminApi.get(`/corporate/companies/${companyId}/top-ups`, { signal });
  return topUpListSchema.parse(response.data.data).top_ups;
}

// Cada click pide una Idempotency-Key nueva: repetir la solicitud con la
// misma clave devolveria el mismo link ya vencido en vez de generar uno nuevo
// (mismo patron que `createStatementPaymentLink`).
export async function createTopUpPaymentLink(companyId: string, values: TopUpPaymentLinkFormValues) {
  const response = await adminApi.post(
    `/corporate/companies/${companyId}/top-ups/payment-link`,
    { amount: values.amount },
    { headers: { 'Idempotency-Key': crypto.randomUUID() } },
  );
  return topUpPaymentLinkSchema.parse(response.data.data);
}

export async function registerTopUpManualTransfer(
  companyId: string,
  values: RegisterTopUpManualTransferFormValues,
) {
  const response = await adminApi.post(`/corporate/companies/${companyId}/top-ups`, {
    amount: values.amount,
    method: 'bank_transfer',
    reference: values.reference,
    // Mismo motivo que `registerManualPayment` de resumenes: mediodia en el
    // offset fijo de Argentina para no depender del huso horario del
    // navegador ni pisar el dia por redondeo.
    paid_at: `${values.paid_at}T12:00:00-03:00`,
  });
  return topUpSchema.parse(response.data.data);
}

function extractErrorCode(error: unknown): string | undefined {
  return (error as { response?: { data?: { error?: { code?: string } } } })?.response?.data?.error?.code;
}

/**
 * Copia amigable para los codigos de negocio propios de la carga de saldo
 * (409/422): el mensaje crudo del backend no lleva tildes y no siempre
 * sugiere que hacer. `null` si el codigo no es uno de estos, para que el
 * llamador siga con `applyServerErrors` (VALIDATION_ERROR o mensaje generico).
 */
export function friendlyTopUpErrorMessage(error: unknown): string | null {
  switch (extractErrorCode(error)) {
    case 'COMPANY_TOP_UP_AMOUNT_TOO_HIGH':
      return 'El importe supera el máximo permitido por carga. Ingresá un monto menor.';
    case 'COMPANY_TOP_UP_AMOUNT_MISMATCH':
      return 'Esa referencia ya se cargó con un importe distinto. Revisá el número de comprobante o el monto.';
    default:
      return null;
  }
}
