import type { BalanceStatus } from '../../../core/companies/company.api';
import { Badge } from '../../components/common';

const config: Record<BalanceStatus, { label: string; variant: 'success' | 'warning' | 'danger' }> = {
  ok: { label: 'OK', variant: 'success' },
  low_balance: { label: 'Saldo bajo', variant: 'warning' },
  no_balance: { label: 'Sin saldo', variant: 'danger' },
};

export function BalanceStatusBadge({ status }: { status: BalanceStatus }) {
  const { label, variant } = config[status];
  return <Badge variant={variant}>{label}</Badge>;
}
