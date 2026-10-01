import { useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Pencil } from 'lucide-react';
import { extractApiErrorMessage } from '../../core/api/adminApi';
import { getCompany, type Company } from '../../core/companies/company.api';
import { Badge, Button, Card } from '../components/common';
import { BalanceStatusBadge } from './components/BalanceStatusBadge';
import { BillingStatusBadge } from './components/BillingStatusBadge';
import { CompanyBalanceSection } from './components/CompanyBalanceSection';
import { ConsumptionSection } from './components/ConsumptionSection';
import { CostCentersTable } from './components/CostCentersTable';
import { EditMonthlyLimitModal } from './components/EditMonthlyLimitModal';
import { MembersTable } from './components/MembersTable';
import { StatementsSection } from './components/StatementsSection';
import { formatArgentineDateTime } from './utils/formatArgentineDate';

function isNotFound(error: unknown): boolean {
  const status = (error as { response?: { status?: number } })?.response?.status;
  return status === 404;
}

export default function CompanyDetailScreen() {
  const { companyId } = useParams<{ companyId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const [editingLimit, setEditingLimit] = useState(false);

  // El estado de navegación del listado solo se usa como dato inicial para que
  // el encabezado se vea al toque: la fuente de verdad es siempre el fetch, así
  // que una recarga o un link directo igual cargan el detalle.
  const navigationCompany = (location.state as { company?: Company } | null)?.company;

  const company = useQuery({
    queryKey: ['company', companyId],
    queryFn: ({ signal }) => getCompany(companyId!, signal),
    enabled: Boolean(companyId),
    ...(navigationCompany && navigationCompany.id === companyId ? { initialData: navigationCompany } : {}),
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

      {company.isLoading && (
        <Card>
          <div className="h-6 w-52 animate-pulse rounded bg-gray-200 dark:bg-white/10" />
          <div className="mt-3 h-4 w-72 animate-pulse rounded bg-gray-200 dark:bg-white/10" />
        </Card>
      )}

      {company.isError && isNotFound(company.error) && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">
          Esta empresa no existe o fue eliminada.
        </div>
      )}
      {company.isError && !isNotFound(company.error) && (
        <div role="alert" className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">
          <p>{extractApiErrorMessage(company.error, 'No se pudo cargar la empresa.')}</p>
          <Button className="mt-3" size="sm" variant="dangerOutline" onClick={() => company.refetch()}>
            Reintentar
          </Button>
        </div>
      )}

      {company.data && (
        <Card>
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-lg font-semibold text-gray-900 dark:text-white">{company.data.legal_name}</h1>
                <Badge variant={company.data.status === 'active' ? 'success' : 'danger'}>
                  {company.data.status === 'active' ? 'Activa' : 'Suspendida'}
                </Badge>
                {company.data.balance_status ? (
                  <BalanceStatusBadge status={company.data.balance_status} />
                ) : (
                  <BillingStatusBadge status={company.data.billing_status} />
                )}
              </div>
              <p className="mt-1 text-sm text-gray-500">
                {company.data.trade_name || 'Sin nombre de fantasía'} · {company.data.tax_id_type}{' '}
                {company.data.tax_id}
              </p>
              {company.data.status === 'suspended' && (
                <div className="mt-2 rounded-md border border-red-200 bg-red-50 p-2.5 text-xs text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">
                  <p className="font-medium">
                    {company.data.suspended_by_type === 'system' ? 'Automática por mora' : 'Suspensión manual'}
                    {company.data.suspended_at && ` · ${formatArgentineDateTime(company.data.suspended_at)}`}
                  </p>
                  {company.data.suspension_reason && <p className="mt-0.5">{company.data.suspension_reason}</p>}
                </div>
              )}
            </div>
            <div className="text-right">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">Tope mensual</p>
              <div className="flex items-center gap-2">
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {company.data.monthly_spend_limit ? `$ ${company.data.monthly_spend_limit}` : 'Sin tope'}
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

      <CompanyBalanceSection companyId={companyId} />

      <MembersTable companyId={companyId} />
      <CostCentersTable companyId={companyId} />
      <ConsumptionSection companyId={companyId} />
      <StatementsSection companyId={companyId} />

      {editingLimit && company.data && (
        <EditMonthlyLimitModal
          company={company.data}
          onClose={() => setEditingLimit(false)}
          onUpdated={(updated) => queryClient.setQueryData(['company', companyId], updated)}
        />
      )}
    </div>
  );
}
