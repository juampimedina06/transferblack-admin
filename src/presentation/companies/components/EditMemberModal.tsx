import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { applyServerErrors } from '../../../core/api/adminApi';
import {
  editMemberFormFields,
  editMemberFormSchema,
  updateMember,
  type CorporateMember,
  type EditMemberFormValues,
} from '../../../core/companies/companyMembers.api';
import { getCompanyCostCenters } from '../../../core/companies/costCenters.api';
import { Button, Input } from '../../components/common';
import { memberName, roleLabel } from '../utils/memberDisplay';
import { Modal } from './Modal';

export function EditMemberModal({
  companyId,
  member,
  onClose,
}: {
  companyId: string;
  member: CorporateMember;
  onClose: () => void;
}) {
  const queryClient = useQueryClient();
  const [formError, setFormError] = useState<string | null>(null);
  // Misma queryKey que `CostCentersTable`/`MembersTable`: si ya se cargaron
  // para esta empresa, se reusa el cache en vez de pedirlos de nuevo.
  const costCenters = useQuery({
    queryKey: ['company-cost-centers', companyId],
    queryFn: ({ signal }) => getCompanyCostCenters(companyId, signal),
  });
  const allCostCenters = costCenters.data ?? [];
  const activeCostCenters = allCostCenters.filter((costCenter) => costCenter.status === 'active');
  // Si el centro de costo actual del miembro esta archivado, no aparece entre
  // los activos: sin agregarlo aparte, el <select> caia al primer option
  // ("Sin centro de costo") y guardar sin tocar este campo le sacaba el
  // centro de costo al empleado sin que el admin lo pidiera.
  const currentCostCenterId = member.default_cost_center_id;
  const currentCostCenter = currentCostCenterId
    ? allCostCenters.find((costCenter) => costCenter.id === currentCostCenterId)
    : null;
  const showCurrentAsArchivedOption =
    currentCostCenterId !== null && !activeCostCenters.some((costCenter) => costCenter.id === currentCostCenterId);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<EditMemberFormValues>({
    resolver: zodResolver(editMemberFormSchema),
    defaultValues: {
      corporate_role: member.corporate_role,
      default_cost_center_id: member.default_cost_center_id ?? '',
      monthly_spend_limit: member.monthly_spend_limit ?? '',
    },
  });
  const mutation = useMutation({
    mutationFn: (values: EditMemberFormValues) => updateMember(companyId, member.profile_id, values),
    onMutate: () => setFormError(null),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['company-members', companyId] });
      onClose();
    },
    onError: (error) => {
      setFormError(applyServerErrors(error, setError, editMemberFormFields, 'No se pudo actualizar el miembro.'));
    },
  });

  return (
    <Modal title={`Editar ${memberName(member)}`} onClose={onClose}>
      <form onSubmit={handleSubmit((values) => mutation.mutate(values))} className="flex flex-col gap-4 p-5">
        <label className="flex flex-col gap-1 text-[10px] font-semibold uppercase tracking-wider text-gray-400">
          Rol
          <select
            {...register('corporate_role')}
            className="rounded-md border border-gray-200 bg-white px-3 py-2 text-[13px] text-gray-800 focus:border-champagne-gold focus:outline-none focus:ring-1 focus:ring-champagne-gold/20 dark:border-white/10 dark:bg-white/5 dark:text-white"
          >
            <option value="employee">{roleLabel.employee}</option>
            <option value="manager">{roleLabel.manager}</option>
          </select>
        </label>
        <label className="flex flex-col gap-1 text-[10px] font-semibold uppercase tracking-wider text-gray-400">
          Centro de costo
          <select
            {...register('default_cost_center_id')}
            disabled={costCenters.isLoading}
            className="rounded-md border border-gray-200 bg-white px-3 py-2 text-[13px] text-gray-800 focus:border-champagne-gold focus:outline-none focus:ring-1 focus:ring-champagne-gold/20 disabled:opacity-50 dark:border-white/10 dark:bg-white/5 dark:text-white"
          >
            <option value="">Sin centro de costo</option>
            {activeCostCenters.map((costCenter) => (
              <option key={costCenter.id} value={costCenter.id}>
                {costCenter.code} · {costCenter.name}
              </option>
            ))}
            {showCurrentAsArchivedOption && currentCostCenterId && (
              <option value={currentCostCenterId}>
                {currentCostCenter
                  ? `${currentCostCenter.code} · ${currentCostCenter.name} (archivado)`
                  : 'Centro de costo actual (archivado)'}
              </option>
            )}
          </select>
          {costCenters.isLoading && (
            <span className="text-xs font-normal normal-case tracking-normal text-gray-400">
              Cargando centros de costo…
            </span>
          )}
        </label>
        <Input
          label="Tope mensual individual (opcional)"
          inputMode="decimal"
          placeholder="Ej. 50000.00"
          error={errors.monthly_spend_limit?.message}
          {...register('monthly_spend_limit')}
        />
        <p className="text-xs text-gray-500 dark:text-white/50">
          No puede superar el tope del centro de costo ni el de la empresa.
        </p>
        {formError && (
          <p role="alert" className="text-sm text-red-600">
            {formError}
          </p>
        )}
        <div className="flex justify-end gap-3 border-t border-gray-100 pt-4 dark:border-white/10">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" variant="gold" isLoading={mutation.isPending}>
            Guardar
          </Button>
        </div>
      </form>
    </Modal>
  );
}
