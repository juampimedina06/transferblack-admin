import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Save, Users, X } from 'lucide-react';
import { extractApiErrorMessage } from '../../../core/api/adminApi';
import {
  cancelScheduledTrip,
  friendlyScheduledTripErrorMessage,
  scheduledTripCancellationReasons,
  updateScheduledTrip,
  type ScheduledTrip,
  type UpdateScheduledTripPayload,
} from '../../../core/scheduledTrips/scheduledTrip.api';
import { formatArgentineDateTime, fromArgentineIso, toArgentineIso } from '../../../core/scheduledTrips/shared';
import { TripsBadge } from '../../trips/components/TripsBadge';
import { Button, Input, Textarea } from '../../components/common';
import { DriverPickerSelect } from './DriverPickerSelect';
import { RouteMapPreview } from './RouteMapPreview';
import { ScheduledTripPaymentsSection } from './ScheduledTripPaymentsSection';

interface ScheduledTripDetailDrawerProps {
  trip: ScheduledTrip;
  onClose: () => void;
  onUpdated: (trip: ScheduledTrip) => void;
  onCancelled: () => void;
}

const ACTIVATED_STATUSES = new Set(['searching', 'assigned', 'driver_arriving', 'driver_arrived', 'in_progress', 'completed']);

function formatCurrency(amount: string, currency = 'ARS') {
  const num = parseFloat(amount);
  if (Number.isNaN(num)) return '—';
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency, minimumFractionDigits: 2 }).format(num);
}

export function ScheduledTripDetailDrawer({ trip, onClose, onUpdated, onCancelled }: ScheduledTripDetailDrawerProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEditable = trip.status === 'scheduled';
  const isActivated = ACTIVATED_STATUSES.has(trip.status);

  const initialScheduled = fromArgentineIso(trip.scheduled_at);
  const [scheduledDate, setScheduledDate] = useState(initialScheduled.date);
  const [scheduledTime, setScheduledTime] = useState(initialScheduled.time);
  const [reservedDriverId, setReservedDriverId] = useState<string | null>(trip.reserved_driver?.id ?? null);
  const [notes, setNotes] = useState(trip.notes ?? '');
  const [editError, setEditError] = useState<string | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelError, setCancelError] = useState<string | null>(null);

  const invalidateList = () => void queryClient.invalidateQueries({ queryKey: ['scheduled-trips'] });

  const originalDriverId = trip.reserved_driver?.id ?? null;
  const normalizedNotes = notes.trim() === '' ? null : notes;
  const newScheduledAt = toArgentineIso(scheduledDate, scheduledTime);
  const hasScheduledAtChanged = new Date(newScheduledAt).getTime() !== new Date(trip.scheduled_at).getTime();
  const hasDriverChanged = reservedDriverId !== originalDriverId;
  const hasNotesChanged = normalizedNotes !== trip.notes;
  const hasChanges = hasScheduledAtChanged || hasDriverChanged || hasNotesChanged;

  const updateMutation = useMutation({
    mutationFn: () => {
      // Solo se manda lo que cambio: repetir `scheduled_at` sin tocarlo puede
      // chocar con la validacion de anticipacion minima del backend si el
      // viaje ya esta cerca de la hora de retiro.
      const payload: UpdateScheduledTripPayload = {};
      if (hasScheduledAtChanged) payload.scheduled_at = newScheduledAt;
      if (hasDriverChanged) payload.reserved_driver_id = reservedDriverId;
      if (hasNotesChanged) payload.notes = normalizedNotes;
      return updateScheduledTrip(trip.id, payload);
    },
    onMutate: () => setEditError(null),
    onSuccess: (updated) => {
      invalidateList();
      onUpdated(updated);
    },
    onError: (error) => {
      setEditError(friendlyScheduledTripErrorMessage(error) ?? 'No se pudieron guardar los cambios.');
    },
  });

  const cancelMutation = useMutation({
    mutationFn: () => cancelScheduledTrip(trip.id, { reason_code: cancelReason }),
    onMutate: () => setCancelError(null),
    onSuccess: () => {
      invalidateList();
      onCancelled();
    },
    onError: (error) => {
      setCancelError(
        friendlyScheduledTripErrorMessage(error) ?? extractApiErrorMessage(error, 'No se pudo cancelar el viaje reservado.'),
      );
    },
  });

  return (
    <div className="w-full animate-fade-in space-y-5">
      <div className="flex flex-col gap-4 rounded-xl border border-gray-200/80 bg-white p-5 shadow-sm dark:border-dark-border dark:bg-dark-surface lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="-ml-1 flex items-center gap-1.5 rounded-lg p-1.5 text-xs font-semibold text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" /> Volver
            </button>
            <h2 className="text-xl font-extrabold tracking-tight text-gray-900 dark:text-white">{trip.public_code}</h2>
            <TripsBadge status={trip.status} />
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Retiro: {formatArgentineDateTime(trip.scheduled_at)} · Precio acordado:{' '}
            {formatCurrency(trip.agreed_fare, trip.currency)}
          </p>
        </div>

        <div className="flex items-center gap-2 self-end lg:self-center">
          {isActivated && (
            <Button type="button" variant="secondary" size="sm" onClick={() => navigate(`/viajes?tripId=${trip.id}`)}>
              Ver seguimiento del viaje
            </Button>
          )}
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar detalle"
            className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-white/5 dark:hover:text-gray-200"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
        <div className="space-y-5 lg:col-span-7">
          <div className="space-y-3 rounded-xl border border-gray-200/80 bg-white p-4 shadow-sm dark:border-dark-border dark:bg-dark-surface">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white">Pasajero</h3>
            <div>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">
                {trip.passenger.first_name} {trip.passenger.last_name}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {trip.passenger.email} {trip.passenger.phone ? `· ${trip.passenger.phone}` : ''}
              </p>
            </div>
          </div>

          <div className="space-y-3 rounded-xl border border-gray-200/80 bg-white p-4 shadow-sm dark:border-dark-border dark:bg-dark-surface">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white">Recorrido</h3>
            <RouteMapPreview origin={trip.origin} destination={trip.destination} />
            <div className="space-y-2 text-xs">
              <div className="flex items-start gap-2">
                <div className="mt-0.5 h-3 w-3 shrink-0 rounded-full border-2 border-gray-800 dark:border-white" />
                <span className="text-gray-700 dark:text-gray-300">{trip.origin.address}</span>
              </div>
              <div className="flex items-start gap-2">
                <div className="mt-0.5 h-3 w-3 shrink-0 rounded-sm bg-amber-600" />
                <span className="text-gray-700 dark:text-gray-300">{trip.destination.address}</span>
              </div>
            </div>
          </div>

          {isEditable ? (
            <div className="space-y-3 rounded-xl border border-gray-200/80 bg-white p-4 shadow-sm dark:border-dark-border dark:bg-dark-surface">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">Editar reserva</h3>
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Fecha de retiro"
                  type="date"
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                />
                <Input
                  label="Hora de retiro"
                  type="time"
                  value={scheduledTime}
                  onChange={(e) => setScheduledTime(e.target.value)}
                />
              </div>
              <DriverPickerSelect value={reservedDriverId} onChange={setReservedDriverId} />
              <Textarea label="Notas" value={notes} onChange={(e) => setNotes(e.target.value)} />

              {editError && (
                <p role="alert" className="text-sm text-red-600">
                  {editError}
                </p>
              )}

              <Button
                type="button"
                variant="gold"
                leftIcon={<Save size={15} />}
                isLoading={updateMutation.isPending}
                disabled={!hasChanges}
                onClick={() => updateMutation.mutate()}
              >
                Guardar cambios
              </Button>
            </div>
          ) : (
            <div className="rounded-xl border border-gray-200/80 bg-white p-4 shadow-sm dark:border-dark-border dark:bg-dark-surface">
              <h3 className="mb-1 text-sm font-bold text-gray-900 dark:text-white">Notas</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">{trip.notes || 'Sin notas.'}</p>
              <p className="mt-2 text-[11px] italic text-gray-400">
                Este viaje ya se activó: la edición y la cancelación desde acá solo están disponibles mientras sigue
                "Programado".
              </p>
            </div>
          )}

          {trip.status === 'scheduled' || trip.status === 'searching' || trip.status === 'assigned' ? (
            <div className="space-y-3 rounded-xl border border-red-200 bg-red-50/40 p-4 dark:border-red-900/40 dark:bg-red-950/10">
              <h3 className="text-sm font-bold text-red-700 dark:text-red-400">Cancelar reserva</h3>
              {!isCancelling ? (
                <Button type="button" variant="dangerOutline" size="sm" onClick={() => setIsCancelling(true)}>
                  Cancelar este viaje reservado
                </Button>
              ) : (
                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-[10.5px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                      Motivo
                    </label>
                    <select
                      value={cancelReason}
                      onChange={(e) => setCancelReason(e.target.value)}
                      className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs text-gray-800 dark:border-dark-border dark:bg-dark-card dark:text-gray-200"
                    >
                      <option value="">Elegí un motivo</option>
                      {scheduledTripCancellationReasons.map((reason) => (
                        <option key={reason.value} value={reason.value}>
                          {reason.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {cancelError && (
                    <p role="alert" className="text-sm text-red-600">
                      {cancelError}
                    </p>
                  )}

                  <div className="flex gap-2">
                    <Button type="button" variant="secondary" size="sm" onClick={() => setIsCancelling(false)} disabled={cancelMutation.isPending}>
                      Volver
                    </Button>
                    <Button
                      type="button"
                      variant="danger"
                      size="sm"
                      isLoading={cancelMutation.isPending}
                      disabled={!cancelReason}
                      onClick={() => cancelMutation.mutate()}
                    >
                      Confirmar cancelación
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ) : null}
        </div>

        <div className="space-y-5 lg:col-span-5">
          {trip.reserved_driver && (
            <div className="space-y-3 rounded-xl border border-gray-200/80 bg-white p-4 shadow-sm dark:border-dark-border dark:bg-dark-surface">
              <h3 className="flex items-center gap-1.5 text-sm font-bold text-gray-900 dark:text-white">
                <Users className="h-4 w-4 text-champagne-gold" /> Chofer reservado
              </h3>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">
                {trip.reserved_driver.first_name} {trip.reserved_driver.last_name}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{trip.reserved_driver.phone || 'Sin teléfono'}</p>
              {trip.reserved_driver.vehicle && (
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {trip.reserved_driver.vehicle.brand} {trip.reserved_driver.vehicle.model} ·{' '}
                  {trip.reserved_driver.vehicle.plate}
                </p>
              )}
            </div>
          )}

          <ScheduledTripPaymentsSection
            tripId={trip.id}
            agreedFare={trip.agreed_fare}
            isPrepaid={Boolean(trip.prepaid_at)}
            onPaid={() => onUpdated({ ...trip, prepaid_at: new Date().toISOString() })}
          />
        </div>
      </div>
    </div>
  );
}
