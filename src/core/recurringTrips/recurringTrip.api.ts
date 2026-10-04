import { adminApi } from '../api/adminApi';
import {
  recurringScheduleListResponseSchema,
  recurringScheduleDetailSchema,
  recurringBillingCycleSchema,
  recurringScheduleSchema,
  type CreateRecurringScheduleFormValues,
  type RecurringSchedule,
  type RecurringScheduleDetail,
  type RecurringScheduleListResponse,
  type RecurringTripPoint,
  type RecurringTripStatus,
  type RecurringBillingCycleDto,
} from './recurringTrip.interface';
import { extractErrorCode, toArgentineIso } from '../scheduledTrips/shared';

export interface GetRecurringTripsParams {
  status?: RecurringTripStatus;
  page?: number;
  limit?: number;
}

export async function getRecurringTrips(
  params?: GetRecurringTripsParams,
  signal?: AbortSignal,
): Promise<RecurringScheduleListResponse> {
  const { data } = await adminApi.get('/admin/recurring-trips', {
    params,
    signal,
  });
  return recurringScheduleListResponseSchema.parse(data);
}

export async function getRecurringTripById(
  id: string,
  signal?: AbortSignal,
): Promise<RecurringScheduleDetail> {
  const { data } = await adminApi.get(`/admin/recurring-trips/${id}`, { signal });
  return recurringScheduleDetailSchema.parse(data.data);
}

export interface CreateRecurringTripInput extends CreateRecurringScheduleFormValues {
  origin: RecurringTripPoint;
  destination: RecurringTripPoint;
  service_type_id?: string;
}

export async function createRecurringTrip(
  values: CreateRecurringTripInput,
): Promise<{ schedule: RecurringSchedule; billingCycle?: RecurringBillingCycleDto; checkoutUrl?: string | null }> {
  const timeFormatted = values.time_of_day.length === 5 ? `${values.time_of_day}:00` : values.time_of_day;
  const validFromIso = toArgentineIso(values.valid_from_date, values.time_of_day.slice(0, 5));
  const validUntilIso = values.valid_until_date
    ? toArgentineIso(values.valid_until_date, '23:59')
    : undefined;

  const payload: Record<string, unknown> = {
    passenger_email: values.passenger_email,
    origin: values.origin,
    destination: values.destination,
    days_of_week: values.days_of_week,
    time_of_day: timeFormatted,
    unit_fare: values.unit_fare,
    currency: 'ARS',
    platform_fee_percent: '10.00',
    billing_cycle: values.billing_cycle,
    valid_from: validFromIso,
    ...(validUntilIso ? { valid_until: validUntilIso } : {}),
    ...(values.reserved_driver_id ? { reserved_driver_id: values.reserved_driver_id } : {}),
    ...(values.notes ? { notes: values.notes } : {}),
  };

  if (values.service_type_id) {
    payload.service_type_id = values.service_type_id;
  }

  const { data } = await adminApi.post('/admin/recurring-trips', payload);
  return {
    schedule: recurringScheduleSchema.parse(data.data.schedule ?? data.data),
    billingCycle: data.data.billing_cycle || data.data.billingCycle
      ? recurringBillingCycleSchema.parse(data.data.billing_cycle || data.data.billingCycle)
      : undefined,
    checkoutUrl: data.data.checkout_url || data.data.checkoutUrl || null,
  };
}

export interface UpdateRecurringTripPayload {
  status?: RecurringTripStatus;
  reserved_driver_id?: string | null;
  notes?: string | null;
}

export async function updateRecurringTrip(
  id: string,
  payload: UpdateRecurringTripPayload,
): Promise<RecurringSchedule> {
  const { data } = await adminApi.patch(`/admin/recurring-trips/${id}`, payload);
  return recurringScheduleSchema.parse(data.data);
}

export async function renewRecurringTripCycle(
  id: string,
): Promise<RecurringBillingCycleDto> {
  const { data } = await adminApi.post(`/admin/recurring-trips/${id}/renew`);
  return recurringBillingCycleSchema.parse(data.data);
}

export function friendlyRecurringTripErrorMessage(error: unknown): string | null {
  const code = extractErrorCode(error);
  switch (code) {
    case 'NO_OCCURRENCES_IN_PERIOD':
      return 'No caen viajes en el primer ciclo según los días de la semana elegidos.';
    case 'CANNOT_RENEW_SCHEDULE':
      return 'No se puede renovar este abono (verificá que esté activo y dentro de la vigencia).';
    case 'RECURRING_SCHEDULE_NOT_FOUND':
      return 'El abono solicitado no fue encontrado.';
    case 'DRIVER_NOT_ELIGIBLE':
      return 'El chofer seleccionado no está disponible o no se encuentra activo.';
    case 'USER_NOT_FOUND':
      return 'No se encontró un usuario con ese email.';
    default:
      return null;
  }
}
