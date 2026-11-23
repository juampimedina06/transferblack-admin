import React, { useEffect, useState } from 'react';
import { AlertTriangle, Loader2, X } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';

import { cancelTrip, getCancellationPreview, type CancellationPreview } from '../../../core/trips/actions/cancelTrip.action';
import { extractApiErrorMessage } from '../../../core/api/adminApi';

const REASONS: { code: string; label: string }[] = [
  { code: 'admin_passenger_request', label: 'El pasajero lo pidió por teléfono' },
  { code: 'admin_no_driver', label: 'No hay conductores disponibles' },
  { code: 'admin_driver_issue', label: 'Problema con el conductor o el vehículo' },
  { code: 'admin_duplicate', label: 'Viaje duplicado o de prueba' },
  { code: 'admin_other', label: 'Otro motivo' },
];

const REFUND_MODE_TEXT: Record<CancellationPreview['refund_mode'], string> = {
  automatic: 'El reintegro a Mercado Pago es automático.',
  claim: 'El reintegro queda como reclamo: se resuelve a mano en "Reclamos de reembolso".',
  none: 'No hay nada que reintegrar.',
};

const money = (amount: string, currency: string) =>
  new Intl.NumberFormat('es-AR', { style: 'currency', currency, maximumFractionDigits: 0 }).format(Number(amount));

interface CancelTripDialogProps {
  tripId: string;
  publicCode: string;
  onClose: () => void;
}

/** Cancelar un viaje desde el panel: motivo, qué pasa con la plata y confirmación. */
export const CancelTripDialog: React.FC<CancelTripDialogProps> = ({ tripId, publicCode, onClose }) => {
  const queryClient = useQueryClient();
  const [preview, setPreview] = useState<CancellationPreview | null>(null);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [reason, setReason] = useState(REASONS[0]!.code);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    getCancellationPreview(tripId)
      .then((result) => {
        if (!cancelled) setPreview(result);
      })
      .catch((error) => {
        if (!cancelled) setPreviewError(extractApiErrorMessage(error, 'No pudimos calcular la cancelación.'));
      });
    return () => {
      cancelled = true;
    };
  }, [tripId]);

  const submit = async () => {
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      await cancelTrip(tripId, reason, notes.trim() || undefined);
      await queryClient.invalidateQueries();
      onClose();
    } catch (error) {
      setSubmitError(extractApiErrorMessage(error, 'No pudimos cancelar el viaje.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const refund = preview ? Number(preview.refund_amount) : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" role="dialog" aria-modal="true">
      <div className="w-full max-w-md rounded-xl bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border shadow-2xl">
        <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-dark-border">
          <h2 className="text-base font-bold text-gray-900 dark:text-white">Cancelar viaje {publicCode}</h2>
          <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-700 dark:hover:text-white" aria-label="Cerrar">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4 text-sm">
          <div className="rounded-lg border border-amber-200 dark:border-amber-900/60 bg-amber-50 dark:bg-amber-950/30 p-3 text-xs text-amber-900 dark:text-amber-200 space-y-1">
            {!preview && !previewError && (
              <p className="flex items-center gap-2">
                <Loader2 className="w-3.5 h-3.5 animate-spin" /> Calculando qué pasa con el pago...
              </p>
            )}
            {previewError && <p>{previewError}</p>}
            {preview && (
              <>
                <p className="flex items-center gap-1.5 font-semibold">
                  <AlertTriangle className="w-3.5 h-3.5" /> Qué va a pasar
                </p>
                <p>Se avisa al pasajero y al conductor. Si tiene conductor asignado, queda libre.</p>
                <p>
                  {refund > 0
                    ? `Reintegro: ${money(preview.refund_amount, preview.currency)}. ${REFUND_MODE_TEXT[preview.refund_mode]}`
                    : REFUND_MODE_TEXT.none}
                </p>
                {Number(preview.penalty_amount) > 0 && <p>Penalidad: {money(preview.penalty_amount, preview.currency)}.</p>}
              </>
            )}
          </div>

          <label className="block space-y-1">
            <span className="text-xs font-semibold text-gray-600 dark:text-gray-300">Motivo</span>
            <select
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-card text-gray-900 dark:text-white"
            >
              {REASONS.map((option) => (
                <option key={option.code} value={option.code}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label className="block space-y-1">
            <span className="text-xs font-semibold text-gray-600 dark:text-gray-300">Nota (opcional)</span>
            <textarea
              value={notes}
              maxLength={500}
              rows={2}
              onChange={(event) => setNotes(event.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-card text-gray-900 dark:text-white"
            />
          </label>

          {submitError && <p className="text-xs text-red-600 dark:text-red-400">{submitError}</p>}
        </div>

        <div className="flex justify-end gap-2 p-5 border-t border-gray-100 dark:border-dark-border">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm rounded-lg border border-gray-200 dark:border-dark-border text-gray-700 dark:text-gray-200"
          >
            Volver
          </button>
          <button
            type="button"
            onClick={submit}
            disabled={isSubmitting || Boolean(previewError) || !preview}
            className="px-4 py-2 text-sm font-semibold rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
          >
            {isSubmitting ? 'Cancelando...' : 'Cancelar viaje'}
          </button>
        </div>
      </div>
    </div>
  );
};
