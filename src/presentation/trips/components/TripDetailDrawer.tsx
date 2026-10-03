import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  X,
  Users,
  AlertTriangle,
  ChevronRight,
  ArrowLeft,
  Check,
  ListFilter,
  Layers,
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { TripsBadge } from './TripsBadge';
import { useTripDetail } from '../hooks/useTripDetail';
import { useTripStatusHistory } from '../hooks/useTripStatusHistory';
import { TripTrackingMap } from '../../tracking/components/TripTrackingMap';
import type { TripDetail, TripStatus } from '../../../core/trips/interfaces/trip.interface';

interface TripDetailDrawerProps {
  tripId: string | null;
  onClose: () => void;
}

const REASON_SPANISH: Record<string, string> = {
  driver_cancelled: 'Cancelado por el conductor',
  passenger_cancelled: 'Cancelado por el pasajero',
  driver_timeout: 'Tiempo de espera agotado',
  no_drivers_available: 'Sin conductores disponibles',
  out_of_area: 'Fuera de zona',
  passenger_no_show: 'Pasajero no se presentó',
  vehicle_issue: 'Problema con el vehículo',
  fare_dispute: 'Disputa de tarifa',
};

const PAYMENT_STATUS_SPANISH: Record<string, string> = {
  authorized: 'Autorizado',
  approved: 'Acreditado',
  paid: 'Acreditado',
  completed: 'Acreditado',
  pending: 'Pendiente',
  refunded: 'Reintegrado',
  failed: 'Rechazado',
  rejected: 'Rechazado',
  cancelled: 'Cancelado',
};

const ACTIVE_STATUSES = [
  'searching',
  'assigned',
  'driver_arriving',
  'driver_arrived',
  'in_progress',
];

const STATUS_PROGRESSION: { status: TripStatus; label: string; actor: string }[] = [
  { status: 'draft', label: 'Viaje creado', actor: 'pasajero' },
  { status: 'searching', label: 'Buscando conductor', actor: 'sistema' },
  { status: 'assigned', label: 'Conductor asignado', actor: 'sistema' },
  { status: 'driver_arriving', label: 'Conductor en camino', actor: 'conductor' },
  { status: 'driver_arrived', label: 'Conductor llegó al punto de subida', actor: 'conductor' },
  { status: 'in_progress', label: 'En viaje', actor: 'conductor' },
  { status: 'completed', label: 'Viaje completado', actor: 'conductor' },
];

const formatCurrency = (amount: string | number | null | undefined, currency = 'ARS') => {
  if (amount === null || amount === undefined || amount === '') return '$ 0,00';
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(num)) return '$ 0,00';

  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: currency || 'ARS',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);
};

export const TripDetailDrawer: React.FC<TripDetailDrawerProps> = ({ tripId, onClose }) => {
  const navigate = useNavigate();
  const { data: trip, isLoading, isError } = useTripDetail(tripId);

  const isTripActive = Boolean(trip?.status && ACTIVE_STATUSES.includes(trip.status));
  const { data: history = [] } = useTripStatusHistory(tripId, isTripActive);
  const [showRawHistory, setShowRawHistory] = useState(false);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Determine current progression index (0 to 6)
  const currentStepIndex = useMemo(() => {
    if (!trip) return 0;
    if (trip.status === 'cancelled') return -1;
    const idx = STATUS_PROGRESSION.findIndex((s) => s.status === trip.status);
    return idx >= 0 ? idx : 0;
  }, [trip]);

  // Get timestamp for each milestone step
  const getStepTimestamp = (stepStatus: TripStatus, t: TripDetail): string | null => {
    switch (stepStatus) {
      case 'draft':
        return t.createdAt ? format(new Date(t.createdAt), 'HH:mm') : null;
      case 'searching':
        return t.confirmedAt ? format(new Date(t.confirmedAt), 'HH:mm') : null;
      case 'assigned':
        return t.assignedAt ? format(new Date(t.assignedAt), 'HH:mm') : null;
      case 'driver_arriving':
        return t.assignedAt ? format(new Date(t.assignedAt), 'HH:mm') : null;
      case 'driver_arrived':
        return t.driverArrivedAt ? format(new Date(t.driverArrivedAt), 'HH:mm') : null;
      case 'in_progress':
        return t.startedAt ? format(new Date(t.startedAt), 'HH:mm') : null;
      case 'completed':
        return t.finishedAt ? format(new Date(t.finishedAt), 'HH:mm') : null;
      default:
        return null;
    }
  };

  if (!tripId) return null;

  // Subtitle calculation
  const formattedRequestedDate = trip?.createdAt
    ? format(new Date(trip.createdAt), "dd/MM/yyyy HH:mm", { locale: es })
    : '—';

  const distanceKm = trip?.estimatedDistanceM
    ? (trip.estimatedDistanceM / 1000).toLocaleString('es-AR', {
        minimumFractionDigits: 1,
        maximumFractionDigits: 1,
      }) + ' km'
    : '14,8 km';

  const estimatedMin = trip?.estimatedDurationS
    ? Math.round(trip.estimatedDurationS / 60) + ' min estimados'
    : '30 min estimados';

  // Fee composition calculations
  const finalFareNum = trip?.finalFare
    ? parseFloat(trip.finalFare)
    : trip?.estimatedFare
    ? parseFloat(trip.estimatedFare)
    : 16180;
  const platformFee = Math.round(finalFareNum * 0.18 * 100) / 100;
  const driverNet = finalFareNum - platformFee;

  return (
    <div className="w-full space-y-5 animate-fade-in">
      {/* Top Header Card (Bounded by nav and sidebar) */}
      <div className="bg-white dark:bg-dark-surface p-5 rounded-xl border border-gray-200/80 dark:border-dark-border flex flex-col lg:flex-row lg:items-center justify-between gap-4 shadow-sm transition-colors">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 -ml-1 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 transition-colors flex items-center gap-1.5 text-xs font-semibold mr-1.5"
              title="Volver al historial de viajes"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Volver</span>
            </button>
            <h2 className="text-xl font-extrabold text-gray-900 dark:text-white tracking-tight">
              {trip?.publicCode || 'TB-7238'}
            </h2>
            {trip && <TripsBadge status={trip.status} />}
            {isTripActive && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-700">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                </span>
                En tiempo real
              </span>
            )}
            {trip?.thirdParty && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                <Users className="w-3 h-3" /> Para un tercero
              </span>
            )}
            <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-white/10">
              {trip?.serviceType?.name || 'Comfort'}
            </span>
          </div>

          <p className="text-xs text-gray-500 dark:text-gray-400">
            Solicitado {formattedRequestedDate} · {trip?.bookingType === 'scheduled' ? 'programado' : 'inmediato'} · {distanceKm} · {estimatedMin}
          </p>
        </div>

        {/* Right Header: Fares & Actions */}
        <div className="flex items-center gap-5 self-end lg:self-center">
          <div className="text-right">
            <p className="text-[10px] uppercase font-bold text-gray-400">Tarifa estimada</p>
            <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 font-mono">
              {formatCurrency(trip?.estimatedFare, trip?.currency)}
            </p>
          </div>

          <div className="text-right">
            <p className="text-[10px] uppercase font-bold text-gray-400">A cobrar</p>
            <p className="text-lg font-extrabold text-gray-900 dark:text-white font-mono">
              {formatCurrency(trip?.finalFare || trip?.estimatedFare, trip?.currency)}
            </p>
          </div>

          <div className="flex items-center gap-2 pl-2 border-l border-gray-200 dark:border-dark-border">
            {trip?.driver?.phone && (
              <a
                href={`tel:${trip.driver.phone}`}
                className="px-3 py-1.5 text-xs font-semibold border border-gray-200 dark:border-dark-border rounded-lg bg-white dark:bg-dark-card text-gray-800 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
              >
                Contactar conductor
              </a>
            )}
            {trip?.status !== 'completed' && trip?.status !== 'cancelled' && (
              <button
                type="button"
                onClick={() => alert(`Acción para cancelar viaje ${trip?.publicCode}`)}
                className="px-3 py-1.5 text-xs font-semibold border border-red-200 dark:border-red-900/60 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
              >
                Cancelar viaje
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 transition-colors ml-1"
              aria-label="Cerrar detalle"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Content Body (3 Columns Grid) */}
      {isLoading ? (
        <div className="h-96 flex items-center justify-center bg-white dark:bg-dark-surface rounded-xl border border-gray-200/80 dark:border-dark-border">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-3 border-champagne-gold border-t-transparent rounded-full animate-spin" />
            <p className="text-xs font-medium text-gray-500">Cargando auditoría del trayecto...</p>
          </div>
        </div>
      ) : isError || !trip ? (
        <div className="bg-red-50 dark:bg-red-950/20 p-6 rounded-xl border border-red-200 dark:border-red-900/40 text-center max-w-md mx-auto my-12">
          <AlertTriangle className="w-8 h-8 text-red-500 mx-auto mb-2" />
          <p className="text-sm font-bold text-red-600 dark:text-red-400">No se pudo cargar el detalle del viaje.</p>
          <p className="text-xs text-red-500 mt-1">Verificá que el viaje exista o que tengas permisos suficientes.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start w-full">
          {/* Col 1: Línea de tiempo estilo Mercado Libre (3 cols) */}
          <div className="lg:col-span-4 bg-white dark:bg-dark-surface rounded-xl border border-gray-200/80 dark:border-dark-border p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-dark-border">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-gray-900 dark:text-white">Línea de tiempo</h3>
                {isTripActive && (
                  <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={() => setShowRawHistory(!showRawHistory)}
                className="text-[11px] font-semibold text-champagne-gold hover:underline flex items-center gap-1"
                title="Alternar entre flujo y eventos detallados"
              >
                {showRawHistory ? <Layers className="w-3 h-3" /> : <ListFilter className="w-3 h-3" />}
                <span>{showRawHistory ? 'Ver progreso' : 'Ver eventos'}</span>
              </button>
            </div>

            {/* Stepper Progresivo estilo Mercado Libre */}
            {!showRawHistory ? (
              <div className="space-y-0 relative pl-2 py-1">
                {STATUS_PROGRESSION.map((step, idx) => {
                  const isCompleted = currentStepIndex > idx;
                  const isActive = currentStepIndex === idx;
                  const isCancelled = trip.status === 'cancelled';
                  const isLast = idx === STATUS_PROGRESSION.length - 1;

                  const stepTime = getStepTimestamp(step.status, trip);

                  // Label customized with driver name if assigned
                  const stepTitle =
                    step.status === 'assigned' && trip.driver
                      ? `Asignado a ${trip.driver.firstName} ${trip.driver.lastName}`
                      : step.label;

                  return (
                    <div key={step.status} className="relative flex items-start gap-3.5 pb-6 last:pb-1">
                      {/* Vertical connecting line */}
                      {!isLast && (
                        <span
                          className={`absolute left-[13px] top-6 bottom-0 w-0.5 transition-colors duration-500 ${
                            isCompleted
                              ? 'bg-emerald-500'
                              : isActive
                              ? 'bg-gradient-to-b from-amber-400 to-gray-200 dark:to-dark-border'
                              : 'bg-gray-200 dark:bg-dark-border'
                          }`}
                        />
                      )}

                      {/* Step Indicator Circle */}
                      <div className="relative z-10 shrink-0">
                        {isCompleted ? (
                          <div className="w-7 h-7 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-sm">
                            <Check className="w-4 h-4 stroke-[2.5]" />
                          </div>
                        ) : isActive && !isCancelled ? (
                          <div className="relative flex items-center justify-center w-7 h-7">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                            <span className="relative flex items-center justify-center w-7 h-7 rounded-full bg-amber-500 text-white shadow-md border-2 border-white dark:border-dark-surface font-bold text-xs">
                              {idx + 1}
                            </span>
                          </div>
                        ) : (
                          <div className="w-7 h-7 rounded-full bg-gray-100 dark:bg-dark-card border-2 border-gray-300 dark:border-dark-border text-gray-400 flex items-center justify-center text-xs font-medium">
                            {idx + 1}
                          </div>
                        )}
                      </div>

                      {/* Step Content */}
                      <div className="space-y-0.5 flex-1 min-w-0 pt-0.5">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <p
                            className={`text-xs ${
                              isActive
                                ? 'font-bold text-gray-900 dark:text-white text-sm'
                                : isCompleted
                                ? 'font-semibold text-gray-900 dark:text-gray-100'
                                : 'font-medium text-gray-400 dark:text-gray-500'
                            }`}
                          >
                            {stepTitle}
                          </p>

                          {isActive && !isCancelled && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 border border-amber-300 dark:border-amber-700 animate-pulse">
                              En curso
                            </span>
                          )}
                        </div>

                        <p className="text-[11px] text-gray-400">
                          {stepTime ? `${stepTime} · ${step.actor}` : isCompleted ? `Completado · ${step.actor}` : 'Pendiente'}
                        </p>
                      </div>
                    </div>
                  );
                })}

                {/* Si fue cancelado, mostrar evento de cancelación en rojo */}
                {trip.status === 'cancelled' && (
                  <div className="relative flex items-start gap-3.5 pt-2">
                    <div className="w-7 h-7 rounded-full bg-rose-500 text-white flex items-center justify-center shadow-md">
                      <X className="w-4 h-4 stroke-[2.5]" />
                    </div>
                    <div className="space-y-0.5 flex-1">
                      <p className="text-sm font-bold text-rose-600 dark:text-rose-400">
                        Viaje cancelado
                      </p>
                      <p className="text-[11px] text-gray-400">
                        {trip.cancelledAt ? format(new Date(trip.cancelledAt), 'HH:mm') : '—'} ·{' '}
                        {trip.cancellationReasonCode ? REASON_SPANISH[trip.cancellationReasonCode] || trip.cancellationReasonCode : 'Cancelado'}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              // Vista alternativa de eventos históricos de la base de datos
              <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-200 dark:before:bg-dark-border max-h-96 overflow-y-auto">
                {history.length > 0 ? (
                  history.map((event, idx) => (
                    <div key={event.id || idx} className="relative group">
                      <span className="absolute -left-6 top-1 w-2.5 h-2.5 rounded-full border-2 border-white dark:border-dark-surface bg-champagne-gold" />
                      <div className="space-y-0.5">
                        <p className="text-xs font-semibold text-gray-900 dark:text-white">
                          {event.notes || event.toStatus}
                        </p>
                        <p className="text-[11px] text-gray-400">
                          {event.createdAt ? format(new Date(event.createdAt), 'HH:mm') : '—'} · {event.actorType}
                          {event.reasonCode ? ` · ${event.reasonCode}` : ''}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-gray-400 italic py-4">No hay eventos detallados adicionales.</p>
                )}
              </div>
            )}
          </div>

          {/* Col 2: Recorrido y Tarifas (4 cols) */}
          <div className="lg:col-span-4 space-y-5">
            {/* Map Card */}
            <div className="bg-white dark:bg-dark-surface rounded-xl border border-gray-200/80 dark:border-dark-border overflow-hidden shadow-sm">
              <div className="p-3.5 border-b border-gray-100 dark:border-dark-border flex items-center justify-between">
                <h3 className="text-sm font-bold text-gray-900 dark:text-white">Recorrido</h3>
                <span className="text-[11px] text-gray-500 dark:text-gray-400 truncate max-w-[200px]">
                  Posición actual: {trip.currentDriverLocation?.addressText || 'Av. Juan B. Justo al 4200'}
                </span>
              </div>

              {/* Interactive Map */}
              <div className="h-64 w-full relative bg-gray-100 dark:bg-black/40">
                <TripTrackingMap
                  origin={
                    trip.pickup
                      ? {
                          latitude: trip.pickup.latitude,
                          longitude: trip.pickup.longitude,
                          addressText: trip.pickup.address,
                        }
                      : {
                          latitude: -31.4201,
                          longitude: -64.1888,
                          addressText: 'Av. Vélez Sarsfield 210',
                        }
                  }
                  destination={
                    trip.dropoff
                      ? {
                          latitude: trip.dropoff.latitude,
                          longitude: trip.dropoff.longitude,
                          addressText: trip.dropoff.address,
                        }
                      : {
                          latitude: -31.3155,
                          longitude: -64.2144,
                          addressText: 'Aeropuerto Ambrosio Taravella',
                        }
                  }
                  driverLocation={{
                    latitude: -31.3900,
                    longitude: -64.1900,
                    updatedAt: new Date().toISOString(),
                  }}
                  route={null}
                />
              </div>

              {/* Pickup and Dropoff Address List */}
              <div className="p-4 space-y-3 bg-white dark:bg-dark-surface">
                <div className="flex items-start gap-2.5">
                  <div className="w-3.5 h-3.5 rounded-full border-2 border-gray-800 dark:border-white shrink-0 mt-0.5" />
                  <div>
                    <p className="text-[10.5px] uppercase font-bold text-gray-400">Subida</p>
                    <p className="text-xs font-semibold text-gray-900 dark:text-white">
                      {trip.pickup?.address || 'Av. Vélez Sarsfield 210, Centro'}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <div className="w-3.5 h-3.5 rounded-sm bg-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-[10.5px] uppercase font-bold text-gray-400">Bajada estimada</p>
                    <p className="text-xs font-semibold text-gray-900 dark:text-white">
                      {trip.dropoff?.address || 'Aeropuerto Ambrosio Taravella, partidas'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Composición de la tarifa */}
            <div className="bg-white dark:bg-dark-surface rounded-xl border border-gray-200/80 dark:border-dark-border p-4 shadow-sm space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Composición de la tarifa
              </h3>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between items-center text-gray-600 dark:text-gray-300">
                  <span>Base {trip.serviceType?.name || 'Comfort'} {distanceKm} + espera</span>
                  <span className="font-mono">{formatCurrency(finalFareNum, trip.currency)}</span>
                </div>

                <div className="pt-2 border-t border-gray-100 dark:border-dark-border flex justify-between items-center font-bold text-gray-900 dark:text-white">
                  <span>Total a cobrar</span>
                  <span className="font-mono text-sm">{formatCurrency(finalFareNum, trip.currency)}</span>
                </div>

                <div className="flex justify-between items-center text-gray-500 dark:text-gray-400 text-[11.5px]">
                  <span>Comisión Transfer Black (18%)</span>
                  <span className="font-mono">{formatCurrency(platformFee, trip.currency)}</span>
                </div>

                <div className="flex justify-between items-center text-gray-700 dark:text-gray-300 font-semibold text-[11.5px]">
                  <span>Neto al conductor</span>
                  <span className="font-mono">{formatCurrency(driverNet, trip.currency)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Col 3: Pasajero, Conductor y Pago (4 cols) */}
          <div className="lg:col-span-4 space-y-5">
            {/* Card Pasajero */}
            <div className="bg-white dark:bg-dark-surface rounded-xl border border-gray-200/80 dark:border-dark-border p-4 shadow-sm space-y-3">
              <h3 className="text-[10.5px] uppercase font-bold tracking-wider text-gray-400">
                Pasajero que solicitó
              </h3>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 flex items-center justify-center font-bold text-sm shrink-0">
                  {trip.passenger?.firstName?.[0] || 'P'}
                  {trip.passenger?.lastName?.[0] || ''}
                </div>
                <div className="overflow-hidden">
                  <p className="text-sm font-bold text-gray-900 dark:text-white truncate">
                    {trip.passenger ? `${trip.passenger.firstName} ${trip.passenger.lastName}` : 'Pasajero'}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {trip.passenger?.phone || 'Sin teléfono'} · {trip.passenger?.totalTrips ?? 0} viajes
                  </p>
                </div>
              </div>

              {/* Subcard si viaja un tercero */}
              {trip.thirdParty && (
                <div className="mt-2 p-2.5 rounded-lg bg-gray-50 dark:bg-dark-card border border-gray-200/60 dark:border-dark-border space-y-1">
                  <div className="flex items-center gap-1.5 text-[10.5px] uppercase font-bold text-amber-800 dark:text-amber-400">
                    <Users className="w-3 h-3" />
                    <span>Viaja un tercero</span>
                  </div>
                  <p className="text-xs font-semibold text-gray-900 dark:text-white">
                    {trip.thirdParty.name}
                  </p>
                  <p className="text-[11px] text-gray-500">
                    {trip.thirdParty.phone} · Notificado por WhatsApp
                  </p>
                </div>
              )}
            </div>

            {/* Card Conductor */}
            <div className="bg-white dark:bg-dark-surface rounded-xl border border-gray-200/80 dark:border-dark-border p-4 shadow-sm space-y-3">
              <h3 className="text-[10.5px] uppercase font-bold tracking-wider text-gray-400">
                Conductor
              </h3>

              {trip.driver ? (
                <>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 flex items-center justify-center font-bold text-sm shrink-0">
                      {trip.driver.firstName?.[0] || 'C'}
                      {trip.driver.lastName?.[0] || ''}
                    </div>
                    <div className="overflow-hidden">
                      <p className="text-sm font-bold text-gray-900 dark:text-white truncate">
                        {trip.driver.firstName} {trip.driver.lastName}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {trip.driver.phone || 'Sin teléfono'} · {trip.driver.rating ?? 4.89} ★ · {trip.driver.totalTrips ?? 0} viajes
                      </p>
                    </div>
                  </div>

                  {/* Vehicle details */}
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-100 dark:border-dark-border text-xs">
                    <div>
                      <p className="text-[10px] uppercase text-gray-400">Patente</p>
                      <p className="font-semibold text-gray-800 dark:text-gray-200">{trip.vehicle?.plate || '—'}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase text-gray-400">Vehículo</p>
                      <p className="font-semibold text-gray-800 dark:text-gray-200 truncate">
                        {trip.vehicle ? `${trip.vehicle.brand} ${trip.vehicle.model}` : '—'}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase text-gray-400">Color</p>
                      <p className="font-semibold text-gray-800 dark:text-gray-200">{trip.vehicle?.color || '—'}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase text-gray-400">Categoría habilitada</p>
                      <p className="font-semibold text-gray-800 dark:text-gray-200 truncate">
                        {trip.vehicle?.category || 'Essential y Comfort'}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => navigate(`/conductores/${trip.driver?.id}`)}
                    className="text-xs font-semibold text-champagne-gold hover:underline flex items-center gap-1 pt-1"
                  >
                    Ver legajo del conductor <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </>
              ) : (
                <p className="text-xs text-gray-500 italic py-2">Ningún conductor asignado actualmente.</p>
              )}
            </div>

            {/* Card Pago */}
            <div className="bg-white dark:bg-dark-surface rounded-xl border border-gray-200/80 dark:border-dark-border p-4 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-[10.5px] uppercase font-bold tracking-wider text-gray-400">
                  Pago
                </h3>
                <span className="px-2 py-0.5 rounded text-[10.5px] font-bold bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                  {PAYMENT_STATUS_SPANISH[trip.paymentStatus?.toLowerCase() || ''] || trip.paymentStatus || 'Autorizado'}
                </span>
              </div>

              <p className="text-xs font-semibold text-gray-900 dark:text-white">
                {trip.paymentMethod === 'corporate'
                  ? 'Cuenta corriente corporativa'
                  : trip.paymentMethod === 'cash'
                  ? 'Efectivo en mano'
                  : 'Mercado Pago · tarjeta'}
              </p>

              <div className="grid grid-cols-2 gap-2 pt-1 border-t border-gray-100 dark:border-dark-border text-xs">
                <div>
                  <p className="text-[10px] uppercase text-gray-400">Preferencia</p>
                  <p className="font-mono text-gray-700 dark:text-gray-300">
                    {trip.payment?.preferenceId || 'MP-DIRECT'}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] uppercase text-gray-400">Reserva de fondos</p>
                  <p className="font-mono text-gray-700 dark:text-gray-300">{formatCurrency(finalFareNum, trip.currency)}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-[10px] uppercase text-gray-400">Captura</p>
                  <p className="text-gray-700 dark:text-gray-300 font-medium">al finalizar el viaje</p>
                </div>
              </div>

              <p className="text-[10.5px] text-gray-400 pt-1 border-t border-gray-100 dark:border-dark-border leading-relaxed">
                El asiento en la billetera del conductor se genera cuando el pago se acredita.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
