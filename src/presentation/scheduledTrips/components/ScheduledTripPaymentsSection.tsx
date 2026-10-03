import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { AlertTriangle, Check, Copy, Link as LinkIcon, Wallet } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { applyServerErrors } from '../../../core/api/adminApi';
import {
  createScheduledTripPaymentLink,
  friendlyScheduledTripPaymentErrorMessage,
  registerScheduledTripTransfer,
  registerScheduledTripTransferFormFields,
  registerScheduledTripTransferFormSchema,
  type RegisterScheduledTripTransferFormValues,
  type ScheduledTripPaymentLink,
} from '../../../core/scheduledTrips/scheduledTripPayments.api';
import { useScheduledTripPayments } from '../hooks/useScheduledTripPayments';
import { Badge, Button, Input } from '../../components/common';
import { cn } from '../../utils/cn';

const PAYMENT_STATUS_BADGE: Record<string, { label: string; variant: 'success' | 'warning' | 'danger' | 'default' }> = {
  pending: { label: 'Pendiente', variant: 'warning' },
  paid: { label: 'Pagado', variant: 'success' },
  failed: { label: 'Rechazado', variant: 'danger' },
  requires_refund: { label: 'Requiere reembolso', variant: 'danger' },
};

const PAYMENT_METHOD_LABEL: Record<string, string> = {
  mercado_pago: 'Mercado Pago',
  bank_transfer: 'Transferencia',
};

function formatCurrency(amount: string, currency = 'ARS') {
  const num = parseFloat(amount);
  if (Number.isNaN(num)) return '—';
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency, minimumFractionDigits: 2 }).format(num);
}

interface ScheduledTripPaymentsSectionProps {
  tripId: string;
  agreedFare: string;
  isPrepaid: boolean;
  onPaid: () => void;
}

export function ScheduledTripPaymentsSection({ tripId, agreedFare, isPrepaid, onPaid }: ScheduledTripPaymentsSectionProps) {
  const queryClient = useQueryClient();
  const { data: payments = [], isLoading } = useScheduledTripPayments(tripId);
  const [option, setOption] = useState<'payment_link' | 'bank_transfer'>('payment_link');
  const [paymentLink, setPaymentLink] = useState<ScheduledTripPaymentLink | null>(null);
  const [copied, setCopied] = useState(false);
  const [linkError, setLinkError] = useState<string | null>(null);
  const [transferError, setTransferError] = useState<string | null>(null);

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: ['scheduled-trip-payments', tripId] });
    void queryClient.invalidateQueries({ queryKey: ['scheduled-trips'] });
  };

  const linkMutation = useMutation({
    mutationFn: () => createScheduledTripPaymentLink(tripId),
    onMutate: () => setLinkError(null),
    onSuccess: (link) => {
      setPaymentLink(link);
      setCopied(false);
      invalidate();
    },
    onError: (error) => {
      setLinkError(friendlyScheduledTripPaymentErrorMessage(error) ?? 'No se pudo generar el link de pago.');
    },
  });

  const transferForm = useForm<RegisterScheduledTripTransferFormValues>({
    resolver: zodResolver(registerScheduledTripTransferFormSchema),
    defaultValues: { amount: agreedFare, reference: '', paid_at: '' },
  });
  const transferMutation = useMutation({
    mutationFn: (values: RegisterScheduledTripTransferFormValues) => registerScheduledTripTransfer(tripId, values),
    onMutate: () => setTransferError(null),
    onSuccess: () => {
      invalidate();
      onPaid();
    },
    onError: (error) => {
      setTransferError(
        friendlyScheduledTripPaymentErrorMessage(error) ??
          applyServerErrors(error, transferForm.setError, registerScheduledTripTransferFormFields, 'No se pudo registrar la transferencia.'),
      );
    },
  });

  const copyLink = async () => {
    if (!paymentLink) return;
    try {
      await navigator.clipboard.writeText(paymentLink.checkout_url);
      setCopied(true);
    } catch {
      // El boton de copiar es una comodidad: si falla, el link sigue visible para copiarlo a mano.
    }
  };

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-gray-200/80 bg-white p-4 shadow-sm dark:border-dark-border dark:bg-dark-surface">
      <h3 className="text-sm font-bold text-gray-900 dark:text-white">Cobro por adelantado</h3>

      {isPrepaid ? (
        <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-300">
          <Check className="h-4 w-4 shrink-0" />
          Este viaje ya está pago.
        </div>
      ) : (
        <>
          <div role="tablist" aria-label="Forma de cobro" className="flex gap-1 rounded-lg border border-gray-200 p-1 dark:border-white/10">
            <button
              type="button"
              role="tab"
              aria-selected={option === 'payment_link'}
              onClick={() => setOption('payment_link')}
              className={cn(
                'flex flex-1 items-center justify-center gap-1.5 rounded-md px-3 py-2 text-[13px] font-medium transition-colors',
                option === 'payment_link'
                  ? 'bg-champagne-gold/15 text-[#9A7D3A] dark:text-champagne-gold'
                  : 'text-gray-500 hover:bg-gray-50 dark:text-white/60 dark:hover:bg-white/5',
              )}
            >
              <LinkIcon size={14} /> Link de pago
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={option === 'bank_transfer'}
              onClick={() => setOption('bank_transfer')}
              className={cn(
                'flex flex-1 items-center justify-center gap-1.5 rounded-md px-3 py-2 text-[13px] font-medium transition-colors',
                option === 'bank_transfer'
                  ? 'bg-champagne-gold/15 text-[#9A7D3A] dark:text-champagne-gold'
                  : 'text-gray-500 hover:bg-gray-50 dark:text-white/60 dark:hover:bg-white/5',
              )}
            >
              <Wallet size={14} /> Registrar transferencia
            </button>
          </div>

          {option === 'payment_link' ? (
            <div className="flex flex-col gap-3">
              <p className="text-xs text-gray-500 dark:text-white/60">
                Genera un link de Checkout Pro por {formatCurrency(agreedFare)}. Cada click usa una clave de
                idempotencia nueva.
              </p>

              {linkError && (
                <p role="alert" className="text-sm text-red-600">
                  {linkError}
                </p>
              )}

              {paymentLink && (
                <div className="rounded-lg border border-champagne-gold/40 bg-champagne-gold/10 p-3">
                  <p className="text-xs text-gray-600 dark:text-white/70">
                    Vence el {format(new Date(paymentLink.expires_at), "dd/MM/yyyy HH:mm", { locale: es })}.
                  </p>
                  <div className="mt-2 flex items-center justify-between gap-3 overflow-x-auto rounded-md bg-white p-2 dark:bg-obsidian">
                    <code className="whitespace-nowrap text-xs text-gray-800 dark:text-white/90">
                      {paymentLink.checkout_url}
                    </code>
                    <div className="flex shrink-0 gap-2">
                      <Button type="button" size="sm" variant="secondary" onClick={copyLink} leftIcon={copied ? <Check size={14} /> : <Copy size={14} />}>
                        {copied ? 'Copiado' : 'Copiar'}
                      </Button>
                      <a href={paymentLink.checkout_url} target="_blank" rel="noopener noreferrer">
                        <Button type="button" size="sm" variant="gold">
                          Abrir
                        </Button>
                      </a>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <Button type="button" variant="gold" isLoading={linkMutation.isPending} leftIcon={<LinkIcon size={15} />} onClick={() => linkMutation.mutate()}>
                  Generar link de pago
                </Button>
              </div>
            </div>
          ) : (
            <form onSubmit={transferForm.handleSubmit((values) => transferMutation.mutate(values))} className="flex flex-col gap-3">
              <Input
                label="Importe"
                inputMode="decimal"
                error={transferForm.formState.errors.amount?.message}
                helperText="Tiene que coincidir con el precio acordado."
                {...transferForm.register('amount')}
              />
              <Input
                label="Referencia"
                placeholder="Nº de comprobante"
                error={transferForm.formState.errors.reference?.message}
                {...transferForm.register('reference')}
              />
              <Input
                label="Fecha del pago"
                type="date"
                error={transferForm.formState.errors.paid_at?.message}
                {...transferForm.register('paid_at')}
              />

              {transferError && (
                <p role="alert" className="text-sm text-red-600">
                  {transferError}
                </p>
              )}

              <div>
                <Button type="submit" variant="gold" isLoading={transferMutation.isPending}>
                  Registrar transferencia
                </Button>
              </div>
            </form>
          )}
        </>
      )}

      <div className="border-t border-gray-100 pt-3 dark:border-dark-border">
        <h4 className="mb-2 text-[10.5px] font-bold uppercase tracking-wider text-gray-400">Historial de cobros</h4>
        {isLoading ? (
          <p className="text-xs text-gray-400">Cargando...</p>
        ) : payments.length === 0 ? (
          <p className="text-xs italic text-gray-400">Todavía no se registró ningún cobro.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {payments.map((payment) => {
              const badge = PAYMENT_STATUS_BADGE[payment.status] ?? { label: payment.status, variant: 'default' as const };
              return (
                <div
                  key={payment.id}
                  className="flex items-center justify-between gap-3 rounded-lg border border-gray-100 p-2.5 text-xs dark:border-dark-border"
                >
                  <div className="min-w-0">
                    <p className="font-semibold text-gray-800 dark:text-gray-200">
                      {PAYMENT_METHOD_LABEL[payment.method] ?? payment.method} · {formatCurrency(payment.amount, payment.currency)}
                    </p>
                    <p className="truncate text-[11px] text-gray-400">
                      {payment.reference ? `Ref. ${payment.reference} · ` : ''}
                      {payment.paid_at
                        ? format(new Date(payment.paid_at), "dd/MM/yyyy HH:mm", { locale: es })
                        : format(new Date(payment.created_at), "dd/MM/yyyy HH:mm", { locale: es })}
                    </p>
                  </div>
                  <Badge variant={badge.variant}>{badge.label}</Badge>
                </div>
              );
            })}
            {payments.some((payment) => payment.status === 'requires_refund') && (
              <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-2.5 text-xs text-red-700 dark:border-red-900/50 dark:bg-red-950/20 dark:text-red-400">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                Hay un cobro duplicado: reembolsalo a mano en Mercado Pago, esto no lo hace automático.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
