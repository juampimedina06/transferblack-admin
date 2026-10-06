import { z } from 'zod';
import { adminApi } from '../api/adminApi';
import {
  extractErrorCode,
  extractErrorDetails,
  moneyAmount,
  SCHEDULED_TRIP_DEFAULT_MIN_LEAD_MINUTES,
  toArgentineIso,
} from './shared';

/**
 * Viajes reservados: la agencia los arma por un pasajero (via WhatsApp) y
 * los cobra por adelantado. `POST /admin/scheduled-trips` y compania
 * (`scheduled-trip.routes.ts` del backend, rama `feature/viajes-reservados`).
 * El backend no expone `GET /admin/scheduled-trips/:id`: el detalle siempre
 * viene del listado ya cargado, no de un fetch aparte.
 */

// El backend no devuelve `draft` en este listado (`SCHEDULED_TRIP_LIST_STATUSES`).
export const scheduledTripStatuses = [
  'scheduled',
  'searching',
  'assigned',
  'driver_arriving',
  'driver_arrived',
  'in_progress',
  'completed',
  'cancelled',
] as const;
export type ScheduledTripStatus = (typeof scheduledTripStatuses)[number];

const pointSchema = z.object({
  address: z.string(),
  lat: z.number(),
  lng: z.number(),
});

const personSchema = z.object({
  id: z.string(),
  email: z.string(),
  first_name: z.string(),
  last_name: z.string(),
  phone: z.string().nullable(),
});

const reservedDriverVehicleSchema = z.object({
  plate: z.string(),
  brand: z.string(),
  model: z.string(),
  color: z.string(),
});

const reservedDriverSchema = z
  .object({
    id: z.string(),
    first_name: z.string(),
    last_name: z.string(),
    phone: z.string().nullable(),
    vehicle: reservedDriverVehicleSchema.nullable(),
  })
  .nullable();

const scheduledTripSchema = z.object({
  id: z.string().uuid(),
  public_code: z.string(),
  status: z.enum(scheduledTripStatuses),
  scheduled_at: z.string(),
  agreed_fare: z.string(),
  currency: z.string(),
  prepaid_at: z.string().nullable(),
  notes: z.string().nullable(),
  origin: pointSchema,
  destination: pointSchema,
  passenger: personSchema,
  reserved_driver: reservedDriverSchema,
  driver_id: z.string().nullable(),
  recurring_schedule_id: z.string().uuid().nullable().optional(),
  recurring_billing_cycle_id: z.string().uuid().nullable().optional(),
  created_at: z.string(),
  updated_at: z.string(),
});

const paginationSchema = z.object({
  page: z.number(),
  limit: z.number(),
  total: z.number(),
  total_pages: z.number(),
});

const scheduledTripListSchema = z.object({
  data: z.array(scheduledTripSchema),
  pagination: paginationSchema,
});

export type ScheduledTripPoint = z.infer<typeof pointSchema>;
export type ScheduledTrip = z.infer<typeof scheduledTripSchema>;
export type ScheduledTripPagination = z.infer<typeof paginationSchema>;
export type ScheduledTripListResponse = z.infer<typeof scheduledTripListSchema>;

// --- Listado ----------------------------------------------------------------

export interface GetScheduledTripsFilters {
  status?: ScheduledTripStatus;
  from?: string;
  to?: string;
  page?: number;
  limit?: number;
}

export async function getScheduledTrips(
  filters: GetScheduledTripsFilters,
  signal?: AbortSignal,
): Promise<ScheduledTripListResponse> {
  const { data } = await adminApi.get('/admin/scheduled-trips', { params: filters, signal });
  return scheduledTripListSchema.parse(data);
}

// --- Alta ---------------------------------------------------------------------

// Lo elige `AddressAutocompleteField` (autocompletado de Google con detalle
// al elegir, o si el proveedor esta caido, los campos manuales de lat/lng):
// no hay un zod schema para esto porque nunca se tipea a mano, siempre sale
// ya armado del selector.
export interface ScheduledTripPointFormValues {
  address: string;
  lat: number;
  lng: number;
  place_id?: string;
}

// Origen y destino no entran al schema de react-hook-form: son objetos
// (direccion + lat/lng), no inputs sueltos, y se eligen con el autocompletado
// de `AddressAutocompleteField` como estado propio del modal. Se validan a
// mano antes de enviar (`origin`/`destination` requeridos) en vez de forzar
// un tipo `T | null` dentro del resolver de zod.
export const createScheduledTripFormSchema = z
  .object({
    passenger_email: z.string().trim().toLowerCase().email('Ingresá un email válido'),
    scheduled_date: z.string().trim().min(1, 'Elegí la fecha'),
    scheduled_time: z.string().trim().min(1, 'Elegí la hora'),
    agreed_fare: moneyAmount,
    reserved_driver_id: z.string().trim().optional(),
    notes: z.string().trim().max(2000).optional(),
  })
  .refine(
    (values) => {
      if (!values.scheduled_date || !values.scheduled_time) return true;
      const scheduledAtMs = new Date(toArgentineIso(values.scheduled_date, values.scheduled_time)).getTime();
      if (Number.isNaN(scheduledAtMs)) return true;
      return scheduledAtMs - Date.now() >= SCHEDULED_TRIP_DEFAULT_MIN_LEAD_MINUTES * 60_000;
    },
    {
      message: `Elegí un horario con al menos ${SCHEDULED_TRIP_DEFAULT_MIN_LEAD_MINUTES} minutos de anticipación`,
      path: ['scheduled_time'],
    },
  );

export type CreateScheduledTripFormValues = z.infer<typeof createScheduledTripFormSchema>;

export const createScheduledTripFormFields = [
  'passenger_email',
  'scheduled_date',
  'scheduled_time',
  'agreed_fare',
  'reserved_driver_id',
  'notes',
] as const satisfies readonly (keyof CreateScheduledTripFormValues)[];

export interface CreateScheduledTripInput extends CreateScheduledTripFormValues {
  origin: ScheduledTripPointFormValues;
  destination: ScheduledTripPointFormValues;
}

export async function createScheduledTrip(values: CreateScheduledTripInput): Promise<ScheduledTrip> {
  const { data } = await adminApi.post('/admin/scheduled-trips', {
    passenger_email: values.passenger_email,
    origin: values.origin,
    destination: values.destination,
    scheduled_at: toArgentineIso(values.scheduled_date, values.scheduled_time),
    agreed_fare: values.agreed_fare,
    ...(values.reserved_driver_id ? { reserved_driver_id: values.reserved_driver_id } : {}),
    ...(values.notes ? { notes: values.notes } : {}),
  });
  return scheduledTripSchema.parse(data.data);
}

// --- Edicion (solo mientras el viaje sigue `scheduled`) -----------------------

export interface UpdateScheduledTripPayload {
  scheduled_at?: string;
  /** `null` desasigna al chofer reservado; `undefined` no lo toca. */
  reserved_driver_id?: string | null;
  /** `null` borra las notas; `undefined` no las toca. */
  notes?: string | null;
}

export async function updateScheduledTrip(
  tripId: string,
  payload: UpdateScheduledTripPayload,
): Promise<ScheduledTrip> {
  const { data } = await adminApi.patch(`/admin/scheduled-trips/${tripId}`, payload);
  return scheduledTripSchema.parse(data.data);
}

// --- Cancelacion ----------------------------------------------------------------

/**
 * El backend acepta cualquier string de 1 a 50 caracteres (`reason_code`):
 * este catalogo es solo para que el admin elija algo consistente, no una
 * restriccion real del servidor.
 */
export const scheduledTripCancellationReasons = [
  { value: 'passenger_requested', label: 'Lo pidió el pasajero' },
  { value: 'agency_decision', label: 'Decisión de la agencia' },
  { value: 'driver_unavailable', label: 'No hay chofer disponible' },
  { value: 'duplicate_reservation', label: 'Reserva duplicada' },
  { value: 'other', label: 'Otro motivo' },
] as const;

export const cancelScheduledTripFormSchema = z.object({
  reason_code: z.string().trim().min(1, 'Elegí un motivo').max(50),
});
export type CancelScheduledTripFormValues = z.infer<typeof cancelScheduledTripFormSchema>;
export const cancelScheduledTripFormFields = ['reason_code'] as const satisfies readonly (keyof CancelScheduledTripFormValues)[];

export async function cancelScheduledTrip(tripId: string, values: CancelScheduledTripFormValues): Promise<void> {
  await adminApi.post(`/admin/scheduled-trips/${tripId}/cancel`, values);
}

// --- Mensajes de error propios de negocio (409/422/404) ------------------------

/**
 * Copia amigable para los codigos propios de viajes reservados: igual
 * motivo que `friendlyTopUpErrorMessage` de empresas, el mensaje crudo del
 * backend no lleva tildes y no siempre dice que hacer. `null` si el codigo
 * no es uno de estos, para que el llamador siga con `applyServerErrors`.
 */
export function friendlyScheduledTripErrorMessage(error: unknown): string | null {
  const details = extractErrorDetails(error);
  switch (extractErrorCode(error)) {
    case 'PASSENGER_NOT_FOUND':
      return 'No encontramos un pasajero con ese email. Verificalo o pedile que se registre primero.';
    case 'DRIVER_NOT_FOUND':
      return 'Ese chofer no existe. Elegí otro de la lista.';
    case 'DRIVER_NOT_APPROVED':
      return 'Ese chofer todavía no está aprobado. Elegí otro o dejalo sin asignar.';
    case 'DRIVER_WITHOUT_VEHICLE':
      return 'Ese chofer no tiene un vehículo aprobado. Elegí otro o dejalo sin asignar.';
    case 'SCHEDULED_TRIP_LEAD_TIME_TOO_SHORT': {
      const minimum = details?.minimum_lead_minutes;
      return `El viaje tiene que pedirse con al menos ${typeof minimum === 'number' ? minimum : SCHEDULED_TRIP_DEFAULT_MIN_LEAD_MINUTES} minutos de anticipación.`;
    }
    case 'SCHEDULED_TRIP_NOT_FOUND':
      return 'El viaje reservado no existe o ya no está disponible.';
    case 'SCHEDULED_TRIP_NOT_EDITABLE':
      return 'Este viaje ya se activó: solo se puede editar mientras sigue en estado "Programado".';
    case 'SCHEDULED_TRIP_CANNOT_BE_CANCELLED':
      return 'Este viaje ya se activó o está en curso; cancelalo desde el detalle del viaje normal.';
    default:
      return null;
  }
}
