export type DriverAvailabilityStatus = 'online' | 'in_trip' | 'offline';

export interface DriverVehicleInfo {
  plate: string;
  brand: string;
  model: string;
  color: string;
}

export interface DriverLocationProperties {
  driverId: string;
  fullName: string;
  phone: string | null;
  avatarUrl: string | null;
  ratingAverage: number;
  ratingCount: number;
  availabilityStatus: DriverAvailabilityStatus;
  currentTripId: string | null;
  currentTripStatus: string | null;
  lastLocationUpdateAt: string;
  vehicle: DriverVehicleInfo | null;
}

export interface DriverLocationFeature {
  type: 'Feature';
  geometry: {
    type: 'Point';
    coordinates: [number, number]; // [longitude, latitude]
  };
  properties: DriverLocationProperties;
}

export interface FleetGeoJsonResponse {
  type: 'FeatureCollection';
  features: DriverLocationFeature[];
}

export interface LiveMapMetrics {
  onlineDrivers: number;
  inTripDrivers: number;
  activeTrips: number;
  searchingTrips: number;
  offlineDrivers: number;
  waitingMoreThan3Min: number;
}

export interface AssignDriverPayload {
  tripId: string;
  driverId: string;
  vehicleId?: string;
}

export interface AssignDriverResponse {
  tripId: string;
  driverId: string;
  vehicleId: string;
  message: string;
}

export interface ExpandRadiusPayload {
  tripId: string;
  radiusMeters?: number;
}

export interface ExpandRadiusResponse {
  tripId: string;
  round: number;
  radiusMeters: number;
  offersCreated: number;
  message: string;
}
