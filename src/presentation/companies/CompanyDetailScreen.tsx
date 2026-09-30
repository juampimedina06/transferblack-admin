import { useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Pencil } from 'lucide-react';
import { getCompanyBalance } from '../../core/companies/companyBalance.api';
import type { Company } from '../../core/companies/company.api';
import { Badge, Card } from '../components/common';
import { BillingStatusBadge } from './components/BillingStatusBadge';
import { CostCentersTable } from './components/CostCentersTable';
import { EditMonthlyLimitModal } from './components/EditMonthlyLimitModal';
import { MembersTable } from './components/MembersTable';
import { StatementsSection } from './components/StatementsSection';

function BalanceCard({ label, amount, currency }: { label: string; amount: string; currency: string }) {
  return (
    <Card className="p-4">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">{label}</p>
      <p className="mt-1 text-xl font-semibold text-gray-900 dark:text-white">
        {currency} {amount}
      </p>
    </Card>
  );
}

export default function CompanyDetailScreen() {
  const { companyId } = useParams<{ companyId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  // No hay GET por id: el detalle general de la empresa viaja como estado de
  // navegación desde el listado (ver company.api.ts). Si se entra directo por
  // URL (recarga, link compartido) no hay forma de recuperarlo hoy.
  const [company, setCompany] = useState<Company | null>(
    (location.state as { company?: Company } | null)?.company ?? null,
  );

  const [editingLimit, setEditingLimit] = useState(false);

  const balance = useQuery({
    queryKey: ['company-balance', companyId],
    queryFn: ({ signal }) => getCompanyBalance(companyId!, signal),
    enabled: Boolean(companyId),
  });

  if (!companyId) {
    return null;
  }

  return (
    <div className="flex w-full flex-col gap-4 px-4 py-6">
      <button
        onClick={() => navigate('/empresas')}
        className="flex w-max items-center gap-2 text-gray-500 transition-colors hover:text-gray-900 dark:text-white/70 dark:hover:text-white"
      >
        <ArrowLeft size={16} /> Volver a empresas
      </button>

      {!company && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300">
          Los datos generales de la empresa solo están disponibles al entrar desde el listado de{' '}
          <button onClick={() => navigate('/empresas')} className="underline">
            Empresas
          </button>
          . Los miembros, centros de costo y resúmenes de abajo siguen disponibles.
        </div>
      )}

      {company && (
        <Card>
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-lg font-semibold text-gray-900 dark:text-white">{company.legal_name}</h1>
                <Badge variant={company.status === 'active' ? 'success' : 'danger'}>
                  {company.status === 'active' ? 'Activa' : 'Suspendida'}
                </Badge>
                <BillingStatusBadge status={company.billing_status} />
              </div>
              <p className="mt-1 text-sm text-gray-500">
                {company.trade_name || 'Sin nombre de fantasía'} · {company.tax_id_type} {company.tax_id}
              </p>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">Tope mensual</p>
              <div className="flex items-center gap-2">
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {company.monthly_spend_limit ? `$ ${company.monthly_spend_limit}` : 'Sin tope'}
                </p>
                <button
                  onClick={() => setEditingLimit(true)}
                  aria-label="Editar tope mensual"
                  className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-white/10 dark:hover:text-white"
                >
                  <Pencil size={14} />
                </button>
              </div>
            </div>
          </div>
        </Card>
      )}

      <section aria-label="Balance de la cuenta corriente" className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {balance.isLoading ? (
          Array.from({ length: 4 }).map((_, index) => (
            <Card key={index} className="p-4">
              <div className="h-3 w-24 animate-pulse rounded bg-gray-200 dark:bg-white/10" />
              <div className="mt-2 h-6 w-32 animate-pulse rounded bg-gray-200 dark:bg-white/10" />
            </Card>
          ))
        ) : balance.isError ? (
          <div className="col-span-full rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            No se pudo cargar el saldo de la empresa.
          </div>
        ) : balance.data ? (
          <>
            <BalanceCard
              label="Pendiente de pago"
              amount={balance.data.unpaid_statements_amount}
              currency={balance.data.currency}
            />
            <BalanceCard
              label="Consumo del mes sin facturar"
              amount={balance.data.unbilled_current_month_amount}
              currency={balance.data.currency}
            />
            <BalanceCard label="Saldo a favor" amount={balance.data.credit_amount} currency={balance.data.currency} />
            <BalanceCard
              label="Total adeudado"
              amount={balance.data.outstanding_amount}
              currency={balance.data.currency}
            />
          </>
        ) : null}
      </section>

      <MembersTable companyId={companyId} />
      <CostCentersTable companyId={companyId} />
      <StatementsSection companyId={companyId} />

      {editingLimit && company && (
        <EditMonthlyLimitModal
          company={company}
          onClose={() => setEditingLimit(false)}
          onUpdated={(updated) => setCompany(updated)}
        />
      )}
    </div>
  );
}
