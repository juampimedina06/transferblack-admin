import { z } from 'zod';
import { adminApi } from '../api/adminApi';

export const costCenterStatuses = ['active', 'archived'] as const;

const costCenterSchema = z.object({
  id: z.string().uuid(),
  company_id: z.string().uuid(),
  code: z.string(),
  name: z.string(),
  monthly_spend_limit: z.string().nullable(),
  status: z.enum(costCenterStatuses),
  created_at: z.string(),
  updated_at: z.string(),
});

const costCentersListSchema = z.object({
  cost_centers: z.array(costCenterSchema),
});

export type CostCenter = z.infer<typeof costCenterSchema>;

export async function getCompanyCostCenters(companyId: string, signal?: AbortSignal) {
  const response = await adminApi.get('/corporate/cost-centers', {
    signal,
    params: { company_id: companyId },
  });
  return costCentersListSchema.parse(response.data.data).cost_centers;
}
