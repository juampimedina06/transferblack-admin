import { z } from 'zod';

export const RECURRING_TRIP_STATUSES = ['active', 'paused', 'cancelled'] as const;
export type RecurringTripStatus = (typeof RECURRING_TRIP_STATUSES)[number];

export const RECURRING_BILLING_CYCLES = ['weekly', 'monthly'] as const;
export type RecurringBillingCycle = (typeof RECURRING_BILLING_CYCLES)[number];

export const RECURRING_CYCLE_STATUSES = [
  'pending_payment',
  'paid',
  'expired',
  'cancelled',
] as const;
export type RecurringCycleStatus = (typeof RECURRING_CYCLE_STATUSES)[number];

export const DAYS_OF_WEEK_OPTIONS = [
  { value: 1, label: 'Lunes', shortLabel: 'Lun' },
  { value: 2, label: 'Martes', shortLabel: 'Mar' },
  { value: 3, label: 'Miércoles', shortLabel: 'Mié' },
  { value: 4, label: 'Jueves', shortLabel: 'Jue' },
  { value: 5, label: 'Viernes', shortLabel: 'Vie' },
  { value: 6, label: 'Sábado', shortLabel: 'Sáb' },
  { value: 7, label: 'Domingo', shortLabel: 'Dom' },
] as const;

export const pointSchema = z.object({
  address: z.string().min(1, 'La dirección es obligatoria'),
  lat: z.number(),
  lng: z.number(),
  place_id: z.string().nullable().optional(),
});

export type RecurringTripPoint = z.infer<typeof pointSchema>;

export const personSchema = z.object({
  id: z.string(),
  email: z.string(),
  first_name: z.string(),
  last_name: z.string(),
  phone: z.string().nullable().optional(),
});

export type RecurringTripPerson = z.infer<typeof personSchema>;

export const reservedDriverVehicleSchema = z.object({
  plate: z.string(),
  brand: z.string(),
  model: z.string(),
  color: z.string(),
});

export const reservedDriverSchema = z
  .object({
    id: z.string(),
    first_name: z.string(),
    last_name: z.string(),
    phone: z.string().nullable().optional(),
    vehicle: reservedDriverVehicleSchema.nullable().optional(),
  })
  .nullable();

export type RecurringTripReservedDriver = z.infer<typeof reservedDriverSchema>;

export const recurringBillingCycleSchema = z.object({
  id: z.string(),
  schedule_id: z.string().optional(),
  scheduleId: z.string().optional(),
  cycle_number: z.number().int().optional(),
  cycleNumber: z.number().int().optional(),
  period_start: z.string().optional(),
  periodStart: z.string().optional(),
  period_end: z.string().optional(),
  periodEnd: z.string().optional(),
  trips_count: z.number().int().default(0),
  tripsCount: z.number().int().optional(),
  total_amount: z.string().optional(),
  totalAmount: z.string().optional(),
  currency: z.string().default('ARS'),
  status: z.enum(RECURRING_CYCLE_STATUSES).catch('pending_payment'),
  checkout_url: z.string().nullable().optional(),
  checkoutUrl: z.string().nullable().optional(),
  provider_payment_id: z.string().nullable().optional(),
  providerPaymentId: z.string().nullable().optional(),
  paid_at: z.string().nullable().optional(),
  paidAt: z.string().nullable().optional(),
  created_at: z.string().optional(),
  createdAt: z.string().optional(),
});

export type RecurringBillingCycleDto = z.infer<typeof recurringBillingCycleSchema>;

export const recurringTripItemSchema = z.object({
  id: z.string(),
  public_code: z.string().optional(),
  publicCode: z.string().optional(),
  status: z.string(),
  scheduled_at: z.string().optional(),
  scheduledAt: z.string().optional(),
  estimated_fare: z.string().optional(),
  estimatedFare: z.string().optional(),
  driver_id: z.string().nullable().optional(),
  driverId: z.string().nullable().optional(),
  origin_address: z.string().optional(),
  originAddress: z.string().optional(),
  destination_address: z.string().optional(),
  destinationAddress: z.string().optional(),
});

export type RecurringTripItem = z.infer<typeof recurringTripItemSchema>;

export const recurringScheduleSchema = z.object({
  id: z.string(),
  requested_by_user_id: z.string().optional(),
  requestedByUserId: z.string().optional(),
  passenger_user_id: z.string().nullable().optional(),
  passengerUserId: z.string().nullable().optional(),
  passenger: personSchema.nullable().optional(),
  reserved_driver_id: z.string().nullable().optional(),
  reservedDriverId: z.string().nullable().optional(),
  reserved_driver: reservedDriverSchema.optional(),
  reservedDriver: reservedDriverSchema.optional(),
  service_type_id: z.string().optional(),
  serviceTypeId: z.string().optional(),
  origin_address: z.string().optional(),
  originAddress: z.string().optional(),
  origin_latitude: z.coerce.number().optional(),
  originLatitude: z.coerce.number().optional(),
  origin_longitude: z.coerce.number().optional(),
  originLongitude: z.coerce.number().optional(),
  destination_address: z.string().optional(),
  destinationAddress: z.string().optional(),
  destination_latitude: z.coerce.number().optional(),
  destinationLatitude: z.coerce.number().optional(),
  destination_longitude: z.coerce.number().optional(),
  destinationLongitude: z.coerce.number().optional(),
  days_of_week: z.array(z.number().int()).default([]),
  daysOfWeek: z.array(z.number().int()).optional(),
  time_of_day: z.string().optional(),
  timeOfDay: z.string().optional(),
  unit_fare: z.string().optional(),
  unitFare: z.string().optional(),
  currency: z.string().default('ARS'),
  platform_fee_percent: z.string().default('10.00'),
  platformFeePercent: z.string().optional(),
  billing_cycle: z.enum(RECURRING_BILLING_CYCLES).catch('weekly'),
  billingCycle: z.enum(RECURRING_BILLING_CYCLES).optional(),
  status: z.enum(RECURRING_TRIP_STATUSES).catch('active'),
  notes: z.string().nullable().optional(),
  valid_from: z.string().optional(),
  validFrom: z.string().optional(),
  valid_until: z.string().nullable().optional(),
  validUntil: z.string().nullable().optional(),
  created_at: z.string().optional(),
  createdAt: z.string().optional(),
  updated_at: z.string().optional(),
  updatedAt: z.string().optional(),
});

export type RecurringSchedule = z.infer<typeof recurringScheduleSchema>;

export const recurringScheduleDetailSchema = z.object({
  schedule: recurringScheduleSchema,
  active_cycle: recurringBillingCycleSchema.nullable().optional(),
  activeCycle: recurringBillingCycleSchema.nullable().optional(),
  cycles: z.array(recurringBillingCycleSchema).optional().default([]),
  trips: z.array(recurringTripItemSchema).optional().default([]),
  trips_count: z.number().int().optional(),
  tripsCount: z.number().int().optional(),
});

export type RecurringScheduleDetail = z.infer<typeof recurringScheduleDetailSchema>;

export const paginationSchema = z.object({
  page: z.number().int(),
  limit: z.number().int(),
  total: z.number().int(),
  total_pages: z.number().int(),
});

export type RecurringTripPagination = z.infer<typeof paginationSchema>;

export const recurringScheduleListResponseSchema = z.object({
  data: z.array(recurringScheduleSchema),
  pagination: paginationSchema,
});

export type RecurringScheduleListResponse = z.infer<typeof recurringScheduleListResponseSchema>;

// Formularios
export const createRecurringScheduleFormSchema = z.object({
  passenger_email: z.string().trim().email('Email de pasajero inválido'),
  days_of_week: z.array(z.number().int().min(1).max(7)).min(1, 'Seleccioná al menos un día de la semana'),
  time_of_day: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/, 'Formato de hora inválido (HH:mm)'),
  unit_fare: z.string().trim().regex(/^\d+(\.\d{1,2})?$/, 'Tarifa inválida (ej. 5000.00)').refine(val => Number(val) > 0, 'La tarifa debe ser mayor a 0'),
  billing_cycle: z.enum(RECURRING_BILLING_CYCLES),
  valid_from_date: z.string().min(1, 'Fecha de inicio obligatoria'),
  valid_until_date: z.string().optional(),
  reserved_driver_id: z.string().uuid().optional(),
  notes: z.string().max(1000).optional(),
});

export type CreateRecurringScheduleFormValues = z.infer<typeof createRecurringScheduleFormSchema>;
