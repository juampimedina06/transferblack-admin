import { useQuery } from '@tanstack/react-query';
import { Inbox } from 'lucide-react';
import { getCompanyTopUps, type CompanyTopUpMethod, type CompanyTopUpStatus } from '../../../core/companies/companyTopUps.api';
import { Badge, CardHeader, CardTitle } from '../../components/common';
import { formatArgentineDate } from '../utils/formatArgentineDate';
import { QueryErrorState } from './QueryErrorState';

const methodLabel: Record<CompanyTopUpMethod, string> = {
  mercado_pago: 'Mercado Pago',
  bank_transfer: 'Transferencia',
};

const statusConfig: Record<CompanyTopUpStatus, { label: string; variant: 'success' | 'warning' | 'danger' | 'default' }> = {
  paid: { label: 'Acreditada', variant: 'success' },
  pending: { label: 'Pendiente', variant: 'warning' },
  failed: { label: 'Fallida', variant: 'danger' },
  superseded: { label: 'Reemplazada', variant: 'default' },
};

// Historial de cargas de saldo de una empresa (B2): vive dentro de la seccion
// de saldo del detalle, no es una pantalla propia.
export function TopUpsTable({ companyId }: { companyId: string }) {
  const topUps = useQuery({
    queryKey: ['company-top-ups', companyId],
    queryFn: ({ signal }) => getCompanyTopUps(companyId, signal),
  });

  return (
    <div className="border-t border-gray-100 dark:border-white/10">
      <div className="p-5 pb-0">
        <CardHeader className="mb-0">
          <CardTitle>Historial de cargas</CardTitle>
        </CardHeader>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="border-b border-gray-100 bg-gray-50/50 text-[10px] uppercase tracking-wider text-gray-500 dark:border-white/10 dark:bg-white/5">
            <tr>
              <th className="px-5 py-3">Fecha</th>
              <th className="px-5 py-3">Método</th>
              <th className="px-5 py-3">Monto</th>
              <th className="px-5 py-3">Estado</th>
              <th className="px-5 py-3">Referencia</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-white/10">
            {topUps.isLoading ? (
              Array.from({ length: 2 }).map((_, index) => (
                <tr key={index} className="animate-pulse">
                  {Array.from({ length: 5 }).map((__, cell) => (
                    <td key={cell} className="px-5 py-4">
                      <div className="h-4 w-20 rounded bg-gray-200 dark:bg-white/10" />
                    </td>
                  ))}
                </tr>
              ))
            ) : topUps.isError ? (
              <tr>
                <td colSpan={5}>
                  <QueryErrorState
                    error={topUps.error}
                    fallback="No se pudo cargar el historial de cargas."
                    onRetry={() => topUps.refetch()}
                  />
                </td>
              </tr>
            ) : topUps.data?.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-10 text-center text-gray-500">
                  <Inbox className="mx-auto mb-2 h-8 w-8 text-gray-300" />
                  Todavía no se registró ninguna carga
                </td>
              </tr>
            ) : (
              topUps.data?.map((topUp) => (
                <tr key={topUp.id} className="text-[13px] text-gray-700 dark:text-gray-300">
                  <td className="px-5 py-3">{formatArgentineDate(topUp.paid_at ?? topUp.created_at)}</td>
                  <td className="px-5 py-3">{methodLabel[topUp.method]}</td>
                  <td className="px-5 py-3">$ {topUp.amount}</td>
                  <td className="px-5 py-3">
                    <Badge variant={statusConfig[topUp.status].variant}>{statusConfig[topUp.status].label}</Badge>
                  </td>
                  <td className="px-5 py-3">{topUp.reference ?? '-'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
