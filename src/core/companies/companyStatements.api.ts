import { z } from 'zod';
import { adminApi } from '../api/adminApi';

export const statementStatuses = ['issued', 'paid', 'overdue'] as const;

const statementSchema = z.object({
  id: z.string().uuid(),
  company_id: z.string().uuid(),
  period_start: z.string(),
  period_end: z.string(),
  status: z.enum(statementStatuses),
  total_amount: z.string(),
  paid_amount: z.string(),
  currency: z.string(),
  issued_at: z.string(),
  due_at: z.string(),
  paid_at: z.string().nullable(),
});

const statementsListSchema = z.object({
  statements: z.array(statementSchema),
});

const statementLineSchema = z.object({
  trip_id: z.string().uuid().nullable(),
  trip_public_code: z.string().nullable(),
  date: z.string(),
  employee_id: z.string().uuid().nullable(),
  employee_name: z.string().nullable(),
  cost_center_id: z.string().uuid().nullable(),
  cost_center_name: z.string().nullable(),
  amount: z.string(),
  type: z.enum(['trip', 'cancellation_penalty']),
});

const statementDetailSchema = z.object({
  statement: statementSchema,
  lines: z.array(statementLineSchema),
});

const paymentLinkSchema = z.object({
  checkout_url: z.string(),
  expires_at: z.string(),
});

const closeStatementsSchema = z.object({
  period: z.string(),
  issued: z.number(),
  // Empresas cuyo cierre fallo: el resto se emitio igual (cierre por empresa, no todo o nada).
  failed: z.number(),
});

export const registerManualPaymentFormSchema = z.object({
  amount: z
    .string()
    .trim()
    .regex(/^\d{1,10}(\.\d{1,2})?$/, 'Ingresá un importe positivo con hasta 2 decimales')
    .refine((value) => Number(value) > 0, 'Ingresá un importe positivo con hasta 2 decimales'),
  reference: z.string().trim().min(1, 'Ingresá la referencia de la transferencia').max(100),
  paid_at: z.string().trim().min(1, 'Ingresá la fecha de la transferencia'),
});

export type Statement = z.infer<typeof statementSchema>;
export type StatementLine = z.infer<typeof statementLineSchema>;
export type StatementDetail = z.infer<typeof statementDetailSchema>;
export type PaymentLink = z.infer<typeof paymentLinkSchema>;
export type CloseStatementsResult = z.infer<typeof closeStatementsSchema>;
export type RegisterManualPaymentFormValues = z.infer<typeof registerManualPaymentFormSchema>;

export async function getCompanyStatements(companyId: string, signal?: AbortSignal) {
  const response = await adminApi.get(`/corporate/companies/${companyId}/statements`, { signal });
  return statementsListSchema.parse(response.data.data).statements;
}

export async function getStatementDetail(statementId: string, signal?: AbortSignal) {
  const response = await adminApi.get(`/corporate/statements/${statementId}`, { signal });
  return statementDetailSchema.parse(response.data.data);
}

// Cada click pide una Idempotency-Key nueva: repetir la solicitud con la misma
// clave devolveria el mismo link ya vencido en vez de generar uno nuevo.
export async function createStatementPaymentLink(statementId: string) {
  const response = await adminApi.post(
    `/corporate/statements/${statementId}/payment-link`,
    {},
    { headers: { 'Idempotency-Key': crypto.randomUUID() } },
  );
  return paymentLinkSchema.parse(response.data.data);
}

export async function registerManualPayment(statementId: string, values: RegisterManualPaymentFormValues) {
  const response = await adminApi.post(`/corporate/statements/${statementId}/payments`, {
    amount: values.amount,
    method: 'bank_transfer',
    reference: values.reference,
    paid_at: new Date(values.paid_at).toISOString(),
  });
  return statementSchema.parse(response.data.data);
}

// Cierre global: emite el resumen del periodo para todas las empresas, no solo
// una. No se llama nunca desde el detalle de una empresa puntual.
export async function closeStatementsPeriod(period: string) {
  const response = await adminApi.post('/corporate/statements/close', null, { params: { period } });
  return closeStatementsSchema.parse(response.data.data);
}
