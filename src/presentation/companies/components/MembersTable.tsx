import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Inbox, Pencil, UserX } from 'lucide-react';
import { extractApiErrorMessage } from '../../../core/api/adminApi';
import { getCompanyMembers, revokeMember, type CorporateMember } from '../../../core/companies/companyMembers.api';
import { getCompanyCostCenters } from '../../../core/companies/costCenters.api';
import { Badge, Card, CardHeader, CardTitle } from '../../components/common';
import { memberName, roleLabel } from '../utils/memberDisplay';
import { ConfirmDialog } from './ConfirmDialog';
import { EditMemberModal } from './EditMemberModal';
import { QueryErrorState } from './QueryErrorState';

export function MembersTable({ companyId }: { companyId: string }) {
  const queryClient = useQueryClient();
  const [editingMember, setEditingMember] = useState<CorporateMember | null>(null);
  const [revokingMember, setRevokingMember] = useState<CorporateMember | null>(null);
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
    costCenters.data?.find((cc) => cc.id === costCenterId)?.name ?? null;

  const revokeMutation = useMutation({
    mutationFn: (member: CorporateMember) => revokeMember(companyId, member.profile_id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['company-members', companyId] });
      closeRevokeDialog();
    },
  });

  // Sin este reset, el error de "no se pudo revocar" de un miembro quedaba en
  // `revokeMutation.error` y se mostraba de nuevo al abrir el dialogo para
  // otro miembro, aunque esta vez no hubo ningun intento fallido.
  function openRevokeDialog(member: CorporateMember) {
    revokeMutation.reset();
    setRevokingMember(member);
  }

  function closeRevokeDialog() {
    revokeMutation.reset();
    setRevokingMember(null);
  }

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
              <th className="px-5 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-white/10">
            {members.isLoading ? (
              Array.from({ length: 3 }).map((_, index) => (
                <tr key={index} className="animate-pulse">
                  {Array.from({ length: 5 }).map((__, cell) => (
                    <td key={cell} className="px-5 py-4">
                      <div className="h-4 w-24 rounded bg-gray-200 dark:bg-white/10" />
                    </td>
                  ))}
                </tr>
              ))
            ) : members.isError ? (
              <tr>
                <td colSpan={5}>
                  <QueryErrorState
                    error={members.error}
                    fallback="No se pudieron cargar los miembros."
                    onRetry={() => members.refetch()}
                  />
                </td>
              </tr>
            ) : members.data?.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-10 text-center text-gray-500">
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
                  <td className="px-5 py-3">
                    {member.default_cost_center_id === null ? (
                      // Solo "sin centro de costo" cuando el miembro realmente
                      // no tiene uno asignado: si tiene id pero todavia no se
                      // resolvio el nombre, mostrar esta insignia era enganoso
                      // (parecia que no tenia ninguno mientras la consulta de
                      // centros de costo seguia cargando o habia fallado).
                      <Badge variant="warning">Sin centro de costo</Badge>
                    ) : costCenters.isLoading ? (
                      <span className="text-gray-400">Cargando…</span>
                    ) : costCenters.isError ? (
                      <span className="text-gray-400">Centro de costo no disponible</span>
                    ) : (
                      (costCenterName(member.default_cost_center_id) ?? (
                        <span className="text-gray-400">Centro de costo no disponible</span>
                      ))
                    )}
                  </td>
                  <td className="px-5 py-3">
                    <Badge variant={member.status === 'active' ? 'success' : 'default'}>
                      {member.status === 'active' ? 'Activo' : 'Revocado'}
                    </Badge>
                  </td>
                  <td className="px-5 py-3">
                    {member.status === 'active' && (
                      <div className="flex justify-end gap-1">
                        <button
                          onClick={() => setEditingMember(member)}
                          aria-label={`Editar ${memberName(member)}`}
                          className="rounded p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-white/10 dark:hover:text-white"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          onClick={() => openRevokeDialog(member)}
                          aria-label={`Revocar ${memberName(member)}`}
                          className="rounded p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/10 dark:hover:text-red-400"
                        >
                          <UserX size={14} />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {editingMember && (
        <EditMemberModal companyId={companyId} member={editingMember} onClose={() => setEditingMember(null)} />
      )}
      {revokingMember && (
        <ConfirmDialog
          title="Revocar miembro"
          description={`${memberName(revokingMember)} deja de poder viajar a cuenta de la empresa. Puede volver a vincularse más adelante con el código de acceso.`}
          confirmLabel="Revocar"
          isLoading={revokeMutation.isPending}
          error={
            revokeMutation.isError ? extractApiErrorMessage(revokeMutation.error, 'No se pudo revocar al miembro.') : null
          }
          onConfirm={() => revokeMutation.mutate(revokingMember)}
          onClose={closeRevokeDialog}
        />
      )}
    </Card>
  );
}
