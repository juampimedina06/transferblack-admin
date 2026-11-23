import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { createManualTrip } from '../../../core/trips/actions/createManualTrip.action';
import type { ScheduledTripPointFormValues } from '../../../core/scheduledTrips/scheduledTrip.api';
import { extractApiErrorMessage } from '../../../core/api/adminApi';
import { PersonPicker, type PickedPerson } from '../../components/common/PersonPicker';
import { AddressAutocompleteField } from '../../scheduledTrips/components/AddressAutocompleteField';

interface ManualTripModalProps {
  onClose: () => void;
}

/**
 * "Nuevo viaje manual": un viaje inmediato en efectivo para un pasajero que
 * llamo por telefono. Sale por el mismo camino que la app (cotiza, confirma y
 * busca conductor); para viajes con fecha y hora esta "Nueva reserva".
 */
export const ManualTripModal: React.FC<ManualTripModalProps> = ({ onClose }) => {
  const navigate = useNavigate();
  const [passenger, setPassenger] = useState<PickedPerson | null>(null);
  const [origin, setOrigin] = useState<ScheduledTripPointFormValues | null>(null);
  const [destination, setDestination] = useState<ScheduledTripPointFormValues | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = Boolean(passenger && origin && destination) && !isSubmitting;

  const submit = async () => {
    if (!passenger || !origin || !destination) return;
    setIsSubmitting(true);
    setError(null);
    try {
      const trip = await createManualTrip({ passengerUserId: passenger.id, origin, destination });
      onClose();
      navigate(`/viajes?tripId=${trip.trip_id}`);
    } catch (err) {
      setError(extractApiErrorMessage(err, 'No pudimos pedir el viaje.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" role="dialog" aria-modal="true">
      <div className="w-full max-w-lg rounded-xl bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border shadow-2xl">
        <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-dark-border">
          <div>
            <h2 className="text-base font-bold text-gray-900 dark:text-white">Nuevo viaje manual</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">Inmediato y en efectivo. Para otra fecha usá "Nueva reserva".</p>
          </div>
          <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-700 dark:hover:text-white" aria-label="Cerrar">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <PersonPicker label="Pasajero" kind="passenger" value={passenger} onChange={setPassenger} />
          <AddressAutocompleteField label="Origen" value={origin} onChange={setOrigin} />
          <AddressAutocompleteField label="Destino" value={destination} onChange={setDestination} />
          {error && <p className="text-xs text-red-600 dark:text-red-400">{error}</p>}
        </div>

        <div className="flex justify-end gap-2 p-5 border-t border-gray-100 dark:border-dark-border">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm rounded-lg border border-gray-200 dark:border-dark-border text-gray-700 dark:text-gray-200"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={submit}
            disabled={!canSubmit}
            className="px-4 py-2 text-sm font-semibold rounded-lg bg-champagne-gold text-obsidian hover:brightness-105 disabled:opacity-50"
          >
            {isSubmitting ? 'Pidiendo...' : 'Pedir viaje'}
          </button>
        </div>
      </div>
    </div>
  );
};
