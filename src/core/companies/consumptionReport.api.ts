import { z } from 'zod';
import { adminApi } from '../api/adminApi';

const consumptionItemSchema = z.object({
  trip_id: z.string().uuid(),
  public_code: z.string(),
  finished_at: z.string(),
  employee_id: z.string().uuid(),
  employee_name: z.string(),
  employee_email: z.string(),
  cost_center_id: z.string().uuid(),
  cost_center_code: z.string(),
  cost_center_name: z.string(),
  fare: z.string(),
  fees: z.string(),
  total: z.string(),
});

const consumptionSummarySchema = z.object({
  cost_center_id: z.string().uuid(),
  cost_center_code: z.string(),
  cost_center_name: z.string(),
  subtotal_fare: z.string(),
  subtotal_fees: z.string(),
  subtotal_total: z.string(),
  trip_count: z.number(),
});

// Penalidad de cancelacion facturada a la empresa: no es consumo de un viaje
// (backend `corporate-report.dto.ts`), por eso llega en su propia lista.
const cancellationPenaltySchema = z.object({
  trip_id: z.string().uuid(),
  public_code: z.string(),
  cancelled_at: z.string(),
  company_charge_amount: z.string(),
  currency: z.string(),
});

const consumptionReportSchema = z.object({
  items: z.array(consumptionItemSchema),
  summary: z.array(consumptionSummarySchema),
  cancellation_penalties: z.array(cancellationPenaltySchema),
  cancellation_penalties_total: z.string(),
});

export type ConsumptionReportItem = z.infer<typeof consumptionItemSchema>;
export type ConsumptionReportSummary = z.infer<typeof consumptionSummarySchema>;
export type ConsumptionReportCancellationPenalty = z.infer<typeof cancellationPenaltySchema>;
export type ConsumptionReport = z.infer<typeof consumptionReportSchema>;

export interface ConsumptionReportFilters {
  companyId: string;
  startDate: string;
  endDate: string;
  costCenterId?: string | undefined;
  employeeId?: string | undefined;
}

export async function getConsumptionReport(filters: ConsumptionReportFilters, signal?: AbortSignal) {
  const response = await adminApi.get('/corporate/reports/consumption', {
    signal,
    params: {
      company_id: filters.companyId,
      start_date: filters.startDate,
      end_date: filters.endDate,
      ...(filters.costCenterId ? { cost_center_id: filters.costCenterId } : {}),
      ...(filters.employeeId ? { employee_id: filters.employeeId } : {}),
    },
  });
  return consumptionReportSchema.parse(response.data.data);
}
