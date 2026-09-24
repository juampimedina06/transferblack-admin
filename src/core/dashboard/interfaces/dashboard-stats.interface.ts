import { z } from 'zod';

export const DashboardStatsSchema = z.object({
  totalViajes: z.number().int().min(0).catch(0),
  facturacionBruta: z.number().catch(0),
  comisionNeta: z.number().catch(0),
  ratioCancelaciones: z.number().min(0).max(1).catch(0),
});

export type DashboardStats = z.infer<typeof DashboardStatsSchema>;

export type PeriodoDashboard = 'day' | 'month' | 'year';

export interface DashboardStatsParams {
  periodo: PeriodoDashboard;
  fecha?: string; // ISO date-time string
}
