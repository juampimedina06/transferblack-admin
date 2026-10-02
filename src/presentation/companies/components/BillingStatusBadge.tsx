import type { BillingStatus } from '../../../core/companies/company.api';
import { Badge } from '../../components/common';

const config: Record<BillingStatus, { label: string; variant: 'success' | 'warning' | 'danger' }> = {
  up_to_date: { label: 'Al día', variant: 'success' },
  overdue: { label: 'Con deuda vencida', variant: 'warning' },
  suspended_for_debt: { label: 'Suspendida por deuda', variant: 'danger' },
};

export function BillingStatusBadge({ status }: { status: BillingStatus }) {
  const { label, variant } = config[status];
  return <Badge variant={variant}>{label}</Badge>;
}
