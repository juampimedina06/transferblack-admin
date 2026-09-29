import { z } from 'zod';

// Mismos estados que `TripStatus` en el backend (modules/trips/models/trip.model.ts).
export const TRIP_TRACKING_STATUSES = [
  'draft',
  'scheduled',
  'searching',
  'assigned',
  'driver_arriving',
  'driver_arrived',
  'in_progress',
  'completed',
  'cancelled',
] as const;

export type TripTrackingStatus = (typeof TRIP_TRACKING_STATUSES)[number];

const TRIP_TRACKING_TERMINAL_STATUSES: readonly TripTrackingStatus[] = ['completed', 'cancelled'];

export function isTripTrackingTerminalStatus(status: TripTrackingStatus): boolean {
  return TRIP_TRACKING_TERMINAL_STATUSES.includes(status);
}

// --- Contrato del backend (snake_case), `GET /rides/track/{token}` ---

const trackingPointApiSchema = z
  .object({
    address_text: z.string(),
    latitude: z.number(),
    longitude: z.number(),
  })
  .nullable();

const driverApiSchema = z
  .object({
    first_name: z.string(),
    rating_average: z.number(),
  })
  .nullable();

const vehicleApiSchema = z
  .object({
    plate: z.string(),
    brand: z.string(),
    model: z.string(),
    color: z.string(),
  })
  .nullable();

const driverLocationApiSchema = z
  .object({
    latitude: z.number(),
    longitude: z.number(),
    updated_at: z.string(),
  })
  .nullable();

// PostGIS entrega [longitud, latitud] por punto, agrupados en tramos.
const routeApiSchema = z
  .object({
    type: z.literal('MultiLineString'),
    coordinates: z.array(z.array(z.tuple([z.number(), z.number()]))),
  })
  .nullable();

export const tripTrackingApiSchema = z.object({
  public_code: z.string(),
  status: z.enum(TRIP_TRACKING_STATUSES),
  passenger_name: z.string().nullable(),
  driver: driverApiSchema,
  vehicle: vehicleApiSchema,
  origin: trackingPointApiSchema,
  destination: trackingPointApiSchema,
  driver_location: driverLocationApiSchema,
  route: routeApiSchema,
  confirmed_at: z.string().nullable(),
  assigned_at: z.string().nullable(),
  driver_arrived_at: z.string().nullable(),
  started_at: z.string().nullable(),
  finished_at: z.string().nullable(),
  cancelled_at: z.string().nullable(),
});

export const tripTrackingResponseApiSchema = z.object({
  data: tripTrackingApiSchema,
});

export type TripTrackingApiDto = z.infer<typeof tripTrackingApiSchema>;

export interface TripTrackingApiErrorResponse {
  error?: {
    message: string;
    code?: string;
    details?: unknown;
  };
}

// --- Modelo de dominio (camelCase), el que consume la UI ---

export interface TripTrackingDriver {
  firstName: string;
  ratingAverage: number;
}

export interface TripTrackingVehicle {
  plate: string;
  brand: string;
  model: string;
  color: string;
}

export interface TripTrackingPoint {
  addressText: string;
  latitude: number;
  longitude: number;
}

export interface TripTrackingDriverLocation {
  latitude: number;
  longitude: number;
  updatedAt: string;
}

export interface TripTrackingRoute {
  type: 'MultiLineString';
  coordinates: number[][][];
}

export interface TripTracking {
  publicCode: string;
  status: TripTrackingStatus;
  passengerName: string | null;
  driver: TripTrackingDriver | null;
  vehicle: TripTrackingVehicle | null;
  origin: TripTrackingPoint | null;
  destination: TripTrackingPoint | null;
  driverLocation: TripTrackingDriverLocation | null;
  route: TripTrackingRoute | null;
  confirmedAt: string | null;
  assignedAt: string | null;
  driverArrivedAt: string | null;
  startedAt: string | null;
  finishedAt: string | null;
  cancelledAt: string | null;
}

export function mapTripTracking(dto: TripTrackingApiDto): TripTracking {
  return {
    publicCode: dto.public_code,
    status: dto.status,
    passengerName: dto.passenger_name,
    driver: dto.driver
      ? { firstName: dto.driver.first_name, ratingAverage: dto.driver.rating_average }
      : null,
    vehicle: dto.vehicle
      ? {
          plate: dto.vehicle.plate,
          brand: dto.vehicle.brand,
          model: dto.vehicle.model,
          color: dto.vehicle.color,
        }
      : null,
    origin: dto.origin
      ? { addressText: dto.origin.address_text, latitude: dto.origin.latitude, longitude: dto.origin.longitude }
      : null,
    destination: dto.destination
      ? {
          addressText: dto.destination.address_text,
          latitude: dto.destination.latitude,
          longitude: dto.destination.longitude,
        }
      : null,
    driverLocation: dto.driver_location
      ? {
          latitude: dto.driver_location.latitude,
          longitude: dto.driver_location.longitude,
          updatedAt: dto.driver_location.updated_at,
        }
      : null,
    route: dto.route,
    confirmedAt: dto.confirmed_at,
    assignedAt: dto.assigned_at,
    driverArrivedAt: dto.driver_arrived_at,
    startedAt: dto.started_at,
    finishedAt: dto.finished_at,
    cancelledAt: dto.cancelled_at,
  };
}

/** Error de la pagina de seguimiento: nunca se arma con el texto crudo del backend. */
export class TripTrackingError extends Error {
  status?: number;
  code?: string;

  constructor(message: string, status?: number, code?: string) {
    super(message);
    this.name = 'TripTrackingError';
    this.status = status;
    this.code = code;
  }
}
