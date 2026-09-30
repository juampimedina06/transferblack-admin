import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { Check, Copy, Inbox, Link as LinkIcon, Wallet } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { extractApiErrorMessage } from '../../../core/api/adminApi';
import {
  createStatementPaymentLink,
  getStatementDetail,
  registerManualPayment,
  registerManualPaymentFormSchema,
  type PaymentLink,
  type RegisterManualPaymentFormValues,
} from '../../../core/companies/companyStatements.api';
import { Badge, Button, Input } from '../../components/common';
import { Modal } from './Modal';

const lineTypeLabel: Record<string, string> = { trip: 'Viaje', cancellation_penalty: 'Penalidad de cancelación' };

export function StatementDetailModal({
  statementId,
  companyId,
  onClose,
}: {
  statementId: string;
  companyId: string;
  onClose: () => void;
}) {
  const queryClient = useQueryClient();
  const [showTransferForm, setShowTransferForm] = useState(false);
  const [paymentLink, setPaymentLink] = useState<PaymentLink | null>(null);
  const [copied, setCopied] = useState(false);

  const detail = useQuery({
    queryKey: ['statement-detail', statementId],
    queryFn: ({ signal }) => getStatementDetail(statementId, signal),
  });

  const invalidateAfterPayment = () => {
    void queryClient.invalidateQueries({ queryKey: ['statement-detail', statementId] });
    void queryClient.invalidateQueries({ queryKey: ['company-statements', companyId] });
    void queryClient.invalidateQueries({ queryKey: ['company-balance', companyId] });
    void queryClient.invalidateQueries({ queryKey: ['companies'] });
  };

  const linkMutation = useMutation({
    mutationFn: () => createStatementPaymentLink(statementId),
    onSuccess: (link) => {
      setPaymentLink(link);
      setCopied(false);
      invalidateAfterPayment();
    },
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<RegisterManualPaymentFormValues>({
    resolver: zodResolver(registerManualPaymentFormSchema),
  });
  const transferMutation = useMutation({
    mutationFn: (values: RegisterManualPaymentFormValues) => registerManualPayment(statementId, values),
    onSuccess: () => {
      reset();
      setShowTransferForm(false);
      invalidateAfterPayment();
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

  const statement = detail.data?.statement;
  const isOpenForPayment = statement && statement.status !== 'paid';

  return (
    <Modal title="Detalle del resumen" onClose={onClose}>
      <div className="flex flex-col gap-5 p-5">
        {detail.isLoading && <p className="text-sm text-gray-500">Cargando…</p>}
        {detail.isError && (
          <p role="alert" className="text-sm text-red-600">
            {extractApiErrorMessage(detail.error, 'No se pudo cargar el resumen.')}
          </p>
        )}

        {statement && (
          <>
            <div className="grid grid-cols-2 gap-3 text-[13px] sm:grid-cols-4">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">Total</p>
                <p className="font-medium text-gray-900 dark:text-white">$ {statement.total_amount}</p>
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">Pagado</p>
                <p className="font-medium text-gray-900 dark:text-white">$ {statement.paid_amount}</p>
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">Vence</p>
                <p className="text-gray-700 dark:text-gray-300">
                  {format(new Date(statement.due_at), 'dd/MM/yyyy', { locale: es })}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">Estado</p>
                <Badge
                  variant={
                    statement.status === 'paid' ? 'success' : statement.status === 'overdue' ? 'danger' : 'info'
                  }
                >
                  {statement.status === 'paid' ? 'Pagado' : statement.status === 'overdue' ? 'Vencido' : 'Emitido'}
                </Badge>
              </div>
            </div>

            <div className="overflow-x-auto rounded-lg border border-gray-100 dark:border-white/10">
              <table className="w-full text-left">
                <thead className="border-b border-gray-100 bg-gray-50/50 text-[10px] uppercase tracking-wider text-gray-500 dark:border-white/10 dark:bg-white/5">
                  <tr>
                    <th className="px-3 py-2">Fecha</th>
                    <th className="px-3 py-2">Viaje</th>
                    <th className="px-3 py-2">Empleado</th>
                    <th className="px-3 py-2">Centro de costo</th>
                    <th className="px-3 py-2">Tipo</th>
                    <th className="px-3 py-2">Importe</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-[12.5px] dark:divide-white/10">
                  {detail.data?.lines.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-gray-500">
                        <Inbox className="mx-auto mb-2 h-6 w-6 text-gray-300" />
                        Sin movimientos
                      </td>
                    </tr>
                  ) : (
                    detail.data?.lines.map((line, index) => (
                      <tr key={`${line.trip_id ?? 'sin-viaje'}-${index}`}>
                        <td className="px-3 py-2">{format(new Date(line.date), 'dd/MM/yyyy', { locale: es })}</td>
                        <td className="px-3 py-2 font-mono text-xs">{line.trip_public_code ?? '-'}</td>
                        <td className="px-3 py-2">{line.employee_name ?? '-'}</td>
                        <td className="px-3 py-2">{line.cost_center_name ?? '-'}</td>
                        <td className="px-3 py-2">{lineTypeLabel[line.type] ?? line.type}</td>
                        <td className="px-3 py-2">$ {line.amount}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {isOpenForPayment && (
              <div className="flex flex-col gap-4 border-t border-gray-100 pt-4 dark:border-white/10">
                <div className="flex flex-wrap gap-3">
                  <Button
                    variant="secondary"
                    leftIcon={<LinkIcon size={15} />}
                    isLoading={linkMutation.isPending}
                    onClick={() => linkMutation.mutate()}
                  >
                    Generar link de pago
                  </Button>
                  <Button
                    variant="secondary"
                    leftIcon={<Wallet size={15} />}
                    onClick={() => setShowTransferForm((value) => !value)}
                  >
                    Registrar transferencia
                  </Button>
                </div>

                {linkMutation.isError && (
                  <p role="alert" className="text-sm text-red-600">
                    {extractApiErrorMessage(linkMutation.error, 'No se pudo generar el link de pago.')}
                  </p>
                )}

                {paymentLink && (
                  <div className="rounded-lg border border-champagne-gold/40 bg-champagne-gold/10 p-4">
                    <p className="text-xs text-gray-600 dark:text-white/70">
                      Vence el {format(new Date(paymentLink.expires_at), "dd/MM/yyyy HH:mm'hs'", { locale: es })}.
                      Generar un link nuevo o registrar una transferencia anula este link.
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

                {showTransferForm && (
                  <form
                    onSubmit={handleSubmit((values) => transferMutation.mutate(values))}
                    className="grid gap-3 rounded-lg border border-gray-100 p-4 dark:border-white/10 sm:grid-cols-3"
                  >
                    <Input
                      label="Importe"
                      inputMode="decimal"
                      placeholder="Ej. 15000.00"
                      error={errors.amount?.message}
                      {...register('amount')}
                    />
                    <Input
                      label="Referencia"
                      placeholder="Nº de comprobante"
                      error={errors.reference?.message}
                      {...register('reference')}
                    />
                    <Input
                      label="Fecha"
                      type="date"
                      error={errors.paid_at?.message}
                      {...register('paid_at')}
                    />
                    <p className="text-xs text-gray-500 dark:text-white/50 sm:col-span-3">
                      Si el importe supera lo pendiente, el excedente queda como saldo a favor de la empresa.
                    </p>
                    {transferMutation.isError && (
                      <p role="alert" className="text-sm text-red-600 sm:col-span-3">
                        {extractApiErrorMessage(transferMutation.error, 'No se pudo registrar la transferencia.')}
                      </p>
                    )}
                    <div className="sm:col-span-3">
                      <Button type="submit" variant="gold" isLoading={transferMutation.isPending}>
                        Confirmar transferencia
                      </Button>
                    </div>
                  </form>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </Modal>
  );
}
