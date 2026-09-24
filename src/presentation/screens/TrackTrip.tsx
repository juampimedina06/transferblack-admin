import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AlertTriangle, MapPin, RefreshCw } from 'lucide-react';
import { useTripTracking } from '../tracking/hooks/useTripTracking';
import { useElapsedLabel } from '../tracking/hooks/useElapsedLabel';
import { TrackingSkeleton } from '../tracking/components/TrackingSkeleton';
import { TripStatusTimeline } from '../tracking/components/TripStatusTimeline';
import { DriverCard } from '../tracking/components/DriverCard';
import { TripTrackingMap } from '../tracking/components/TripTrackingMap';
import { buildTripTimeline, getTripStatusCopy } from '../tracking/utils/tripStatusCopy';
import { TripTrackingError, type TripTracking } from '../../core/tracking/interfaces/trip-tracking.interface';
import transferLogo from '../../assets/img/logo_transferblack_sinfodo.png';

/**
 * Pagina publica de seguimiento (`/track?token=...`). La abre un invitado sin
 * sesion desde el link que le llega por email o WhatsApp: no debe tocar el
 * store de auth del panel ni depender de `ProtectedRoute`.
 */
export default function TrackTrip() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  useEffect(() => {
    document.title = 'Seguí tu viaje · Transfer Black';

    // El token es una credencial: evitamos que un buscador la indexe.
    const meta = document.createElement('meta');
    meta.name = 'robots';
    meta.content = 'noindex';
    document.head.appendChild(meta);

    return () => {
      document.head.removeChild(meta);
    };
  }, []);

  const { data: trip, error, isLoading, isRefetching, refetch } = useTripTracking(token);
  const driverLocationLabel = useElapsedLabel(trip?.driverLocation?.updatedAt ?? null);

  return (
    <div className="min-h-screen bg-gray-50 font-montserrat">
      <header className="bg-obsidian px-4 py-4 flex items-center gap-3">
        <img src={transferLogo} alt="Transfer Black" className="h-7 w-auto" />
        {trip && (
          <span className="ml-auto text-xs font-semibold tracking-wider text-champagne-gold bg-white/5 px-2.5 py-1 rounded">
            {trip.publicCode}
          </span>
        )}
      </header>

      <main className="max-w-lg mx-auto px-4 py-6">
        {!token && (
          <ErrorState
            title="Enlace incompleto"
            description="A este enlace le falta el código de seguimiento. Pedile a quien te lo compartió que te mande el link completo."
          />
        )}

        {token && isLoading && <TrackingSkeleton />}

        {/* Con un viaje ya cargado, un sondeo fallido no tapa la pantalla: se sigue mostrando el ultimo dato. */}
        {token && !isLoading && !trip && error instanceof TripTrackingError && error.status === 404 && (
          <ErrorState
            title="El enlace no es válido"
            description="El enlace no es válido o el viaje ya no está disponible."
          />
        )}

        {token && !isLoading && !trip && error instanceof TripTrackingError && error.status !== 404 && (
          <ErrorState
            title="No pudimos cargar el viaje"
            description={error.message}
            onRetry={() => refetch()}
          />
        )}

        {token && trip && (
          <div className="space-y-4">
            {trip.status === 'cancelled' ? (
              <CancelledCard cancelledAt={trip.cancelledAt} />
            ) : (
              <StatusCard trip={trip} />
            )}

            {trip.status !== 'cancelled' && (
              <div className="h-72 rounded-xl overflow-hidden border border-gray-100 shadow-sm">
                <TripTrackingMap
                  origin={trip.origin}
                  destination={trip.destination}
                  driverLocation={trip.driverLocation}
                  route={trip.route}
                />
              </div>
            )}

            {trip.status !== 'cancelled' && (trip.driver || ['searching', 'assigned'].includes(trip.status)) && (
              <DriverCard driver={trip.driver} vehicle={trip.vehicle} />
            )}

            {trip.driverLocation ? (
              <p className="text-xs text-gray-400 text-center">Ubicación actualizada {driverLocationLabel}</p>
            ) : (
              ['assigned', 'driver_arriving', 'driver_arrived', 'in_progress'].includes(trip.status) && (
                <p className="text-xs text-gray-400 text-center">Actualizando la ubicación del chofer…</p>
              )
            )}

            <AddressSummary origin={trip.origin} destination={trip.destination} />

            {trip.status === 'completed' && (
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 text-center">
                <p className="text-sm font-semibold text-gray-900 mb-1">¡Gracias por viajar con nosotros!</p>
                <p className="text-xs text-gray-500">Esperamos verte de nuevo pronto.</p>
              </div>
            )}

            {isRefetching && (
              <p className="text-[10px] text-gray-300 text-center uppercase tracking-wider">Actualizando…</p>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

function StatusCard({ trip }: { trip: TripTracking }) {
  const copy = getTripStatusCopy(trip.status);
  const steps = buildTripTimeline(trip);

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
      <h1 className="text-lg font-bold text-gray-900">{copy.headline}</h1>
      <p className="text-sm text-gray-500 mb-5">{copy.description}</p>
      <TripStatusTimeline steps={steps} />
    </div>
  );
}

function CancelledCard({ cancelledAt }: { cancelledAt: string | null }) {
  const copy = getTripStatusCopy('cancelled');

  return (
    <div className="bg-white rounded-xl border border-red-100 shadow-sm p-5 text-center">
      <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-3">
        <AlertTriangle className="w-5 h-5 text-red-500" />
      </div>
      <h1 className="text-lg font-bold text-gray-900">{copy.headline}</h1>
      <p className="text-sm text-gray-500">{copy.description}</p>
      {cancelledAt && (
        <p className="text-xs text-gray-400 mt-2">
          {new Intl.DateTimeFormat('es-AR', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(cancelledAt))}
        </p>
      )}
    </div>
  );
}

function AddressSummary({
  origin,
  destination,
}: {
  origin: { addressText: string } | null;
  destination: { addressText: string } | null;
}) {
  if (!origin && !destination) {
    return null;
  }

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 space-y-3">
      <div className="flex items-start gap-2.5">
        <MapPin className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
        <div>
          <p className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold">Origen</p>
          <p className="text-sm text-gray-800">{origin?.addressText ?? 'A definir'}</p>
        </div>
      </div>
      <div className="flex items-start gap-2.5">
        <MapPin className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
        <div>
          <p className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold">Destino</p>
          <p className="text-sm text-gray-800">{destination?.addressText ?? 'A definir'}</p>
        </div>
      </div>
    </div>
  );
}

function ErrorState({
  title,
  description,
  onRetry,
}: {
  title: string;
  description: string;
  onRetry?: () => void;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 text-center">
      <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center mx-auto mb-3">
        <AlertTriangle className="w-5 h-5 text-orange-500" />
      </div>
      <h1 className="text-base font-bold text-gray-900 mb-1">{title}</h1>
      <p className="text-sm text-gray-500 mb-4">{description}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex items-center gap-2 px-4 py-2 bg-obsidian text-white text-sm font-medium rounded-lg hover:bg-black transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Reintentar
        </button>
      )}
    </div>
  );
}
