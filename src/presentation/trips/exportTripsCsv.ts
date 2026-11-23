import { getTrips } from '../../core/trips/actions/getTrips.action';
import type { GetTripsFilters, TripListItem } from '../../core/trips/interfaces/trip.interface';
import { downloadCsv, toCsvAmount } from '../utils/csv';
import { formatDateTimeAR, toLocalISODate } from '../utils/dates';
import { TRIP_STATUS_LABELS } from './tripStatusLabels';

const PAGE_SIZE = 100;
/** Tope de filas: un CSV mas grande conviene pedirlo por rangos de fecha. */
export const MAX_EXPORT_ROWS = 5000;

const personName = (person: { firstName: string; lastName: string } | null) =>
  person ? `${person.firstName} ${person.lastName}`.trim() : '';

/** Baja todas las paginas de los viajes filtrados (hasta el tope) y arma el CSV. */
export const exportTripsCsv = async (filters: GetTripsFilters): Promise<{ rows: number; truncated: boolean }> => {
  const trips: TripListItem[] = [];
  let page = 1;
  let total: number;

  do {
    const response = await getTrips({ ...filters, page, limit: PAGE_SIZE });
    total = response.total;
    trips.push(...response.data);
    page += 1;
  } while (trips.length < total && trips.length < MAX_EXPORT_ROWS);

  downloadCsv(
    `viajes-${toLocalISODate(new Date())}.csv`,
    ['Código', 'Estado', 'Fecha', 'Tipo', 'Pasajero', 'Teléfono pasajero', 'Conductor', 'Patente', 'Origen', 'Destino', 'Tarifa', 'Moneda'],
    trips.slice(0, MAX_EXPORT_ROWS).map((trip) => [
      trip.publicCode,
      TRIP_STATUS_LABELS[trip.status] ?? trip.status,
      formatDateTimeAR(trip.createdAt),
      trip.bookingType === 'scheduled' ? 'Reservado' : 'Inmediato',
      personName(trip.passenger),
      trip.passenger?.phone ?? '',
      personName(trip.driver),
      trip.vehicle?.plate ?? '',
      trip.originAddress ?? '',
      trip.destinationAddress ?? '',
      toCsvAmount(trip.finalFare ?? trip.estimatedFare),
      trip.currency,
    ]),
  );

  return { rows: Math.min(trips.length, MAX_EXPORT_ROWS), truncated: total > MAX_EXPORT_ROWS };
};
