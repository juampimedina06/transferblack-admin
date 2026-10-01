import { z } from 'zod';
import { adminApi } from '../api/adminApi';

/**
 * Saldo prepago (feature/empresas-prepago, backend `corporate-balance.service.ts`):
 * reemplaza a la cuenta corriente postpaga. `balance` sale del libro, `available`
 * es `balance - in_flight` (lo que se controla al confirmar un viaje) y `low_balance`
 * avisa sin bloquear.
 */
const prepaidBalanceSchema = z.object({
  balance: z.string(),
  available: z.string(),
  in_flight: z.string(),
  low_balance: z.boolean(),
});

/**
 * Forma vieja (cuenta corriente postpaga), por compatibilidad mientras el
 * backend desplegado todavia pueda ser el anterior al cambio incompatible de
 * `GET /corporate/companies/{companyId}/balance`.
 */
const postpaidBalanceSchema = z.object({
  unpaid_statements_amount: z.string(),
  unbilled_current_month_amount: z.string(),
  credit_amount: z.string(),
  outstanding_amount: z.string(),
});

// Todos los campos de ambas formas son opcionales a nivel de schema: el
// backend desplegado puede mandar la forma nueva, la vieja, o (en un fallo de
// contrato) ninguna de las dos, y la pantalla elige que mostrar sin tirar.
const companyBalanceSchema = z.object({
  company_id: z.string().uuid(),
  currency: z.string(),
  balance: prepaidBalanceSchema.shape.balance.optional(),
  available: prepaidBalanceSchema.shape.available.optional(),
  in_flight: prepaidBalanceSchema.shape.in_flight.optional(),
  low_balance: prepaidBalanceSchema.shape.low_balance.optional(),
  unpaid_statements_amount: postpaidBalanceSchema.shape.unpaid_statements_amount.optional(),
  unbilled_current_month_amount: postpaidBalanceSchema.shape.unbilled_current_month_amount.optional(),
  credit_amount: postpaidBalanceSchema.shape.credit_amount.optional(),
  outstanding_amount: postpaidBalanceSchema.shape.outstanding_amount.optional(),
});

export type CompanyBalance = z.infer<typeof companyBalanceSchema>;
export type PrepaidCompanyBalance = CompanyBalance & z.infer<typeof prepaidBalanceSchema>;
export type PostpaidCompanyBalance = CompanyBalance & z.infer<typeof postpaidBalanceSchema>;

export function isPrepaidBalance(balance: CompanyBalance): balance is PrepaidCompanyBalance {
  return balance.available !== undefined;
}

export function isPostpaidBalance(balance: CompanyBalance): balance is PostpaidCompanyBalance {
  return balance.unpaid_statements_amount !== undefined;
}

export async function getCompanyBalance(companyId: string, signal?: AbortSignal) {
  const response = await adminApi.get(`/corporate/companies/${companyId}/balance`, { signal });
  return companyBalanceSchema.parse(response.data.data);
}
