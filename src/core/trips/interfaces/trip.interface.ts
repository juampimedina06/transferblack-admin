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
  rating?: number;
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

export interface TripFareBreakdown {
  baseAmount?: number;
  distanceAmount?: number;
  durationAmount?: number;
  waitingAmount?: number;
  tollsAmount?: number;
  totalAmount?: number;
  platformCommissionRate?: number;
  platformCommissionAmount?: number;
  driverNetAmount?: number;
}

export interface TripPaymentDetail {
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
  currentDriverLocation?: {
    latitude: number;
    longitude: number;
    addressText?: string;
  } | null;
}
