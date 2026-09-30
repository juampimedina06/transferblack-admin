import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Inbox } from 'lucide-react';
import { getConsumptionReport } from '../../../core/companies/consumptionReport.api';
import { getCompanyCostCenters } from '../../../core/companies/costCenters.api';
import { getCompanyMembers } from '../../../core/companies/companyMembers.api';
import { Card, CardHeader, CardTitle } from '../../components/common';
import { formatArgentineDate, getCurrentCordobaMonthRange } from '../utils/formatArgentineDate';
import { memberName } from '../utils/memberDisplay';
import { QueryErrorState } from './QueryErrorState';

export function ConsumptionSection({ companyId }: { companyId: string }) {
  const [costCenterId, setCostCenterId] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  // El rango no cambia mientras la pantalla esta abierta: fijarlo con
  // `useMemo` evita que un re-render corte el mes justo cuando se esta
  // mirando (por ejemplo, a medianoche del ultimo dia).
  const monthRange = useMemo(() => getCurrentCordobaMonthRange(), []);

  const costCenters = useQuery({
    queryKey: ['company-cost-centers', companyId],
    queryFn: ({ signal }) => getCompanyCostCenters(companyId, signal),
  });
  const members = useQuery({
    queryKey: ['company-members', companyId],
    queryFn: ({ signal }) => getCompanyMembers(companyId, signal),
  });

  const consumption = useQuery({
    queryKey: [
      'consumption-report',
      companyId,
      costCenterId,
      employeeId,
      monthRange.startDate,
      monthRange.endDate,
    ],
    queryFn: ({ signal }) =>
      getConsumptionReport(
        {
          companyId,
          startDate: monthRange.startDate,
          endDate: monthRange.endDate,
          costCenterId: costCenterId || undefined,
          employeeId: employeeId || undefined,
        },
        signal,
      ),
  });

  return (
    <Card noPadding>
      <div className="border-b border-gray-100 p-5 dark:border-white/10">
        <CardHeader className="mb-0">
          <CardTitle>Consumo del mes</CardTitle>
          <span className="text-xs capitalize text-gray-400">{monthRange.label}</span>
        </CardHeader>
        <div className="flex flex-col gap-3 sm:flex-row">
          <label className="flex-1">
            <span className="sr-only">Filtrar por centro de costo</span>
            <select
              value={costCenterId}
              onChange={(event) => setCostCenterId(event.target.value)}
              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm dark:border-dark-border dark:bg-dark-surface dark:text-white"
            >
              <option value="">Todos los centros de costo</option>
              {costCenters.data?.map((costCenter) => (
                <option key={costCenter.id} value={costCenter.id}>
                  {costCenter.code} · {costCenter.name}
                </option>
              ))}
            </select>
          </label>
          <label className="flex-1">
            <span className="sr-only">Filtrar por empleado</span>
            <select
              value={employeeId}
              onChange={(event) => setEmployeeId(event.target.value)}
              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm dark:border-dark-border dark:bg-dark-surface dark:text-white"
            >
              <option value="">Todos los empleados</option>
              {members.data?.map((member) => (
                <option key={member.id} value={member.profile_id}>
                  {memberName(member)}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      {consumption.isLoading && (
        <div className="flex flex-col gap-2 p-5">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="h-4 w-full animate-pulse rounded bg-gray-200 dark:bg-white/10" />
          ))}
        </div>
      )}

      {consumption.isError && (
        <QueryErrorState
          error={consumption.error}
          fallback="No se pudo cargar el consumo del mes."
          onRetry={() => consumption.refetch()}
        />
      )}

      {consumption.data && consumption.data.items.length === 0 && consumption.data.cancellation_penalties.length === 0 ? (
        <div className="py-10 text-center text-gray-500">
          <Inbox className="mx-auto mb-2 h-8 w-8 text-gray-300" />
          <p>Sin viajes este mes{costCenterId || employeeId ? ' con estos filtros' : ''}.</p>
          <p className="mt-1 text-xs text-gray-400">
            El resumen se emite el día 1 (o al usar &quot;Cerrar período&quot;); hasta entonces, esto es el consumo
            corriente sin facturar.
          </p>
        </div>
      ) : (
        consumption.data && (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="border-b border-gray-100 bg-gray-50/50 text-[10px] uppercase tracking-wider text-gray-500 dark:border-white/10 dark:bg-white/5">
                  <tr>
                    <th className="px-5 py-3">Fecha</th>
                    <th className="px-5 py-3">Viaje</th>
                    <th className="px-5 py-3">Empleado</th>
                    <th className="px-5 py-3">Centro de costo</th>
                    <th className="px-5 py-3">Importe</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-white/10">
                  {consumption.data.items.map((item) => (
                    <tr key={item.trip_id} className="text-[13px] text-gray-700 dark:text-gray-300">
                      <td className="px-5 py-3">{formatArgentineDate(item.finished_at)}</td>
                      <td className="px-5 py-3 font-mono text-xs">{item.public_code}</td>
                      <td className="px-5 py-3">{item.employee_name}</td>
                      <td className="px-5 py-3">
                        {item.cost_center_code} · {item.cost_center_name}
                      </td>
                      <td className="px-5 py-3">$ {item.total}</td>
                    </tr>
                  ))}
                  {consumption.data.cancellation_penalties.map((penalty) => (
                    <tr key={penalty.trip_id} className="text-[13px] text-amber-700 dark:text-amber-400">
                      <td className="px-5 py-3">{formatArgentineDate(penalty.cancelled_at)}</td>
                      <td className="px-5 py-3 font-mono text-xs">{penalty.public_code}</td>
                      <td className="px-5 py-3" colSpan={2}>
                        Penalidad de cancelación
                      </td>
                      <td className="px-5 py-3">$ {penalty.company_charge_amount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {consumption.data.summary.length > 0 && (
              <div className="border-t border-gray-100 p-5 dark:border-white/10">
                <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                  Totales por centro de costo
                </p>
                <ul className="flex flex-col gap-1.5 text-[13px]">
                  {consumption.data.summary.map((summary) => (
                    <li key={summary.cost_center_id} className="flex items-center justify-between">
                      <span className="text-gray-600 dark:text-white/70">
                        {summary.cost_center_code} · {summary.cost_center_name} ({summary.trip_count}{' '}
                        {summary.trip_count === 1 ? 'viaje' : 'viajes'})
                      </span>
                      <span className="font-medium text-gray-900 dark:text-white">$ {summary.subtotal_total}</span>
                    </li>
                  ))}
                  {Number(consumption.data.cancellation_penalties_total) > 0 && (
                    <li className="flex items-center justify-between text-amber-700 dark:text-amber-400">
                      <span>Penalidades de cancelación</span>
                      <span className="font-medium">$ {consumption.data.cancellation_penalties_total}</span>
                    </li>
                  )}
                </ul>
              </div>
            )}
          </>
        )
      )}
    </Card>
  );
}
