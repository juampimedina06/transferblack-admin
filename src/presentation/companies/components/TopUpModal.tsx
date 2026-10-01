import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { Check, Copy, Link as LinkIcon, Wallet } from 'lucide-react';
import { applyServerErrors } from '../../../core/api/adminApi';
import {
  createTopUpPaymentLink,
  friendlyTopUpErrorMessage,
  registerTopUpManualTransfer,
  registerTopUpManualTransferFormFields,
  registerTopUpManualTransferFormSchema,
  topUpPaymentLinkFormFields,
  topUpPaymentLinkFormSchema,
  type RegisterTopUpManualTransferFormValues,
  type TopUpPaymentLink,
  type TopUpPaymentLinkFormValues,
} from '../../../core/companies/companyTopUps.api';
import { Button, Input } from '../../components/common';
import { cn } from '../../utils/cn';
import { formatArgentineDateTime } from '../utils/formatArgentineDate';
import { Modal } from './Modal';

type TopUpOption = 'payment_link' | 'bank_transfer';

function optionTabClass(active: boolean) {
  return cn(
    'flex flex-1 items-center justify-center gap-1.5 rounded-md px-3 py-2 text-[13px] font-medium transition-colors',
    active
      ? 'bg-champagne-gold/15 text-[#9A7D3A] dark:text-champagne-gold'
      : 'text-gray-500 hover:bg-gray-50 dark:text-white/60 dark:hover:bg-white/5',
  );
}

export function TopUpModal({ companyId, onClose }: { companyId: string; onClose: () => void }) {
  const queryClient = useQueryClient();
  const [option, setOption] = useState<TopUpOption>('payment_link');
  const [paymentLink, setPaymentLink] = useState<TopUpPaymentLink | null>(null);
  const [copied, setCopied] = useState(false);
  const [linkError, setLinkError] = useState<string | null>(null);
  const [transferError, setTransferError] = useState<string | null>(null);

  const invalidateAfterTopUp = () => {
    void queryClient.invalidateQueries({ queryKey: ['company-balance', companyId] });
    void queryClient.invalidateQueries({ queryKey: ['company-top-ups', companyId] });
    void queryClient.invalidateQueries({ queryKey: ['company', companyId] });
    void queryClient.invalidateQueries({ queryKey: ['companies'] });
  };

  const linkForm = useForm<TopUpPaymentLinkFormValues>({
    resolver: zodResolver(topUpPaymentLinkFormSchema),
    defaultValues: { amount: '' },
  });
  const linkMutation = useMutation({
    mutationFn: (values: TopUpPaymentLinkFormValues) => createTopUpPaymentLink(companyId, values),
    onMutate: () => setLinkError(null),
    onSuccess: (link) => {
      setPaymentLink(link);
      setCopied(false);
      invalidateAfterTopUp();
    },
    onError: (error) => {
      setLinkError(
        friendlyTopUpErrorMessage(error) ??
          applyServerErrors(error, linkForm.setError, topUpPaymentLinkFormFields, 'No se pudo generar el link de pago.'),
      );
    },
  });

  const transferForm = useForm<RegisterTopUpManualTransferFormValues>({
    resolver: zodResolver(registerTopUpManualTransferFormSchema),
  });
  const transferMutation = useMutation({
    mutationFn: (values: RegisterTopUpManualTransferFormValues) => registerTopUpManualTransfer(companyId, values),
    onMutate: () => setTransferError(null),
    onSuccess: () => {
      invalidateAfterTopUp();
      onClose();
    },
    onError: (error) => {
      setTransferError(
        friendlyTopUpErrorMessage(error) ??
          applyServerErrors(
            error,
            transferForm.setError,
            registerTopUpManualTransferFormFields,
            'No se pudo registrar la carga.',
          ),
      );
    },
  });

  const copyLink = async () => {
    if (!paymentLink) return;
    try {
      await navigator.clipboard.writeText(paymentLink.checkout_url);
      setCopied(true);
    } catch {
      // El botón de copiar es una comodidad: si falla, el link sigue visible para copiarlo a mano.
    }
  };

  return (
    <Modal title="Cargar saldo" onClose={onClose}>
      <div className="flex flex-col gap-5 p-5">
        <div
          role="tablist"
          aria-label="Forma de carga"
          className="flex gap-1 rounded-lg border border-gray-200 p-1 dark:border-white/10"
        >
          <button
            type="button"
            role="tab"
            aria-selected={option === 'payment_link'}
            onClick={() => setOption('payment_link')}
            className={optionTabClass(option === 'payment_link')}
          >
            <LinkIcon size={14} /> Link de pago
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={option === 'bank_transfer'}
            onClick={() => setOption('bank_transfer')}
            className={optionTabClass(option === 'bank_transfer')}
          >
            <Wallet size={14} /> Registrar transferencia
          </button>
        </div>

        {option === 'payment_link' ? (
          <form
            onSubmit={linkForm.handleSubmit((values) => linkMutation.mutate(values))}
            className="flex flex-col gap-4"
          >
            <Input
              label="Importe"
              inputMode="decimal"
              placeholder="Ej. 50000.00"
              autoFocus
              error={linkForm.formState.errors.amount?.message}
              {...linkForm.register('amount')}
            />

            {linkError && (
              <p role="alert" className="text-sm text-red-600">
                {linkError}
              </p>
            )}

            {paymentLink && (
              <div className="rounded-lg border border-champagne-gold/40 bg-champagne-gold/10 p-4">
                <p className="text-xs text-gray-600 dark:text-white/70">
                  Vence el {formatArgentineDateTime(paymentLink.expires_at)}. Generar un link nuevo vence a este.
                </p>
                <div className="mt-2 flex items-center justify-between gap-3 overflow-x-auto rounded-md bg-white p-2 dark:bg-obsidian">
                  <code className="whitespace-nowrap text-xs text-gray-800 dark:text-white/90">
                    {paymentLink.checkout_url}
                  </code>
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    onClick={copyLink}
                    leftIcon={copied ? <Check size={14} /> : <Copy size={14} />}
                  >
                    {copied ? 'Copiado' : 'Copiar'}
                  </Button>
                </div>
              </div>
            )}

            <div className="flex justify-end gap-3 border-t border-gray-100 pt-4 dark:border-white/10">
              <Button type="button" variant="secondary" onClick={onClose}>
                {paymentLink ? 'Cerrar' : 'Cancelar'}
              </Button>
              <Button type="submit" variant="gold" isLoading={linkMutation.isPending} leftIcon={<LinkIcon size={15} />}>
                Generar link
              </Button>
            </div>
          </form>
        ) : (
          <form
            onSubmit={transferForm.handleSubmit((values) => transferMutation.mutate(values))}
            className="grid gap-4 sm:grid-cols-3"
          >
            <Input
              label="Importe"
              inputMode="decimal"
              placeholder="Ej. 50000.00"
              autoFocus
              error={transferForm.formState.errors.amount?.message}
              {...transferForm.register('amount')}
            />
            <Input
              label="Referencia"
              placeholder="Nº de comprobante"
              error={transferForm.formState.errors.reference?.message}
              {...transferForm.register('reference')}
            />
            <Input
              label="Fecha"
              type="date"
              error={transferForm.formState.errors.paid_at?.message}
              {...transferForm.register('paid_at')}
            />

            {transferError && (
              <p role="alert" className="text-sm text-red-600 sm:col-span-3">
                {transferError}
              </p>
            )}

            <div className="flex justify-end gap-3 border-t border-gray-100 pt-4 sm:col-span-3 dark:border-white/10">
              <Button type="button" variant="secondary" onClick={onClose}>
                Cancelar
              </Button>
              <Button type="submit" variant="gold" isLoading={transferMutation.isPending}>
                Registrar carga
              </Button>
            </div>
          </form>
        )}
      </div>
    </Modal>
  );
}
