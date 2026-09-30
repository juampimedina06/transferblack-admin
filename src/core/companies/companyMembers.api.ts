import { z } from 'zod';
import { adminApi } from '../api/adminApi';

export const corporateRoles = ['manager', 'employee'] as const;
export const corporateMemberStatuses = ['active', 'revoked'] as const;

// La API no devuelve nombre ni email del empleado en este listado: solo
// `profile_id`. Mostrarlo requeriria un endpoint de perfiles que hoy no
// existe (ver README/reporte de la tarea).
const corporateMemberSchema = z.object({
  id: z.string().uuid(),
  company_id: z.string().uuid(),
  profile_id: z.string().uuid(),
  default_cost_center_id: z.string().uuid().nullable(),
  corporate_role: z.enum(corporateRoles),
  monthly_spend_limit: z.string().nullable(),
  status: z.enum(corporateMemberStatuses),
  revoked_at: z.string().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
});

const corporateMembersListSchema = z.object({
  members: z.array(corporateMemberSchema),
});

export type CorporateMember = z.infer<typeof corporateMemberSchema>;

export async function getCompanyMembers(companyId: string, signal?: AbortSignal) {
  const response = await adminApi.get(`/corporate/companies/${companyId}/members`, { signal });
  return corporateMembersListSchema.parse(response.data.data).members;
}
