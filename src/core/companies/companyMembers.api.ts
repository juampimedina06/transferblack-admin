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

// Replica `updateCorporateUserSchema` del backend: los tres campos viajan
// siempre juntos (no es un PATCH parcial desde el formulario), con cadena
// vacia como "sin centro de costo" / "sin tope propio" que se traduce a
// `null` recien al armar el payload.
export const editMemberFormSchema = z.object({
  corporate_role: z.enum(corporateRoles),
  default_cost_center_id: z.string(),
  monthly_spend_limit: z
    .string()
    .trim()
    .refine(
      (value) => !value || (/^\d{1,10}(\.\d{1,2})?$/.test(value) && Number(value) > 0),
      'Ingresá un importe positivo con hasta 2 decimales',
    ),
});

export const editMemberFormFields = Object.keys(editMemberFormSchema.shape) as Array<
  keyof z.infer<typeof editMemberFormSchema>
>;

export type EditMemberFormValues = z.infer<typeof editMemberFormSchema>;

export async function updateMember(companyId: string, profileId: string, values: EditMemberFormValues) {
  const response = await adminApi.patch(`/corporate/companies/${companyId}/members/${profileId}`, {
    corporate_role: values.corporate_role,
    default_cost_center_id: values.default_cost_center_id ? values.default_cost_center_id : null,
    monthly_spend_limit: values.monthly_spend_limit ? values.monthly_spend_limit : null,
  });
  return corporateMemberSchema.parse(response.data.data);
}

// El DELETE no borra la fila: revoca la membresia (`status: 'revoked'`, ver
// `CorporateMembershipService.unlinkMember` del backend). El empleado puede
// volver a vincularse mas adelante con el codigo de acceso de la empresa.
export async function revokeMember(companyId: string, profileId: string) {
  await adminApi.delete(`/corporate/companies/${companyId}/members/${profileId}`);
}
