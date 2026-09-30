import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Inbox } from 'lucide-react';
import { getCompanyStatements } from '../../../core/companies/companyStatements.api';
import { Badge, Card, CardHeader, CardTitle } from '../../components/common';
import { StatementDetailModal } from './StatementDetailModal';

export function StatementsSection({ companyId }: { companyId: string }) {
  const [selectedStatementId, setSelectedStatementId] = useState<string | null>(null);
  const statements = useQuery({
    queryKey: ['company-statements', companyId],
    queryFn: ({ signal }) => getCompanyStatements(companyId, signal),
  });

  return (
    <Card noPadding>
      <div className="border-b border-gray-100 p-5 dark:border-white/10">
        <CardHeader className="mb-0">
          <CardTitle>Resúmenes</CardTitle>
        </CardHeader>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="border-b border-gray-100 bg-gray-50/50 text-[10px] uppercase tracking-wider text-gray-500 dark:border-white/10 dark:bg-white/5">
            <tr>
              <th className="px-5 py-3">Período</th>
              <th className="px-5 py-3">Estado</th>
              <th className="px-5 py-3">Total</th>
              <th className="px-5 py-3">Pagado</th>
              <th className="px-5 py-3">Vence</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-white/10">
            {statements.isLoading ? (
              Array.from({ length: 3 }).map((_, index) => (
                <tr key={index} className="animate-pulse">
                  {Array.from({ length: 5 }).map((__, cell) => (
                    <td key={cell} className="px-5 py-4">
                      <div className="h-4 w-20 rounded bg-gray-200 dark:bg-white/10" />
                    </td>
                  ))}
                </tr>
              ))
            ) : statements.data?.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-10 text-center text-gray-500">
                  <Inbox className="mx-auto mb-2 h-8 w-8 text-gray-300" />
                  Todavía no se emitió ningún resumen
                </td>
              </tr>
            ) : (
              statements.data?.map((statement) => (
                <tr
                  key={statement.id}
                  onClick={() => setSelectedStatementId(statement.id)}
                  className="cursor-pointer text-[13px] text-gray-700 hover:bg-gray-50/50 dark:text-gray-300 dark:hover:bg-white/5"
                >
                  <td className="px-5 py-3 font-medium text-gray-900 capitalize dark:text-white">
                    {format(new Date(statement.period_start), 'MMMM yyyy', { locale: es })}
                  </td>
                  <td className="px-5 py-3">
                    <Badge
                      variant={
                        statement.status === 'paid'
                          ? 'success'
                          : statement.status === 'overdue'
                            ? 'danger'
                            : 'info'
                      }
                    >
                      {statement.status === 'paid' ? 'Pagado' : statement.status === 'overdue' ? 'Vencido' : 'Emitido'}
                    </Badge>
                  </td>
                  <td className="px-5 py-3">$ {statement.total_amount}</td>
                  <td className="px-5 py-3">$ {statement.paid_amount}</td>
                  <td className="px-5 py-3">{format(new Date(statement.due_at), 'dd/MM/yyyy', { locale: es })}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {selectedStatementId && (
        <StatementDetailModal
          statementId={selectedStatementId}
          companyId={companyId}
          onClose={() => setSelectedStatementId(null)}
        />
      )}
    </Card>
  );
}
