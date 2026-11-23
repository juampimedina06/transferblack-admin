export const TRIP_STATUSES = [
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

export type TripStatus = (typeof TRIP_STATUSES)[number];

export type TripBookingType = 'immediate' | 'scheduled';

export type TripPaymentMethod = 'account_money' | 'cash' | 'voucher' | 'corporate';

export interface TripThirdParty {
  name: string;
  phone: string;
  email: string | null;
}

export interface TripPassenger {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  totalTrips?: number;
}

export interface TripDriver {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  avatarUrl?: string | null;
  rating?: number | null;
  totalTrips?: number;
}

export interface TripVehicle {
  id: string;
  plate: string;
  brand: string;
  model: string;
  color: string;
  category?: string;
}

export interface TripServiceType {
  id: string;
  name: string;
  description: string | null;
  basePrice?: string;
  pricePerKm?: string;
  pricePerMin?: string;
  currency?: string;
}

export interface TripStopPoint {
  address: string;
  place_id?: string;
  latitude: number;
  longitude: number;
}

export interface TripListItem {
  id: string;
  publicCode: string;
  status: TripStatus;
  bookingType: TripBookingType;
  estimatedFare: string | null;
  finalFare: string | null;
  estimatedDistanceM: number;
  estimatedDurationS: number;
  routeProvider: string;
  currency: string;
  createdAt: string;
  updatedAt: string;
  originAddress: string | null;
  destinationAddress: string | null;
  thirdParty: TripThirdParty | null;
  passenger: TripPassenger;
  driver: TripDriver | null;
  vehicle: TripVehicle | null;
  serviceType: TripServiceType | null;
}

export interface GetTripsFilters {
  page?: number;
  limit?: number;
  dateFrom?: string;
  dateTo?: string;
  status?: TripStatus[];
  driverId?: string;
  passengerId?: string;
  bookingType?: TripBookingType;
  isThirdParty?: boolean;
  isCorporate?: boolean;
  search?: string;
  sortBy?: 'createdAt' | 'dateFrom' | 'status';
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedTripsResponse {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  data: TripListItem[];
}

export interface TripStatusHistoryItem {
  id: string;
  fromStatus: TripStatus | null;
  toStatus: TripStatus;
  actorUserId: string | null;
  actorType: 'passenger' | 'driver' | 'admin' | 'system';
  reasonCode: string | null;
  notes: string | null;
  metadata: Record<string, unknown> | null;
  location: { latitude: number; longitude: number } | null;
  createdAt: string;
}

export interface TripStatusHistoryResponse {
  trip_id: string;
  history: TripStatusHistoryItem[];
}

/** Desglose de la cotizacion elegida (`fare_breakdown` del backend, montos como texto). */
export interface TripFareBreakdown {
  base: string;
  distance: string;
  time: string;
  discount: string;
  fees: string;
  total: string;
  currency: string;
}

export interface TripPaymentDetail {
  type?: string;
  amount?: string;
  approvedAt?: string | null;
  providerPaymentId?: string | null;
  method?: string;
  brand?: string;
  lastFour?: string;
  status?: string;
  preferenceId?: string;
  reservedAmount?: string | number;
  captureTiming?: string;
}

export interface TripDetail {
  id: string;
  publicCode: string;
  status: TripStatus;
  bookingType: TripBookingType;
  serviceType: TripServiceType | null;
  paymentMethod: TripPaymentMethod | null;
  estimatedFare: string | null;
  finalFare: string | null;
  currency: string;
  createdAt: string;
  confirmedAt: string | null;
  assignedAt: string | null;
  driverArrivedAt: string | null;
  startedAt: string | null;
  finishedAt: string | null;
  cancelledAt: string | null;
  cancellationReasonCode: string | null;
  pickup: TripStopPoint | null;
  dropoff: TripStopPoint | null;
  driver: TripDriver | null;
  vehicle: TripVehicle | null;
  passenger: TripPassenger | null;
  thirdParty: TripThirdParty | null;
  estimatedDistanceM: number;
  estimatedDurationS: number;
  paymentStatus: string | null;
  payment: TripPaymentDetail | null;
  fareBreakdown: TripFareBreakdown | null;
  routeCoordinates?: [number, number][];
  /** Ruta cotizada (GeoJSON, [lng, lat]); `null` si el backend no la guardo. */
  routeGeometry?: { type: 'MultiLineString'; coordinates: number[][][] } | null;
  /** Paradas intermedias, en orden. */
  stops?: TripStopPoint[];
  /** Ultima posicion conocida del chofer asignado. */
  currentDriverLocation?: {
    latitude: number;
    longitude: number;
    addressText?: string;
    updatedAt?: string;
  } | null;
  /** Comision real del snapshot de la cotizacion; `null` si no se conoce. */
  commission?: { percent: string; platformAmount: string; driverAmount: string } | null;
}
