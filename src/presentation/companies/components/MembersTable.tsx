import { useQuery } from '@tanstack/react-query';
import { Inbox } from 'lucide-react';
import { getCompanyMembers, type CorporateMember } from '../../../core/companies/companyMembers.api';
import { getCompanyCostCenters } from '../../../core/companies/costCenters.api';
import { Badge, Card, CardHeader, CardTitle } from '../../components/common';

const roleLabel: Record<string, string> = { manager: 'Gerente', employee: 'Empleado' };

function memberName(member: CorporateMember): string {
  const name = [member.first_name, member.last_name].filter(Boolean).join(' ').trim();
  return name || `Perfil ${member.profile_id.slice(0, 8)}…`;
}

export function MembersTable({ companyId }: { companyId: string }) {
  const members = useQuery({
    queryKey: ['company-members', companyId],
    queryFn: ({ signal }) => getCompanyMembers(companyId, signal),
  });
  // Se pide junto con los miembros para resolver el nombre del centro de costo
  // en la tabla sin un segundo viaje por fila.
  const costCenters = useQuery({
    queryKey: ['company-cost-centers', companyId],
    queryFn: ({ signal }) => getCompanyCostCenters(companyId, signal),
  });
  const costCenterName = (costCenterId: string | null) =>
    costCenters.data?.find((cc) => cc.id === costCenterId)?.name ?? '-';

  return (
    <Card noPadding>
      <div className="border-b border-gray-100 p-5 dark:border-white/10">
        <CardHeader className="mb-0">
          <CardTitle>Miembros</CardTitle>
        </CardHeader>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="border-b border-gray-100 bg-gray-50/50 text-[10px] uppercase tracking-wider text-gray-500 dark:border-white/10 dark:bg-white/5">
            <tr>
              <th className="px-5 py-3">Empleado</th>
              <th className="px-5 py-3">Rol</th>
              <th className="px-5 py-3">Centro de costo</th>
              <th className="px-5 py-3">Estado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-white/10">
            {members.isLoading ? (
              Array.from({ length: 3 }).map((_, index) => (
                <tr key={index} className="animate-pulse">
                  {Array.from({ length: 4 }).map((__, cell) => (
                    <td key={cell} className="px-5 py-4">
                      <div className="h-4 w-24 rounded bg-gray-200 dark:bg-white/10" />
                    </td>
                  ))}
                </tr>
              ))
            ) : members.data?.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-10 text-center text-gray-500">
                  <Inbox className="mx-auto mb-2 h-8 w-8 text-gray-300" />
                  Sin miembros vinculados
                </td>
              </tr>
            ) : (
              members.data?.map((member) => (
                <tr key={member.id} className="text-[13px] text-gray-700 dark:text-gray-300">
                  <td className="px-5 py-3">
                    <p className="font-medium text-gray-900 dark:text-white">{memberName(member)}</p>
                    <p className="text-xs text-gray-500">{member.email ?? '-'}</p>
                  </td>
                  <td className="px-5 py-3">{roleLabel[member.corporate_role] ?? member.corporate_role}</td>
                  <td className="px-5 py-3">{costCenterName(member.default_cost_center_id)}</td>
                  <td className="px-5 py-3">
                    <Badge variant={member.status === 'active' ? 'success' : 'default'}>
                      {member.status === 'active' ? 'Activo' : 'Revocado'}
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
