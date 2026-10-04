import React, { useState } from 'react';
import {
  X,
  Calendar,
  Clock,
  ExternalLink,
  RefreshCw,
  Pause,
  Play,
  XCircle,
  Copy,
  Check,
  MapPin,
  Car,
  CreditCard,
  AlertCircle,
} from 'lucide-react';
import { useRecurringTripDetail } from '../hooks/useRecurringTripDetail';
import { useRecurringTripMutations } from '../hooks/useRecurringTripMutations';
import { RecurringTripBadge, RecurringCycleBadge } from './RecurringTripBadge';
import {
  DAYS_OF_WEEK_OPTIONS,
  type RecurringBillingCycleDto,
  type RecurringTripItem,
} from '../../../core/recurringTrips/recurringTrip.interface';
import { TripsBadge } from '../../trips/components/TripsBadge';
import type { TripStatus } from '../../../core/trips/interfaces/trip.interface';
import { Button } from '../../components/common';
import { formatArgentineDateTime } from '../../../core/scheduledTrips/shared';

interface RecurringTripDetailDrawerProps {
  scheduleId: string | null;
  onClose: () => void;
}

function formatMoney(amount?: string | number, currency = 'ARS') {
  if (amount === undefined || amount === null) return '—';
  const num = typeof amount === 'number' ? amount : parseFloat(amount);
  if (Number.isNaN(num)) return '—';
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: currency || 'ARS',
  }).format(num);
}

function formatDateOnly(iso?: string) {
  if (!iso) return '—';
  try {
    const d = new Date(iso);
    return d.toLocaleDateString('es-AR', { timeZone: 'America/Argentina/Cordoba' });
  } catch {
    return iso;
  }
}

export const RecurringTripDetailDrawer: React.FC<RecurringTripDetailDrawerProps> = ({
  scheduleId,
  onClose,
}) => {
  const [copiedCycleId, setCopiedCycleId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const { data, isLoading, error } = useRecurringTripDetail(scheduleId);
  const { updateStatus, renewCycle, isUpdating, isRenewing } = useRecurringTripMutations(
    scheduleId || undefined
  );

  if (!scheduleId) return null;

  const schedule = data?.schedule;
  const activeCycle = data?.active_cycle || data?.activeCycle;
  const allCycles: RecurringBillingCycleDto[] =
    data?.cycles && data.cycles.length > 0
      ? data.cycles
      : activeCycle
      ? [activeCycle]
      : [];
  const trips: RecurringTripItem[] = data?.trips || [];

  const handleCopyLink = (url: string, cycleId: string) => {
    navigator.clipboard.writeText(url);
    setCopiedCycleId(cycleId);
    setTimeout(() => setCopiedCycleId(null), 2500);
  };

  const handleStatusChange = async (newStatus: 'active' | 'paused' | 'cancelled') => {
    setActionError(null);
    try {
      await updateStatus(newStatus);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: { message?: string } } } })?.response?.data?.error?.message;
      setActionError(msg || 'No se pudo actualizar el estado del abono');
    }
  };

  const handleRenew = async () => {
    setActionError(null);
    try {
      await renewCycle();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: { message?: string } } } })?.response?.data?.error?.message;
      setActionError(msg || 'No se pudo renovar el ciclo');
    }
  };

  const passenger = schedule?.passenger;
  const passengerName = passenger
    ? `${passenger.first_name || ''} ${passenger.last_name || ''}`.trim() || passenger.email
    : schedule?.passenger_user_id || schedule?.passengerUserId || 'Cliente';

  const driver = schedule?.reserved_driver || schedule?.reservedDriver;
  const driverName = driver
    ? `${driver.first_name || ''} ${driver.last_name || ''}`.trim()
    : 'Sin chofer fijo';

  const days = schedule?.days_of_week || schedule?.daysOfWeek || [];
  const time = (schedule?.time_of_day || schedule?.timeOfDay || '—').slice(0, 5);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-2xl bg-white dark:bg-dark-surface shadow-2xl flex flex-col border-l border-gray-100 dark:border-dark-border">
          {/* Header */}
          <div className="px-6 py-5 border-b border-gray-100 dark:border-dark-border flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-champagne-gold/15 text-champagne-gold flex items-center justify-center font-bold">
                AB
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold text-gray-900 dark:text-white">
                    {passengerName}
                  </h2>
                  {schedule && <RecurringTripBadge status={schedule.status} />}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 font-mono mt-0.5">
                  ID: {scheduleId}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Action Error Banner */}
          {actionError && (
            <div className="mx-6 mt-4 p-3 rounded-lg bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/40 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{actionError}</span>
            </div>
          )}

          {/* Body */}
          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
            {isLoading ? (
              <div className="space-y-4 animate-pulse">
                <div className="h-24 bg-gray-200 dark:bg-white/5 rounded-xl" />
                <div className="h-36 bg-gray-200 dark:bg-white/5 rounded-xl" />
                <div className="h-48 bg-gray-200 dark:bg-white/5 rounded-xl" />
              </div>
            ) : error ? (
              <div className="text-center py-12 text-rose-500 text-sm">
                Error al cargar el detalle del abono.
              </div>
            ) : !schedule ? null : (
              <>
                {/* Actions Toolbar */}
                <div className="flex flex-wrap items-center gap-2 p-3 bg-gray-50 dark:bg-white/[0.02] rounded-xl border border-gray-100 dark:border-dark-border">
                  <span className="text-xs font-semibold text-gray-500 uppercase mr-1">
                    Acciones:
                  </span>
                  {schedule.status === 'active' && (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleStatusChange('paused')}
                      isLoading={isUpdating}
                      className="text-xs"
                    >
                      <Pause className="w-3.5 h-3.5 mr-1 text-amber-500" />
                      Pausar Abono
                    </Button>
                  )}
                  {schedule.status === 'paused' && (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleStatusChange('active')}
                      isLoading={isUpdating}
                      className="text-xs"
                    >
                      <Play className="w-3.5 h-3.5 mr-1 text-emerald-500" />
                      Reanudar Abono
                    </Button>
                  )}
                  {schedule.status !== 'cancelled' && (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleStatusChange('cancelled')}
                      isLoading={isUpdating}
                      className="text-xs hover:text-rose-500"
                    >
                      <XCircle className="w-3.5 h-3.5 mr-1 text-rose-500" />
                      Cancelar Abono
                    </Button>
                  )}
                  {schedule.status === 'active' && (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={handleRenew}
                      isLoading={isRenewing}
                      className="text-xs ml-auto"
                    >
                      <RefreshCw className="w-3.5 h-3.5 mr-1" />
                      Renovar Ciclo Manual
                    </Button>
                  )}
                </div>

                {/* General Info Card */}
                <div className="bg-white dark:bg-dark-surface p-4 rounded-xl border border-gray-100 dark:border-dark-border space-y-3">
                  <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Datos del Abono
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-gray-400 block mb-0.5">Recorrido habitual</span>
                      <div className="text-gray-800 dark:text-gray-200 flex items-start gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-medium">{schedule.origin_address || schedule.originAddress}</p>
                          <p className="text-gray-400 text-[11px] mt-0.5">
                            ↓ {schedule.destination_address || schedule.destinationAddress}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <span className="text-gray-400 block mb-0.5">Días y Horario</span>
                      <div className="flex items-center gap-1.5 text-gray-800 dark:text-gray-200 font-medium">
                        <Clock className="w-3.5 h-3.5 text-gray-400" />
                        <span>{time} hs</span>
                      </div>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {DAYS_OF_WEEK_OPTIONS.map((day) => {
                          const isActive = days.includes(day.value);
                          return (
                            <span
                              key={day.value}
                              className={`text-[10px] px-1.5 py-0.2 rounded font-medium ${
                                isActive
                                  ? 'bg-champagne-gold/20 text-champagne-gold border border-champagne-gold/30 font-bold'
                                  : 'bg-gray-100 dark:bg-white/5 text-gray-400 opacity-50'
                              }`}
                            >
                              {day.shortLabel}
                            </span>
                          );
                        })}
                      </div>
                    </div>

                    <div>
                      <span className="text-gray-400 block mb-0.5">Tarifa por Viaje</span>
                      <p className="text-base font-bold text-gray-900 dark:text-white font-mono">
                        {formatMoney(schedule.unit_fare || schedule.unitFare, schedule.currency)}
                      </p>
                    </div>

                    <div>
                      <span className="text-gray-400 block mb-0.5">Chofer Fijo Asignado</span>
                      <div className="flex items-center gap-1.5 font-medium text-gray-800 dark:text-gray-200">
                        <Car className="w-3.5 h-3.5 text-gray-400" />
                        <span>{driverName}</span>
                      </div>
                    </div>
                  </div>

                  {schedule.notes && (
                    <div className="pt-2 border-t border-gray-100 dark:border-dark-border text-xs">
                      <span className="text-gray-400 block mb-0.5">Notas internas:</span>
                      <p className="text-gray-600 dark:text-gray-300 italic">{schedule.notes}</p>
                    </div>
                  )}
                </div>

                {/* Billing Cycles Section */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                      <CreditCard className="w-3.5 h-3.5" />
                      Ciclos de Facturación ({allCycles.length})
                    </h3>
                  </div>

                  {allCycles.length === 0 ? (
                    <div className="p-4 rounded-xl border border-dashed border-gray-200 dark:border-dark-border text-center text-xs text-gray-400">
                      No se registraron ciclos para este abono.
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      {allCycles.map((cycle, index) => {
                        const cycleNum = cycle.cycle_number || cycle.cycleNumber || index + 1;
                        const start = formatDateOnly(cycle.period_start || cycle.periodStart);
                        const end = formatDateOnly(cycle.period_end || cycle.periodEnd);
                        const amount = cycle.total_amount || cycle.totalAmount;
                        const checkout = cycle.checkout_url || cycle.checkoutUrl;

                        return (
                          <div
                            key={cycle.id}
                            className="bg-white dark:bg-dark-surface p-4 rounded-xl border border-gray-100 dark:border-dark-border space-y-2.5"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-gray-900 dark:text-white">
                                  Ciclo #{cycleNum}
                                </span>
                                <span className="text-xs text-gray-500">
                                  ({start} al {end})
                                </span>
                              </div>
                              <RecurringCycleBadge status={cycle.status} />
                            </div>

                            <div className="flex items-center justify-between text-xs pt-1 border-t border-gray-50 dark:border-white/5">
                              <div>
                                <span className="text-gray-400">Importe total: </span>
                                <span className="font-bold text-gray-900 dark:text-white font-mono text-sm">
                                  {formatMoney(amount, cycle.currency)}
                                </span>
                                <span className="text-gray-400 ml-2">
                                  ({cycle.trips_count || cycle.tripsCount || 0} viajes)
                                </span>
                              </div>

                              {checkout && (
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => handleCopyLink(checkout, cycle.id)}
                                    className="p-1.5 text-xs text-gray-500 hover:text-champagne-gold rounded hover:bg-gray-100 dark:hover:bg-white/5 transition-colors flex items-center gap-1"
                                    title="Copiar link de pago"
                                  >
                                    {copiedCycleId === cycle.id ? (
                                      <>
                                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                                        <span className="text-emerald-500 font-medium">Copiado</span>
                                      </>
                                    ) : (
                                      <>
                                        <Copy className="w-3.5 h-3.5" />
                                        <span>Copiar Link</span>
                                      </>
                                    )}
                                  </button>

                                  <a
                                    href={checkout}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-champagne-gold text-obsidian text-xs font-semibold hover:brightness-110 transition-all shadow-sm"
                                  >
                                    Pagar con MP
                                    <ExternalLink className="w-3 h-3" />
                                  </a>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Generated Trips for active cycle */}
                <div className="space-y-3">
                  <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" />
                    Viajes del Ciclo ({trips.length})
                  </h3>

                  {trips.length === 0 ? (
                    <div className="p-4 rounded-xl border border-dashed border-gray-200 dark:border-dark-border text-center text-xs text-gray-400">
                      Aún no hay viajes generados para este ciclo o están pendientes de activación.
                    </div>
                  ) : (
                    <div className="bg-white dark:bg-dark-surface rounded-xl border border-gray-100 dark:border-dark-border overflow-hidden">
                      <div className="divide-y divide-gray-100 dark:divide-dark-border max-h-60 overflow-y-auto">
                        {trips.map((trip) => {
                          const code = trip.public_code || trip.publicCode || trip.id.slice(0, 8);
                          const scheduled = trip.scheduled_at || trip.scheduledAt;
                          const fare = trip.estimated_fare || trip.estimatedFare;

                          return (
                            <div
                              key={trip.id}
                              className="p-3 flex items-center justify-between text-xs hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors"
                            >
                              <div className="space-y-0.5">
                                <div className="flex items-center gap-2">
                                  <span className="font-mono font-bold text-gray-900 dark:text-white">
                                    {code}
                                  </span>
                                  <TripsBadge status={trip.status as TripStatus} />
                                </div>
                                <p className="text-gray-500 text-[11px]">
                                  {scheduled ? formatArgentineDateTime(scheduled) : '—'}
                                </p>
                              </div>
                              <div className="font-mono font-semibold text-gray-900 dark:text-white">
                                {formatMoney(fare)}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
