import { z } from 'zod';
import { adminApi } from '../api/adminApi';

export const corporateRoles = ['manager', 'employee'] as const;
export const corporateMemberStatuses = ['active', 'revoked'] as const;

const corporateMemberSchema = z.object({
  id: z.string().uuid(),
  company_id: z.string().uuid(),
  profile_id: z.string().uuid(),
  default_cost_center_id: z.string().uuid().nullable(),
  corporate_role: z.enum(corporateRoles),
  monthly_spend_limit: z.string().nullable(),
  status: z.enum(corporateMemberStatuses),
  revoked_at: z.string().nullable(),
  // `null` si el backend no llego a cargarlos en el lote, o si todavia no
  // manda estos campos (backend feature/rediseño-coorporativo, a16c8cb): con
  // default para que la tabla siga funcionando y caiga al id de perfil.
  first_name: z.string().nullable().default(null),
  last_name: z.string().nullable().default(null),
  email: z.string().nullable().default(null),
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
