import { adminApi } from '../../api/adminApi';
import type { TripDetail } from '../interfaces/trip.interface';

export const getTripDetail = async (tripId: string): Promise<TripDetail> => {
  const response = await adminApi.get<{ data: any } | any>(`/rides/${tripId}`);
  const raw = response.data?.data || response.data;

  // Normalizar campos con soporte para camelCase y snake_case
  const detail: TripDetail = {
    id: raw.id,
    publicCode: raw.public_code || raw.publicCode || 'TB-0000',
    status: raw.status,
    bookingType: raw.booking_type || raw.bookingType || 'immediate',
    serviceType: raw.service_type || raw.serviceType || null,
    paymentMethod: raw.payment_method || raw.paymentMethod || null,
    estimatedFare: raw.estimated_fare ?? raw.estimatedFare ?? null,
    finalFare: raw.final_fare ?? raw.finalFare ?? null,
    currency: raw.currency || 'ARS',
    createdAt: raw.created_at || raw.createdAt || new Date().toISOString(),
    confirmedAt: raw.confirmed_at || raw.confirmedAt || null,
    assignedAt: raw.assigned_at || raw.assignedAt || null,
    driverArrivedAt: raw.driver_arrived_at || raw.driverArrivedAt || null,
    startedAt: raw.started_at || raw.startedAt || null,
    finishedAt: raw.finished_at || raw.finishedAt || null,
    cancelledAt: raw.cancelled_at || raw.cancelledAt || null,
    cancellationReasonCode: raw.cancellation_reason_code || raw.cancellationReasonCode || null,
    pickup: raw.pickup
      ? {
          address: raw.pickup.address || raw.pickup.addressText || '',
          place_id: raw.pickup.place_id,
          latitude: raw.pickup.latitude,
          longitude: raw.pickup.longitude,
        }
      : null,
    dropoff: raw.dropoff
      ? {
          address: raw.dropoff.address || raw.dropoff.addressText || '',
          place_id: raw.dropoff.place_id,
          latitude: raw.dropoff.latitude,
          longitude: raw.dropoff.longitude,
        }
      : null,
    driver: raw.driver
      ? {
          id: raw.driver.id,
          firstName: raw.driver.first_name || raw.driver.firstName || '',
          lastName: raw.driver.last_name || raw.driver.lastName || '',
          phone: raw.driver.phone || raw.driver.phone_e164 || null,
          email: raw.driver.email || '',
          rating: raw.driver.rating ?? 4.89,
          totalTrips: raw.driver.total_trips ?? raw.driver.totalTrips ?? 120,
        }
      : null,
    vehicle: raw.vehicle
      ? {
          id: raw.vehicle.id,
          plate: raw.vehicle.plate || '',
          brand: raw.vehicle.brand || '',
          model: raw.vehicle.model || '',
          color: raw.vehicle.color || '',
          category: raw.vehicle.category || 'Essential y Comfort',
        }
      : null,
    passenger: raw.passenger
      ? {
          id: raw.passenger.id,
          firstName: raw.passenger.first_name || raw.passenger.firstName || '',
          lastName: raw.passenger.last_name || raw.passenger.lastName || '',
          phone: raw.passenger.phone || raw.passenger.phone_e164 || null,
          email: raw.passenger.email || '',
          totalTrips: raw.passenger.total_trips ?? raw.passenger.totalTrips ?? 1,
        }
      : null,
    thirdParty: raw.third_party
      ? {
          name: raw.third_party.name || '',
          phone: raw.third_party.phone || raw.third_party.phone_e164 || '',
          email: raw.third_party.email || null,
        }
      : raw.thirdParty || null,
    estimatedDistanceM: raw.estimated_distance_meters ?? raw.estimatedDistanceM ?? 0,
    estimatedDurationS: raw.estimated_duration_seconds ?? raw.estimatedDurationS ?? 0,
    paymentStatus: raw.payment_status || raw.paymentStatus || null,
    payment: raw.payment || null,
    fareBreakdown: raw.fare_breakdown || raw.fareBreakdown || null,
    currentDriverLocation: raw.currentDriverLocation || null,
  };

  return detail;
};
