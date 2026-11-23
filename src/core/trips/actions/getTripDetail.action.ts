import { adminApi } from '../../api/adminApi';
import type { TripDetail, TripStopPoint } from '../interfaces/trip.interface';

/* eslint-disable @typescript-eslint/no-explicit-any -- respuesta snake_case del backend, se normaliza aca */
const toStop = (raw: any): TripStopPoint | null =>
  raw
    ? {
        address: raw.address || raw.address_text || '',
        place_id: raw.place_id,
        latitude: raw.latitude,
        longitude: raw.longitude,
      }
    : null;

/**
 * Detalle de un viaje para el panel (`GET /admin/trips/:id`). Lo que el
 * backend no manda queda en `null`: la pantalla muestra "—", nunca un dato
 * inventado.
 */
export const getTripDetail = async (tripId: string): Promise<TripDetail> => {
  const response = await adminApi.get<{ data: any }>(`/admin/trips/${tripId}`);
  const raw = response.data.data;
  const admin = raw.admin ?? {};
  const adminDriver = admin.driver;

  return {
    id: raw.id,
    publicCode: raw.public_code,
    status: raw.status,
    bookingType: raw.booking_type || 'immediate',
    serviceType: raw.service_type ?? null,
    paymentMethod: raw.payment_method ?? null,
    estimatedFare: raw.estimated_fare ?? null,
    finalFare: raw.final_fare ?? null,
    currency: raw.currency || 'ARS',
    createdAt: raw.requested_at ?? raw.confirmed_at ?? null,
    confirmedAt: raw.confirmed_at ?? null,
    assignedAt: raw.assigned_at ?? null,
    driverArrivedAt: raw.driver_arrived_at ?? null,
    startedAt: raw.started_at ?? null,
    finishedAt: raw.finished_at ?? null,
    cancelledAt: raw.cancelled_at ?? null,
    cancellationReasonCode: raw.cancellation_reason_code ?? null,
    pickup: toStop(raw.pickup),
    dropoff: toStop(raw.dropoff),
    stops: Array.isArray(raw.stops) ? raw.stops.map(toStop).filter(Boolean) : [],
    driver: adminDriver
      ? {
          id: adminDriver.id,
          firstName: adminDriver.first_name,
          lastName: adminDriver.last_name,
          phone: adminDriver.phone_e164 ?? null,
          email: '',
          avatarUrl: adminDriver.avatar_url ?? null,
          rating: adminDriver.rating_count > 0 ? adminDriver.rating_average : null,
          totalTrips: adminDriver.completed_trips,
        }
      : null,
    vehicle: raw.vehicle
      ? {
          id: raw.vehicle.id ?? '',
          plate: raw.vehicle.plate ?? '',
          brand: raw.vehicle.brand ?? '',
          model: raw.vehicle.model ?? '',
          color: raw.vehicle.color ?? '',
          category: raw.service_type?.name ?? '',
        }
      : null,
    passenger: raw.passenger
      ? {
          id: raw.passenger.id,
          firstName: raw.passenger.firstName ?? raw.passenger.first_name ?? '',
          lastName: raw.passenger.lastName ?? raw.passenger.last_name ?? '',
          phone: raw.passenger.phone ?? null,
          email: raw.passenger.email ?? '',
          totalTrips: raw.passenger.totalTrips ?? raw.passenger.total_trips ?? 0,
        }
      : null,
    thirdParty: raw.third_party
      ? {
          name: raw.third_party.name || '',
          phone: raw.third_party.phone || raw.third_party.phone_e164 || '',
          email: raw.third_party.email || null,
        }
      : null,
    estimatedDistanceM: raw.estimated_distance_meters ?? 0,
    estimatedDurationS: raw.estimated_duration_seconds ?? 0,
    paymentStatus: admin.payment?.status ?? raw.payment_status ?? null,
    payment: admin.payment
      ? {
          type: admin.payment.type,
          status: admin.payment.status,
          amount: admin.payment.amount,
          preferenceId: admin.payment.provider_preference_id ?? undefined,
          providerPaymentId: admin.payment.provider_payment_id ?? null,
          approvedAt: admin.payment.approved_at ?? null,
        }
      : null,
    fareBreakdown: raw.fare_breakdown ?? null,
    routeGeometry: raw.route_geometry ?? null,
    currentDriverLocation: admin.driver_location
      ? {
          latitude: admin.driver_location.latitude,
          longitude: admin.driver_location.longitude,
          updatedAt: admin.driver_location.updated_at,
        }
      : null,
    commission: admin.commission
      ? {
          percent: admin.commission.percent,
          platformAmount: admin.commission.platform_amount,
          driverAmount: admin.commission.driver_amount,
        }
      : null,
  };
};
