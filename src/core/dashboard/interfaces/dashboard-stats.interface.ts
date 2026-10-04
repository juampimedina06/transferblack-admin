import { z } from 'zod';

export const CategoriaDesgloseSchema = z.object({
  id: z.string(),
  name: z.string(),
  totalViajes: z.number().int().min(0).catch(0),
  porcentaje: z.number().catch(0),
  ticketMedio: z.number().catch(0),
  facturacion: z.number().catch(0),
});

export type CategoriaDesglose = z.infer<typeof CategoriaDesgloseSchema>;

export const SerieTemporalItemSchema = z.object({
  label: z.string(),
  completados: z.number().int().min(0).catch(0),
  cancelados: z.number().int().min(0).catch(0),
  total: z.number().int().min(0).optional(),
});

export type SerieTemporalItem = z.infer<typeof SerieTemporalItemSchema>;

export const TipoViajeDesgloseSchema = z.object({
  tipo: z.enum(['immediate', 'scheduled']).catch('immediate'),
  label: z.string(),
  totalViajes: z.number().int().min(0).catch(0),
  porcentaje: z.number().catch(0),
  ticketMedio: z.number().catch(0),
  facturacion: z.number().catch(0),
});

export type TipoViajeDesglose = z.infer<typeof TipoViajeDesgloseSchema>;

export const DashboardStatsSchema = z.object({
  totalViajes: z.number().int().min(0).catch(0),
  facturacionBruta: z.number().catch(0),
  comisionNeta: z.number().catch(0),
  ratioCancelaciones: z.number().min(0).max(1).catch(0),
  porCategoria: z.array(CategoriaDesgloseSchema).optional().default([]),
  porTipoReserva: z.array(TipoViajeDesgloseSchema).optional().default([]),
  series: z.array(SerieTemporalItemSchema).optional().default([]),
});

export type DashboardStats = z.infer<typeof DashboardStatsSchema>;

export type PeriodoDashboard = 'day' | 'month' | 'year';

export interface DashboardStatsParams {
  periodo: PeriodoDashboard;
  fecha?: string; // ISO date-time string
}
