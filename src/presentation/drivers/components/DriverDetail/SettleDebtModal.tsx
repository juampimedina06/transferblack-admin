import React, { useEffect, useMemo, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { AlertTriangle, Banknote, Building2, Wallet, X } from 'lucide-react';
import { Button, Input, Textarea } from '../../../components/common';
import { extractApiErrorMessage } from '../../../../core/api/adminApi';
import type {
  DebtSettlementMethod,
  SettleDriverDebtPayload,
} from '../../../../core/drivers/interfaces/driver-wallet.interface';

interface SettleDebtModalProps {
  isOpen: boolean;
  onClose: () => void;
  driverName: string;
  debtAmount: number;
  currency?: string;
  isSubmitting: boolean;
  serverError: unknown;
  onSubmit: (payload: SettleDriverDebtPayload, idempotencyKey: string) => void;
}

const normalizeAmountString = (raw: string): string => {
  const trimmed = raw.trim();
  if (trimmed.includes(',')) {
    return trimmed.replace(/\./g, '').replace(',', '.');
  }
  return trimmed;
};

const formatCurrency = (amount: number, currency = 'ARS') =>
  new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency,
    maximumFractionDigits: 2,
  }).format(amount);

const createUuid = (): string => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (char) => {
    const rand = (Math.random() * 16) | 0;
    const val = char === 'x' ? rand : (rand & 0x3) | 0x8;
    return val.toString(16);
  });
};

export const SettleDebtModal: React.FC<SettleDebtModalProps> = ({
  isOpen,
  onClose,
  driverName,
  debtAmount,
  currency = 'ARS',
  isSubmitting,
  serverError,
  onSubmit,
}) => {
  const roundedDebt = Math.round(debtAmount * 100) / 100;

  const schema = useMemo(
    () =>
      z.object({
        amount: z
          .string()
          .trim()
          .min(1, 'Ingresá el importe cobrado')
          .transform(normalizeAmountString)
          .refine(
            (val) => /^\d+(\.\d{1,2})?$/.test(val) && Number(val) > 0,
            'Ingresá un importe positivo con hasta dos decimales',
          )
          .refine(
            (val) => Number(val) <= roundedDebt,
            `El importe no puede superar la deuda actual (${formatCurrency(roundedDebt, currency)})`,
          ),
        method: z.enum(['cash', 'transfer']),
        notes: z
          .string()
          .trim()
          .min(3, 'Agregá una referencia o comprobante (mínimo 3 caracteres)')
          .max(500, 'Las notas no pueden superar los 500 caracteres'),
      }),
    [roundedDebt, currency],
  );

  type SettleDebtFormData = z.infer<typeof schema>;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<SettleDebtFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      amount: roundedDebt.toFixed(2),
      method: 'cash',
      notes: '',
    },
  });

  // Clave estable por intento de cobro para evitar doble acreditación ante reintentos.
  const idempotencyKeyRef = useRef<string>(createUuid());
  const lastAmountRef = useRef<string>(roundedDebt.toFixed(2));

  useEffect(() => {
    if (isOpen) {
      idempotencyKeyRef.current = createUuid();
      lastAmountRef.current = roundedDebt.toFixed(2);
      reset({
        amount: roundedDebt.toFixed(2),
        method: 'cash',
        notes: '',
      });
    }
  }, [isOpen, roundedDebt, reset]);

  if (!isOpen) return null;

  const selectedMethod = watch('method');

  const handleFormSubmit = (data: SettleDebtFormData) => {
    const formattedAmount = Number(data.amount).toFixed(2);
    if (formattedAmount !== lastAmountRef.current) {
      idempotencyKeyRef.current = createUuid();
      lastAmountRef.current = formattedAmount;
    }

    onSubmit(
      {
        amount: formattedAmount,
        method: data.method as DebtSettlementMethod,
        notes: data.notes,
      },
      idempotencyKeyRef.current,
    );
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Registrar pago de deuda"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-obsidian border border-gray-200 dark:border-white/10 rounded-xl w-full max-w-md overflow-hidden flex flex-col shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-gray-100 dark:border-white/10">
          <div className="flex items-center gap-2 min-w-0">
            <Wallet className="w-4 h-4 text-champagne-gold shrink-0" />
            <h3 className="text-gray-900 dark:text-white font-semibold text-sm truncate">
              Registrar pago de deuda
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="text-gray-400 hover:text-gray-700 dark:text-white/50 dark:hover:text-white transition-colors cursor-pointer disabled:opacity-40"
            aria-label="Cerrar modal"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="p-4 flex flex-col gap-4">
          <div className="bg-gray-50 dark:bg-white/[0.03] border border-gray-200 dark:border-white/10 rounded-lg p-3 flex items-center justify-between text-xs">
            <div className="min-w-0">
              <p className="text-gray-500 dark:text-gray-400">Deuda actual de</p>
              <p className="font-semibold text-gray-900 dark:text-white truncate">{driverName}</p>
            </div>
            <span className="text-base font-bold text-red-600 dark:text-red-400 shrink-0">
              {formatCurrency(roundedDebt, currency)}
            </span>
          </div>

          {Boolean(serverError) && (
            <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 rounded-lg p-3 text-xs text-red-700 dark:text-red-300 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              <span>
                {extractApiErrorMessage(serverError, 'No pudimos registrar el pago de deuda.')}
              </span>
            </div>
          )}

          {/* Amount */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label
                htmlFor="settlement-amount"
                className="text-xs font-semibold text-gray-700 dark:text-gray-300"
              >
                Importe recibido ({currency})
              </label>
              <button
                type="button"
                onClick={() =>
                  setValue('amount', roundedDebt.toFixed(2), { shouldValidate: true })
                }
                className="text-[11px] font-semibold text-champagne-gold hover:underline cursor-pointer"
              >
                Saldar total ({formatCurrency(roundedDebt, currency)})
              </button>
            </div>
            <Input
              id="settlement-amount"
              type="text"
              inputMode="decimal"
              placeholder="Ej: 10000.00"
              {...register('amount')}
              error={errors.amount?.message}
            />
          </div>

          {/* Method */}
          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
              Medio de pago
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setValue('method', 'cash', { shouldValidate: true })}
                className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
                  selectedMethod === 'cash'
                    ? 'bg-obsidian dark:bg-champagne-gold text-white dark:text-obsidian border-obsidian dark:border-champagne-gold'
                    : 'bg-white dark:bg-white/5 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/10'
                }`}
              >
                <Banknote className="w-4 h-4" />
                Efectivo
              </button>
              <button
                type="button"
                onClick={() => setValue('method', 'transfer', { shouldValidate: true })}
                className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
                  selectedMethod === 'transfer'
                    ? 'bg-obsidian dark:bg-champagne-gold text-white dark:text-obsidian border-obsidian dark:border-champagne-gold'
                    : 'bg-white dark:bg-white/5 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/10'
                }`}
              >
                <Building2 className="w-4 h-4" />
                Transferencia
              </button>
            </div>
          </div>

          {/* Notes */}
          <Textarea
            label="Referencia / Comprobante"
            rows={3}
            placeholder="Ej: Pago recibido en oficina o transferencia banco #123456"
            {...register('notes')}
            error={errors.notes?.message}
          />

          <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-relaxed">
            Al confirmar se acredita el importe en el libro contable del conductor. Si el saldo queda por debajo del tope de deuda, se rehabilita automáticamente para recibir viajes.
          </p>

          <div className="flex justify-end gap-2.5 mt-1">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={isSubmitting}
              onClick={onClose}
            >
              Cancelar
            </Button>
            <Button type="submit" variant="primary" size="sm" isLoading={isSubmitting}>
              Confirmar cobro
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
