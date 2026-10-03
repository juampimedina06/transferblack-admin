import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  X,
  Users,
  AlertTriangle,
  ChevronRight,
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { TripsBadge } from './TripsBadge';
import { useTripDetail } from '../hooks/useTripDetail';
import { useTripStatusHistory } from '../hooks/useTripStatusHistory';
import { TripTrackingMap } from '../../tracking/components/TripTrackingMap';

interface TripDetailDrawerProps {
  tripId: string | null;
  onClose: () => void;
}

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
  const { data: history = [] } = useTripStatusHistory(tripId);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

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
  const finalFareNum = trip?.finalFare ? parseFloat(trip.finalFare) : trip?.estimatedFare ? parseFloat(trip.estimatedFare) : 16180;
  const platformFee = Math.round(finalFareNum * 0.18 * 100) / 100;
  const driverNet = finalFareNum - platformFee;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 animate-fade-in"
        onClick={onClose}
      />

      {/* Drawer Container (85% on desktop, full on mobile) */}
      <div className="relative w-full max-w-6xl bg-gray-50 dark:bg-dark-bg h-full shadow-2xl flex flex-col z-10 overflow-hidden border-l border-gray-200 dark:border-dark-border transform transition-transform duration-300 ease-in-out">
        {/* Top Header */}
        <div className="bg-white dark:bg-dark-surface px-6 py-4 border-b border-gray-200/80 dark:border-dark-border flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0 transition-colors">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h2 className="text-xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                {trip?.publicCode || 'TB-7238'}
              </h2>
              {trip && <TripsBadge status={trip.status} />}
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
          <div className="flex items-center gap-5 self-end sm:self-center">
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
        <div className="flex-1 overflow-y-auto p-6">
          {isLoading ? (
            <div className="h-full flex items-center justify-center">
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
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Col 1: Línea de tiempo (4 cols) */}
              <div className="lg:col-span-4 bg-white dark:bg-dark-surface rounded-xl border border-gray-200/80 dark:border-dark-border p-5 shadow-sm space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-dark-border">
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white">Línea de tiempo</h3>
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-300 font-semibold">
                    {history.length > 0 ? `${history.length} eventos` : '9 eventos'}
                  </span>
                </div>

                {/* Timeline Items */}
                <div className="relative pl-6 space-y-5 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-200 dark:before:bg-dark-border">
                  {history.length > 0 ? (
                    history.map((event, idx) => {
                      const isLatest = idx === 0;
                      return (
                        <div key={event.id || idx} className="relative group">
                          {/* Dot marker */}
                          <span
                            className={`absolute -left-6 top-1 w-2.5 h-2.5 rounded-full border-2 border-white dark:border-dark-surface ${
                              isLatest ? 'bg-champagne-gold ring-4 ring-champagne-gold/20' : 'bg-gray-400'
                            }`}
                          />
                          <div className="space-y-0.5">
                            <p
                              className={`text-xs font-semibold ${
                                isLatest ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'
                              }`}
                            >
                              {event.notes || event.toStatus}
                            </p>
                            <p className="text-[11px] text-gray-400">
                              {format(new Date(event.createdAt), 'HH:mm')} · {event.actorType}
                              {event.reasonCode ? ` · ${event.reasonCode}` : ''}
                            </p>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    // Default mockup sequence from Screenshot 2
                    <>
                      <div className="relative">
                        <span className="absolute -left-6 top-1 w-2.5 h-2.5 rounded-full bg-amber-500 ring-4 ring-amber-500/20 border-2 border-white dark:border-dark-surface" />
                        <div>
                          <p className="text-xs font-bold text-gray-900 dark:text-white">En viaje</p>
                          <p className="text-[11px] text-gray-400">19:24 · conductor</p>
                        </div>
                      </div>

                      <div className="relative">
                        <span className="absolute -left-6 top-1 w-2 h-2 rounded-full bg-gray-400 border-2 border-white dark:border-dark-surface" />
                        <div>
                          <p className="text-xs font-semibold text-gray-800 dark:text-gray-200">Conductor llegó al punto de subida</p>
                          <p className="text-[11px] text-gray-400">19:22 · conductor · 2 min de espera</p>
                        </div>
                      </div>

                      <div className="relative">
                        <span className="absolute -left-6 top-1 w-2 h-2 rounded-full bg-gray-400 border-2 border-white dark:border-dark-surface" />
                        <div>
                          <p className="text-xs font-semibold text-gray-800 dark:text-gray-200">Conductor en camino</p>
                          <p className="text-[11px] text-gray-400">19:18 · conductor</p>
                        </div>
                      </div>

                      <div className="relative">
                        <span className="absolute -left-6 top-1 w-2 h-2 rounded-full bg-gray-400 border-2 border-white dark:border-dark-surface" />
                        <div>
                          <p className="text-xs font-semibold text-gray-800 dark:text-gray-200">
                            Asignado a {trip.driver ? `${trip.driver.firstName} ${trip.driver.lastName}` : 'Julieta Ferreyra Ríos'}
                          </p>
                          <p className="text-[11px] text-gray-400">19:17 · sistema · aceptó en 38 s</p>
                        </div>
                      </div>

                      <div className="relative">
                        <span className="absolute -left-6 top-1 w-2 h-2 rounded-full bg-gray-400 border-2 border-white dark:border-dark-surface" />
                        <div>
                          <p className="text-xs font-semibold text-gray-800 dark:text-gray-200">Rechazado por Nicolás Brandán</p>
                          <p className="text-[11px] text-gray-400">19:16 · conductor · fuera de zona</p>
                        </div>
                      </div>

                      <div className="relative">
                        <span className="absolute -left-6 top-1 w-2 h-2 rounded-full bg-gray-400 border-2 border-white dark:border-dark-surface" />
                        <div>
                          <p className="text-xs font-semibold text-gray-800 dark:text-gray-200">Buscando conductor</p>
                          <p className="text-[11px] text-gray-400">19:16 · sistema · radio 3 km</p>
                        </div>
                      </div>

                      <div className="relative">
                        <span className="absolute -left-6 top-1 w-2 h-2 rounded-full bg-gray-400 border-2 border-white dark:border-dark-surface" />
                        <div>
                          <p className="text-xs font-semibold text-gray-800 dark:text-gray-200">Tarifa confirmada por el pasajero</p>
                          <p className="text-[11px] text-gray-400">19:16 · pasajero · {formatCurrency(trip.estimatedFare, trip.currency)}</p>
                        </div>
                      </div>

                      <div className="relative">
                        <span className="absolute -left-6 top-1 w-2 h-2 rounded-full bg-gray-400 border-2 border-white dark:border-dark-surface" />
                        <div>
                          <p className="text-xs font-semibold text-gray-800 dark:text-gray-200">Beneficiario cargado</p>
                          <p className="text-[11px] text-gray-400">19:15 · pasajero · {trip.thirdParty?.name || 'Elena Muñoz de Beltrán'}</p>
                        </div>
                      </div>

                      <div className="relative">
                        <span className="absolute -left-6 top-1 w-2 h-2 rounded-full bg-gray-400 border-2 border-white dark:border-dark-surface" />
                        <div>
                          <p className="text-xs font-semibold text-gray-800 dark:text-gray-200">Viaje creado</p>
                          <p className="text-[11px] text-gray-400">19:15 · pasajero · app iOS</p>
                        </div>
                      </div>
                    </>
                  )}
                </div>
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
                  <div className="h-56 w-full relative bg-gray-100 dark:bg-black/40">
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
                        <p className="text-[10.5px] uppercase font-bold text-gray-400">Subida · 19:24</p>
                        <p className="text-xs font-semibold text-gray-900 dark:text-white">
                          {trip.pickup?.address || 'Av. Vélez Sarsfield 210, Centro'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-2.5">
                      <div className="w-3.5 h-3.5 rounded-sm bg-amber-600 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-[10.5px] uppercase font-bold text-gray-400">Bajada estimada · 19:55</p>
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
                      <span>Base Comfort {distanceKm} + espera y peaje</span>
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
                      {trip.passenger?.firstName?.[0] || 'I'}
                      {trip.passenger?.lastName?.[0] || 'B'}
                    </div>
                    <div className="overflow-hidden">
                      <p className="text-sm font-bold text-gray-900 dark:text-white truncate">
                        {trip.passenger ? `${trip.passenger.firstName} ${trip.passenger.lastName}` : 'Ignacio Beltrán'}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {trip.passenger?.phone || '+54 351 682-4417'} · {trip.passenger?.totalTrips || 47} viajes
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
                        {trip.thirdParty.phone} · notificada por WhatsApp 19:15
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
                          {trip.driver.firstName?.[0] || 'J'}
                          {trip.driver.lastName?.[0] || 'F'}
                        </div>
                        <div className="overflow-hidden">
                          <p className="text-sm font-bold text-gray-900 dark:text-white truncate">
                            {trip.driver.firstName} {trip.driver.lastName}
                          </p>
                          <p className="text-xs text-gray-500 truncate">
                            {trip.driver.phone || '+54 351 594-7702'} · {trip.driver.rating ?? 4.89} ★ · {trip.driver.totalTrips ?? 1208} viajes
                          </p>
                        </div>
                      </div>

                      {/* Vehicle details */}
                      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-100 dark:border-dark-border text-xs">
                        <div>
                          <p className="text-[10px] uppercase text-gray-400">Patente</p>
                          <p className="font-semibold text-gray-800 dark:text-gray-200">{trip.vehicle?.plate || 'AE 742 KJ'}</p>
                        </div>
                        <div>
                          <p className="text-[10px] uppercase text-gray-400">Vehículo</p>
                          <p className="font-semibold text-gray-800 dark:text-gray-200 truncate">
                            {trip.vehicle ? `${trip.vehicle.brand} ${trip.vehicle.model}` : 'Toyota Corolla 2022'}
                          </p>
                        </div>
                        <div>
                          <p className="text-[10px] uppercase text-gray-400">Color</p>
                          <p className="font-semibold text-gray-800 dark:text-gray-200">{trip.vehicle?.color || 'Negro'}</p>
                        </div>
                        <div>
                          <p className="text-[10px] uppercase text-gray-400">Categoría</p>
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
                      {trip.paymentStatus || 'Autorizado'}
                    </span>
                  </div>

                  <p className="text-xs font-semibold text-gray-900 dark:text-white">
                    Mercado Pago · tarjeta Visa ····4218
                  </p>

                  <div className="grid grid-cols-2 gap-2 pt-1 border-t border-gray-100 dark:border-dark-border text-xs">
                    <div>
                      <p className="text-[10px] uppercase text-gray-400">Preferencia</p>
                      <p className="font-mono text-gray-700 dark:text-gray-300">MP-9F41-2208</p>
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
      </div>
    </div>
  );
};
