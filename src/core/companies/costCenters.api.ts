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

// Replica `createCostCenterSchema` del backend (`corporate.dto.ts`): el codigo
// se guarda en mayusculas alla, asi que se valida el mismo patron aca para no
// depender solo del VALIDATION_ERROR generico.
const spendLimitField = z
  .string()
  .trim()
  .refine(
    (value) => !value || (/^\d{1,10}(\.\d{1,2})?$/.test(value) && Number(value) > 0),
    'Ingresá un importe positivo con hasta 2 decimales',
  );

export const createCostCenterFormSchema = z.object({
  code: z
    .string()
    .trim()
    .min(1, 'Ingresá un código')
    .max(50)
    .regex(/^[A-Za-z0-9._-]+$/, 'El código solo admite letras, números, punto, guion y guion bajo'),
  name: z.string().trim().min(2, 'Ingresá al menos 2 caracteres').max(150),
  monthly_spend_limit: spendLimitField,
});

export const createCostCenterFormFields = Object.keys(createCostCenterFormSchema.shape) as Array<
  keyof z.infer<typeof createCostCenterFormSchema>
>;

export type CreateCostCenterFormValues = z.infer<typeof createCostCenterFormSchema>;

export const editCostCenterFormSchema = z.object({
  name: z.string().trim().min(2, 'Ingresá al menos 2 caracteres').max(150),
  monthly_spend_limit: spendLimitField,
  status: z.enum(costCenterStatuses),
});

export const editCostCenterFormFields = Object.keys(editCostCenterFormSchema.shape) as Array<
  keyof z.infer<typeof editCostCenterFormSchema>
>;

export type EditCostCenterFormValues = z.infer<typeof editCostCenterFormSchema>;

export async function createCostCenter(companyId: string, values: CreateCostCenterFormValues) {
  const response = await adminApi.post('/corporate/cost-centers', {
    company_id: companyId,
    code: values.code,
    name: values.name,
    ...(values.monthly_spend_limit ? { monthly_spend_limit: values.monthly_spend_limit } : {}),
  });
  return costCenterSchema.parse(response.data.data);
}

export async function updateCostCenter(costCenterId: string, values: EditCostCenterFormValues) {
  const response = await adminApi.patch(`/corporate/cost-centers/${costCenterId}`, {
    name: values.name,
    monthly_spend_limit: values.monthly_spend_limit ? values.monthly_spend_limit : null,
    status: values.status,
  });
  return costCenterSchema.parse(response.data.data);
}
