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

const closeStatementsSchema = z.object({
  period: z.string(),
  issued: z.number(),
  // Empresas cuyo cierre fallo: el resto se emitio igual (cierre por empresa, no todo o nada).
  failed: z.number(),
});

// El input nativo `type="date"` siempre entrega "YYYY-MM-DD", pero valida
// igual: si algo lo deja vacio o mal formado, `new Date(...).toISOString()`
// tira un RangeError en vez de mostrarse como error de campo. Se exporta
// porque tambien la usa `companyTopUps.api.ts` para la fecha de la carga.
export function isValidCalendarDate(value: string): boolean {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return false;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
}

export type Statement = z.infer<typeof statementSchema>;
export type StatementLine = z.infer<typeof statementLineSchema>;
export type StatementDetail = z.infer<typeof statementDetailSchema>;
export type CloseStatementsResult = z.infer<typeof closeStatementsSchema>;

export async function getCompanyStatements(companyId: string, signal?: AbortSignal) {
  const response = await adminApi.get(`/corporate/companies/${companyId}/statements`, { signal });
  return statementsListSchema.parse(response.data.data).statements;
}

export async function getStatementDetail(statementId: string, signal?: AbortSignal) {
  const response = await adminApi.get(`/corporate/statements/${statementId}`, { signal });
  return statementDetailSchema.parse(response.data.data);
}

// Cierre global: emite el resumen del periodo para todas las empresas, no solo
// una. No se llama nunca desde el detalle de una empresa puntual.
export async function closeStatementsPeriod(period: string) {
  // Sin body: axios serializa `null` como JSON (`null`), y el parser estricto
  // del backend lo rechaza con un 500 en vez de tratarlo como "sin body".
  const response = await adminApi.post('/corporate/statements/close', undefined, { params: { period } });
  return closeStatementsSchema.parse(response.data.data);
}
