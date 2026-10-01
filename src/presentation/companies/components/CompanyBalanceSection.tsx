import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AlertTriangle, Wallet } from 'lucide-react';
import { getCompanyBalance, isPostpaidBalance, isPrepaidBalance } from '../../../core/companies/companyBalance.api';
import { Button, Card, CardHeader, CardTitle } from '../../components/common';
import { QueryErrorState } from './QueryErrorState';
import { TopUpModal } from './TopUpModal';
import { TopUpsTable } from './TopUpsTable';

function AmountCard({
  label,
  amount,
  currency,
  tone = 'default',
}: {
  label: string;
  amount: string;
  currency: string;
  tone?: 'default' | 'danger' | 'warning';
}) {
  const toneClass =
    tone === 'danger'
      ? 'text-red-600 dark:text-red-400'
      : tone === 'warning'
        ? 'text-amber-600 dark:text-amber-400'
        : 'text-gray-900 dark:text-white';
  return (
    <div className="rounded-lg border border-gray-100 p-4 dark:border-white/10">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">{label}</p>
      <p className={`mt-1 text-xl font-semibold ${toneClass}`}>
        {currency} {amount}
      </p>
    </div>
  );
}

/**
 * Saldo prepago de la empresa (feature/empresas-prepago): reemplaza a la
 * cuenta corriente postpaga. Durante el rollout el backend desplegado puede
 * seguir siendo el viejo (contrato incompatible de
 * `GET /corporate/companies/{companyId}/balance`), asi que esta seccion
 * elige que tarjetas mostrar segun que forma llego, sin romper.
 */
export function CompanyBalanceSection({ companyId }: { companyId: string }) {
  const [showTopUp, setShowTopUp] = useState(false);
  const balance = useQuery({
    queryKey: ['company-balance', companyId],
    queryFn: ({ signal }) => getCompanyBalance(companyId, signal),
  });

  const prepaid = balance.data && isPrepaidBalance(balance.data) ? balance.data : null;
  const legacy = !prepaid && balance.data && isPostpaidBalance(balance.data) ? balance.data : null;
  const available = prepaid ? Number(prepaid.available) : null;
  const canTopUp = !legacy;

  return (
    <Card noPadding>
      <div className="flex items-center justify-between border-b border-gray-100 p-5 dark:border-white/10">
        <CardHeader className="mb-0">
          <CardTitle>Saldo</CardTitle>
        </CardHeader>
        {canTopUp && (
          <Button size="sm" variant="gold" leftIcon={<Wallet size={14} />} onClick={() => setShowTopUp(true)}>
            Cargar saldo
          </Button>
        )}
      </div>

      <div className="p-5">
        {balance.isLoading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="rounded-lg border border-gray-100 p-4 dark:border-white/10">
                <div className="h-3 w-24 animate-pulse rounded bg-gray-200 dark:bg-white/10" />
                <div className="mt-2 h-6 w-32 animate-pulse rounded bg-gray-200 dark:bg-white/10" />
              </div>
            ))}
          </div>
        ) : balance.isError ? (
          <QueryErrorState
            error={balance.error}
            fallback="No se pudo cargar el saldo de la empresa."
            onRetry={() => balance.refetch()}
          />
        ) : prepaid ? (
          <>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <AmountCard
                label="Saldo"
                amount={prepaid.balance}
                currency={prepaid.currency}
                tone={Number(prepaid.balance) < 0 ? 'danger' : 'default'}
              />
              <AmountCard
                label="Disponible"
                amount={prepaid.available}
                currency={prepaid.currency}
                tone={available !== null && available <= 0 ? 'danger' : prepaid.low_balance ? 'warning' : 'default'}
              />
              <AmountCard label="En viajes en curso" amount={prepaid.in_flight} currency={prepaid.currency} />
            </div>

            {available !== null && available <= 0 ? (
              <div
                role="alert"
                className="mt-4 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300"
              >
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                <p>Sin saldo: los empleados no pueden viajar a cuenta.</p>
              </div>
            ) : prepaid.low_balance ? (
              <div className="mt-4 flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                <p>Saldo bajo: quedan pocos viajes antes de que la empresa se quede sin saldo.</p>
              </div>
            ) : null}

            {Number(prepaid.balance) < 0 && (
              <p className="mt-3 text-xs text-gray-500 dark:text-white/50">
                Saldo negativo: se descuenta de la próxima carga.
              </p>
            )}
          </>
        ) : legacy ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <AmountCard label="Pendiente de pago" amount={legacy.unpaid_statements_amount} currency={legacy.currency} />
            <AmountCard
              label="Consumo del mes sin facturar"
              amount={legacy.unbilled_current_month_amount}
              currency={legacy.currency}
            />
            <AmountCard label="Saldo a favor" amount={legacy.credit_amount} currency={legacy.currency} />
            <AmountCard label="Total adeudado" amount={legacy.outstanding_amount} currency={legacy.currency} />
          </div>
        ) : (
          <p className="text-sm text-gray-500 dark:text-white/50">No se pudo determinar el saldo de la empresa.</p>
        )}
      </div>

      {canTopUp && <TopUpsTable companyId={companyId} />}

      {showTopUp && <TopUpModal companyId={companyId} onClose={() => setShowTopUp(false)} />}
    </Card>
  );
}
