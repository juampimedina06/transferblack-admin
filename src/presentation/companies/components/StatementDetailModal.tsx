import { useQuery } from '@tanstack/react-query';
import { Inbox } from 'lucide-react';
import { getStatementDetail } from '../../../core/companies/companyStatements.api';
import { Badge } from '../../components/common';
import { formatArgentineDate } from '../utils/formatArgentineDate';
import { Modal } from './Modal';
import { QueryErrorState } from './QueryErrorState';

const lineTypeLabel: Record<string, string> = { trip: 'Viaje', cancellation_penalty: 'Penalidad de cancelación' };

// Los resumenes son informativos (saldo prepago, feature/empresas-prepago):
// ya no admiten un pago nuevo, asi que este modal solo muestra el detalle del
// consumo del periodo. La carga de saldo vive en `TopUpModal`.
export function StatementDetailModal({
  statementId,
  onClose,
}: {
  statementId: string;
  onClose: () => void;
}) {
  const detail = useQuery({
    queryKey: ['statement-detail', statementId],
    queryFn: ({ signal }) => getStatementDetail(statementId, signal),
  });

  const statement = detail.data?.statement;

  return (
    <Modal title="Detalle del reporte de consumo" onClose={onClose}>
      <div className="flex flex-col gap-5 p-5">
        {detail.isLoading && <p className="text-sm text-gray-500">Cargando…</p>}
        {detail.isError && (
          <QueryErrorState
            error={detail.error}
            fallback="No se pudo cargar el resumen."
            onRetry={() => detail.refetch()}
          />
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
                <p className="text-gray-700 dark:text-gray-300">{formatArgentineDate(statement.due_at)}</p>
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
                        <td className="px-3 py-2">{formatArgentineDate(line.date)}</td>
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
          </>
        )}
      </div>
    </Modal>
  );
}
