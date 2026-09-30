import { z } from 'zod';
import { adminApi } from '../api/adminApi';

// El estado de facturacion lo calcula el backend (no es una columna): "al dia",
// "con algun resumen vencido pero la empresa sigue activa" o "suspendida por mora".
export const billingStatuses = ['up_to_date', 'overdue', 'suspended_for_debt'] as const;

const companySchema = z.object({
  id: z.string().uuid(),
  legal_name: z.string(),
  trade_name: z.string().nullable(),
  tax_id_type: z.enum(['CUIT', 'RUT']),
  tax_id: z.string(),
  billing_email: z.string().nullable(),
  phone_e164: z.string().nullable(),
  address_text: z.string().nullable(),
  monthly_spend_limit: z.string().nullable(),
  status: z.enum(['active', 'suspended']),
  billing_status: z.enum(billingStatuses),
  created_at: z.string(),
  updated_at: z.string(),
});

const companyListSchema = z.object({
  data: z.object({
    companies: z.array(companySchema),
    page: z.number().int().positive(),
    limit: z.number().int().positive(),
    total: z.number().int().nonnegative(),
  }),
});

const companyCreatedSchema = z.object({
  data: companySchema.extend({ join_code: z.string().min(1) }),
});

export const createCompanyFormSchema = z.object({
  legal_name: z.string().trim().min(2, 'Ingresá al menos 2 caracteres').max(200),
  trade_name: z
    .string()
    .trim()
    .max(200)
    .refine((value) => !value || value.length >= 2, 'Ingresá al menos 2 caracteres'),
  tax_id_type: z.enum(['CUIT', 'RUT']),
  tax_id: z.string().trim().min(7, 'Ingresá un CUIT/RUT válido').max(20),
  billing_email: z
    .string()
    .trim()
    .refine((value) => !value || z.string().email().safeParse(value).success, 'Ingresá un email válido'),
  phone_e164: z
    .string()
    .trim()
    .refine((value) => !value || /^\+[1-9]\d{7,14}$/.test(value), 'Usá formato E.164, por ejemplo +5493511234567'),
  address_text: z
    .string()
    .trim()
    .max(500)
    .refine((value) => !value || value.length >= 3, 'Ingresá al menos 3 caracteres'),
  monthly_spend_limit: z
    .string()
    .trim()
    .refine(
      (value) => !value || (/^\d{1,10}(\.\d{1,2})?$/.test(value) && Number(value) > 0),
      'Ingresá un importe positivo con hasta 2 decimales',
    ),
});

// El limite se edita solo, aparte del alta: a diferencia de `createCompanyFormSchema`
// (donde es opcional), aca siempre viaja un valor porque es el unico campo del modal.
export const editMonthlySpendLimitFormSchema = z.object({
  monthly_spend_limit: z
    .string()
    .trim()
    .regex(/^\d{1,10}(\.\d{1,2})?$/, 'Ingresá un importe positivo con hasta 2 decimales')
    .refine((value) => Number(value) > 0, 'Ingresá un importe positivo con hasta 2 decimales'),
});

export type Company = z.infer<typeof companySchema>;
export type CompanyFormValues = z.infer<typeof createCompanyFormSchema>;
export type BillingStatus = (typeof billingStatuses)[number];
export type EditMonthlySpendLimitFormValues = z.infer<typeof editMonthlySpendLimitFormSchema>;

export async function getCompanies(filters: { page: number; search: string; status: string }, signal?: AbortSignal) {
  const response = await adminApi.get('/corporate/companies', {
    signal,
    params: {
      page: filters.page,
      limit: 20,
      ...(filters.search.length >= 2 ? { search: filters.search } : {}),
      ...(filters.status !== 'all' ? { status: filters.status } : {}),
    },
  });
  return companyListSchema.parse(response.data).data;
}

export async function createCompany(values: CompanyFormValues) {
  const payload = Object.fromEntries(Object.entries(values).filter(([, value]) => value !== ''));
  const response = await adminApi.post('/corporate/companies', payload);
  return companyCreatedSchema.parse(response.data).data;
}

// No existe un GET por id: el detalle se arma en el cliente a partir de lo que
// ya se cargo en el listado (ver CompanyDetailScreen). Esta accion solo cubre
// la edicion del tope mensual, que si tiene su propio endpoint.
export async function updateCompanyMonthlySpendLimit(companyId: string, values: EditMonthlySpendLimitFormValues) {
  const response = await adminApi.patch(`/corporate/companies/${companyId}`, values);
  return companySchema.parse(response.data.data);
}
