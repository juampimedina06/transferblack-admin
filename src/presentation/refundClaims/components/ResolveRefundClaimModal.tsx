import React, { useEffect, useRef, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { AlertTriangle, Landmark, RotateCcw, Wallet } from 'lucide-react';
import {
  canAttemptMercadoPagoRefund,
  extractErrorCode,
  friendlyRefundErrorMessage,
  isRetryableWithSameKey,
  paymentMethodLabel,
  type RefundClaim,
  type RefundResolutionMode,
  type ResolveRefundClaimPayload,
} from '../../../core/refundClaims/refundClaim.api';
import { extractApiErrorMessage } from '../../../core/api/adminApi';
import { useResolveRefundClaim } from '../hooks/useResolveRefundClaim';
import { Button, Input, Textarea } from '../../components/common';
import { Modal } from '../../companies/components/Modal';
import { cn } from '../../utils/cn';

interface ResolveRefundClaimModalProps {
  claim: RefundClaim | null;
  isOpen: boolean;
  onClose: () => void;
  onResolved?: () => void;
}

const moneyAmount = z
  .string()
  .trim()
  .regex(/^\d{1,10}(\.\d{1,2})?$/, 'Ingresá un importe positivo con hasta 2 decimales')
  .refine((value) => Number(value) > 0, 'Ingresá un importe positivo con hasta 2 decimales');

function buildFormSchema(maxAmount: number) {
  return z
    .object({
      mode: z.enum(['mercado_pago', 'manual']),
      amount: moneyAmount.refine(
        (value) => Number(value) <= maxAmount,
        `El importe no puede superar lo pendiente de reembolso ($${maxAmount.toFixed(2)})`,
      ),
      reference: z.string().trim().max(150).optional().or(z.literal('')),
      notes: z.string().trim().max(500).optional().or(z.literal('')),
    })
    .refine((data) => data.mode !== 'manual' || Boolean(data.reference?.trim()), {
      message: 'La referencia es obligatoria para una devolución manual',
      path: ['reference'],
    });
}

type FormValues = z.infer<ReturnType<typeof buildFormSchema>>;

function formatMoney(amount: string, currency: string): string {
  const value = Number.parseFloat(amount) || 0;
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency: currency || 'ARS' }).format(value);
}

export const ResolveRefundClaimModal: React.FC<ResolveRefundClaimModalProps> = ({
  claim,
  isOpen,
  onClose,
  onResolved,
}) => {
  const resolveMutation = useResolveRefundClaim();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [canRetrySameAttempt, setCanRetrySameAttempt] = useState(false);

  const idempotencyKeyRef = useRef<string>(crypto.randomUUID());
  const lastAttemptRef = useRef<{ amount: string; mode: RefundResolutionMode } | null>(null);
  const lastErrorRetryableRef = useRef(false);

  const mpEligible = claim ? canAttemptMercadoPagoRefund(claim) : false;
  // El pendiente real (`pendingAmount`) es lo que de verdad queda por
  // devolver: si ya hubo una resolucion parcial que esta lista no conocia,
  // `amount` (el total reclamado original) ya no sirve de default ni de
  // tope. Si el backend desplegado todavia no manda `pendingAmount`, se cae
  // al reclamado original (mismo comportamiento de antes).
  const pendingAmount = claim ? claim.pendingAmount ?? claim.amount : '0';
  const maxAmount = claim ? Number.parseFloat(pendingAmount) || 0 : 0;

  const form = useForm<FormValues>({
    resolver: zodResolver(buildFormSchema(maxAmount)),
    defaultValues: { mode: 'manual', amount: '', reference: '', notes: '' },
  });

  // Reset completo al abrir (o cambiar de reclamo): nueva Idempotency-Key,
  // formulario con los valores por defecto de este reclamo puntual.
  useEffect(() => {
    if (isOpen && claim) {
      idempotencyKeyRef.current = crypto.randomUUID();
      lastAttemptRef.current = null;
      lastErrorRetryableRef.current = false;
      setErrorMessage(null);
      setCanRetrySameAttempt(false);
      form.reset({
        mode: mpEligible ? 'mercado_pago' : 'manual',
        amount: pendingAmount,
        reference: '',
        notes: '',
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, claim?.tripId]);

  if (!isOpen || !claim) return null;

  const selectedMode = form.watch('mode');
  const watchedAmount = form.watch('amount');

  /**
   * Una Idempotency-Key por intento de resolucion, no por click: si el
   * reintento manda exactamente el mismo monto/modo que el intento anterior
   * y ese intento fallo con un error "en vuelo" (`REFUND_PROCESSING`,
   * `PAYMENT_PROVIDER_UNAVAILABLE`, o sin respuesta del backend), se reusa
   * la misma clave para no duplicar el reembolso ante Mercado Pago. Si el
   * admin cambia el monto o el modo, o el intento anterior se resolvio bien
   * o fallo por otro motivo, se pide una clave nueva.
   */
  function resolveIdempotencyKey(amount: string, mode: RefundResolutionMode): string {
    const last = lastAttemptRef.current;
    const sameParams = Boolean(last && last.amount === amount && last.mode === mode);
    if (sameParams && lastErrorRetryableRef.current) {
      return idempotencyKeyRef.current;
    }
    const newKey = crypto.randomUUID();
    idempotencyKeyRef.current = newKey;
    lastAttemptRef.current = { amount, mode };
    lastErrorRetryableRef.current = false;
    return newKey;
  }

  const submit = async (values: FormValues) => {
    if (!claim) return;
    setErrorMessage(null);
    setCanRetrySameAttempt(false);

    const key = resolveIdempotencyKey(values.amount, values.mode);
    // Sin cambios respecto al pendiente por defecto, se omite `amount`: el
    // backend reintegra todo lo pendiente de verdad (fuente de verdad, por
    // si otra resolucion parcial paso entre que se cargo la lista y este
    // envio).
    const isUnchangedAmount = Number(values.amount) === Number(pendingAmount);
    const payload: ResolveRefundClaimPayload = {
      mode: values.mode,
      ...(isUnchangedAmount ? {} : { amount: values.amount }),
      ...(values.mode === 'manual' && values.reference ? { reference: values.reference.trim() } : {}),
      ...(values.notes ? { notes: values.notes.trim() } : {}),
    };

    try {
      await resolveMutation.mutateAsync({ tripId: claim.tripId, idempotencyKey: key, payload });
      // Reset total del intento: ni esta clave ni este monto/modo quedan
      // disponibles para un "Reintentar" desde un modal que por algun motivo
      // no llego a cerrarse (el reembolso ya se hizo, con o sin detalle
      // verificado — ver `resolveRefundClaim`).
      lastAttemptRef.current = null;
      lastErrorRetryableRef.current = false;
      setCanRetrySameAttempt(false);
      onResolved?.();
      onClose();
    } catch (error) {
      const retryable = isRetryableWithSameKey(error);
      lastErrorRetryableRef.current = retryable;
      setCanRetrySameAttempt(retryable);

      const code = extractErrorCode(error);
      if (code === 'REFUND_REQUIRES_MANUAL_MODE') {
        form.setValue('mode', 'manual');
      }
      if (code === 'REFUND_AMOUNT_EXCEEDS_CLAIM') {
        const details = (error as { response?: { data?: { error?: { details?: { pending?: string } } } } })
          ?.response?.data?.error?.details;
        if (details?.pending) {
          form.setValue('amount', details.pending);
        }
      }

      setErrorMessage(
        friendlyRefundErrorMessage(error) ?? extractApiErrorMessage(error, 'No se pudo resolver el reclamo.'),
      );
    }
  };

  const confirmationText =
    selectedMode === 'mercado_pago'
      ? `Se devolverán ${formatMoney(watchedAmount || pendingAmount, claim.currency)} al pasajero por Mercado Pago.`
      : `Se registrará una devolución manual de ${formatMoney(watchedAmount || pendingAmount, claim.currency)} al pasajero.`;

  return (
    <Modal title="Resolver reclamo de reembolso" onClose={onClose} dismissible={!resolveMutation.isPending}>
      <div className="px-6 pt-4">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Viaje {claim.tripPublicCode} • {paymentMethodLabel(claim.paymentMethod)} •{' '}
          {formatMoney(pendingAmount, claim.currency)} pendiente
        </p>
      </div>

      <form onSubmit={form.handleSubmit(submit)} className="p-6 pt-2 space-y-4">
        {/* Selector de modo */}
        <div>
          <span className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
            ¿Cómo se devuelve?
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <button
              type="button"
              disabled={!mpEligible}
              onClick={() => form.setValue('mode', 'mercado_pago')}
              title={
                mpEligible
                  ? undefined
                  : 'Este cobro no entró por Mercado Pago: solo se puede resolver en modo manual.'
              }
              className={cn(
                'flex items-center gap-2 rounded-lg border px-3 py-2.5 text-sm font-medium transition-colors text-left',
                selectedMode === 'mercado_pago'
                  ? 'border-champagne-gold bg-champagne-gold/10 text-[#9A7D3A] dark:text-champagne-gold'
                  : 'border-gray-200 dark:border-dark-border text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5',
                !mpEligible && 'opacity-50 cursor-not-allowed',
              )}
            >
              <Wallet className="w-4 h-4 shrink-0" />
              Devolver por Mercado Pago
            </button>
            <button
              type="button"
              onClick={() => form.setValue('mode', 'manual')}
              className={cn(
                'flex items-center gap-2 rounded-lg border px-3 py-2.5 text-sm font-medium transition-colors text-left',
                selectedMode === 'manual'
                  ? 'border-champagne-gold bg-champagne-gold/10 text-[#9A7D3A] dark:text-champagne-gold'
                  : 'border-gray-200 dark:border-dark-border text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5',
              )}
            >
              <Landmark className="w-4 h-4 shrink-0" />
              Registrar devolución manual
            </button>
          </div>
          {!mpEligible && (
            <p className="mt-1.5 text-[11px] text-gray-400 dark:text-gray-500">
              El cobro de este viaje fue por {paymentMethodLabel(claim.paymentMethod).toLowerCase()}, no por
              Mercado Pago.
            </p>
          )}
        </div>

        <Input
          label="Importe a devolver"
          inputMode="decimal"
          error={form.formState.errors.amount?.message}
          helperText={`Lo pendiente de reembolso es ${formatMoney(pendingAmount, claim.currency)}. Dejalo igual para devolver todo lo pendiente.`}
          {...form.register('amount')}
        />

        {selectedMode === 'manual' && (
          <Input
            label="Referencia de la transferencia"
            placeholder="Ej: nº de operación o CBU de destino"
            error={form.formState.errors.reference?.message}
            {...form.register('reference')}
          />
        )}

        <Textarea
          label="Notas (opcional)"
          rows={3}
          placeholder="Detalle interno de la resolución…"
          error={form.formState.errors.notes?.message}
          {...form.register('notes')}
        />

        <div className="rounded-lg border border-champagne-gold/40 bg-champagne-gold/10 p-3 text-xs text-gray-700 dark:text-white/80">
          {confirmationText}
        </div>

        {errorMessage && (
          <div className="p-3 text-xs font-medium text-red-700 bg-red-50 dark:bg-red-950/40 dark:text-red-400 border border-red-200 dark:border-red-800/40 rounded-lg flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <div className="flex-1 flex flex-col gap-1.5">
              <span>{errorMessage}</span>
              {canRetrySameAttempt && (
                <button
                  type="button"
                  onClick={form.handleSubmit(submit)}
                  className="inline-flex items-center gap-1.5 self-start text-xs font-bold text-red-700 dark:text-red-300 hover:underline"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Reintentar
                </button>
              )}
            </div>
          </div>
        )}

        <div className="flex items-center justify-end gap-3 pt-2 border-t border-gray-100 dark:border-dark-border">
          <Button type="button" variant="secondary" onClick={onClose} disabled={resolveMutation.isPending}>
            Cancelar
          </Button>
          <Button type="submit" variant="gold" isLoading={resolveMutation.isPending}>
            Confirmar devolución
          </Button>
        </div>
      </form>
    </Modal>
  );
};
