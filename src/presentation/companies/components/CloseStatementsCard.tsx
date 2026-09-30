import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CalendarCheck } from 'lucide-react';
import { extractApiErrorMessage } from '../../../core/api/adminApi';
import { closeStatementsPeriod, type CloseStatementsResult } from '../../../core/companies/companyStatements.api';
import { Button } from '../../components/common';

function previousPeriod(): string {
  const now = new Date();
  const previousMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  return `${previousMonth.getFullYear()}-${String(previousMonth.getMonth() + 1).padStart(2, '0')}`;
}

/**
 * Cierre global de resúmenes: emite el resumen del período para todas las
 * empresas activas, no solo una. Por eso vive en el listado y no en el
 * detalle de una empresa puntual (el endpoint del backend tampoco recibe
 * `companyId`).
 */
export function CloseStatementsCard() {
  const queryClient = useQueryClient();
  const [period, setPeriod] = useState(previousPeriod());
  const [result, setResult] = useState<CloseStatementsResult | null>(null);
  const mutation = useMutation({
    mutationFn: () => closeStatementsPeriod(period),
    onSuccess: (data) => {
      setResult(data);
      void queryClient.invalidateQueries({ queryKey: ['companies'] });
    },
  });

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-gray-100 bg-white p-4 dark:border-dark-border dark:bg-dark-surface sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-champagne-gold/10 text-champagne-gold">
          <CalendarCheck size={17} />
        </div>
        <div>
          <p className="text-sm font-medium text-gray-900 dark:text-white">Cerrar resúmenes del mes</p>
          <p className="text-xs text-gray-500">Emite el resumen del período para todas las empresas activas.</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <input
          type="month"
          value={period}
          onChange={(event) => {
            setPeriod(event.target.value);
            setResult(null);
          }}
          className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm dark:border-dark-border dark:bg-dark-card dark:text-white"
        />
        <Button variant="secondary" size="sm" isLoading={mutation.isPending} onClick={() => mutation.mutate()}>
          Cerrar período
        </Button>
      </div>
      {mutation.isError && (
        <p role="alert" className="text-xs text-red-600 sm:basis-full">
          {extractApiErrorMessage(mutation.error, 'No se pudo cerrar el período.')}
        </p>
      )}
      {result && (
        <p className="text-xs text-emerald-700 dark:text-emerald-400 sm:basis-full">
          {result.issued} resúmenes emitidos{result.failed > 0 ? `, ${result.failed} con error` : ''}.
        </p>
      )}
    </div>
  );
}
