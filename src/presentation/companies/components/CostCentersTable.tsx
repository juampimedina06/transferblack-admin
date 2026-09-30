import { useQuery } from '@tanstack/react-query';
import { Inbox } from 'lucide-react';
import { getCompanyCostCenters } from '../../../core/companies/costCenters.api';
import { Badge, Card, CardHeader, CardTitle } from '../../components/common';
import { QueryErrorState } from './QueryErrorState';

export function CostCentersTable({ companyId }: { companyId: string }) {
  const costCenters = useQuery({
    queryKey: ['company-cost-centers', companyId],
    queryFn: ({ signal }) => getCompanyCostCenters(companyId, signal),
  });

  return (
    <Card noPadding>
      <div className="border-b border-gray-100 p-5 dark:border-white/10">
        <CardHeader className="mb-0">
          <CardTitle>Centros de costo</CardTitle>
        </CardHeader>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="border-b border-gray-100 bg-gray-50/50 text-[10px] uppercase tracking-wider text-gray-500 dark:border-white/10 dark:bg-white/5">
            <tr>
              <th className="px-5 py-3">Código</th>
              <th className="px-5 py-3">Nombre</th>
              <th className="px-5 py-3">Tope mensual</th>
              <th className="px-5 py-3">Estado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-white/10">
            {costCenters.isLoading ? (
              Array.from({ length: 2 }).map((_, index) => (
                <tr key={index} className="animate-pulse">
                  {Array.from({ length: 4 }).map((__, cell) => (
                    <td key={cell} className="px-5 py-4">
                      <div className="h-4 w-24 rounded bg-gray-200 dark:bg-white/10" />
                    </td>
                  ))}
                </tr>
              ))
            ) : costCenters.isError ? (
              <tr>
                <td colSpan={4}>
                  <QueryErrorState
                    error={costCenters.error}
                    fallback="No se pudieron cargar los centros de costo."
                    onRetry={() => costCenters.refetch()}
                  />
                </td>
              </tr>
            ) : costCenters.data?.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-10 text-center text-gray-500">
                  <Inbox className="mx-auto mb-2 h-8 w-8 text-gray-300" />
                  Sin centros de costo
                </td>
              </tr>
            ) : (
              costCenters.data?.map((costCenter) => (
                <tr key={costCenter.id} className="text-[13px] text-gray-700 dark:text-gray-300">
                  <td className="px-5 py-3 font-medium text-gray-900 dark:text-white">{costCenter.code}</td>
                  <td className="px-5 py-3">{costCenter.name}</td>
                  <td className="px-5 py-3">
                    {costCenter.monthly_spend_limit ? `$ ${costCenter.monthly_spend_limit}` : 'Sin tope'}
                  </td>
                  <td className="px-5 py-3">
                    <Badge variant={costCenter.status === 'active' ? 'success' : 'default'}>
                      {costCenter.status === 'active' ? 'Activo' : 'Archivado'}
                    </Badge>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
