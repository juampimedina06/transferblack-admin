import { z } from 'zod';
import { adminApi } from '../api/adminApi';

const companyBalanceSchema = z.object({
  company_id: z.string().uuid(),
  currency: z.string(),
  // Suma de lo pendiente en resumenes que todavia no llegaron a "pagado".
  unpaid_statements_amount: z.string(),
  // Consumo del mes calendario en curso, todavia sin resumen emitido.
  unbilled_current_month_amount: z.string(),
  // Saldo a favor de la empresa (pago de mas a un resumen anterior).
  credit_amount: z.string(),
  outstanding_amount: z.string(),
});

export type CompanyBalance = z.infer<typeof companyBalanceSchema>;

export async function getCompanyBalance(companyId: string, signal?: AbortSignal) {
  const response = await adminApi.get(`/corporate/companies/${companyId}/balance`, { signal });
  return companyBalanceSchema.parse(response.data.data);
}
