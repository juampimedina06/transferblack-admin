import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { applyServerErrors } from '../../../core/api/adminApi';
import {
  editCostCenterFormFields,
  editCostCenterFormSchema,
  updateCostCenter,
  type CostCenter,
  type EditCostCenterFormValues,
} from '../../../core/companies/costCenters.api';
import { Button, Input } from '../../components/common';
import { Modal } from './Modal';

export function EditCostCenterModal({
  companyId,
  costCenter,
  onClose,
}: {
  companyId: string;
  costCenter: CostCenter;
  onClose: () => void;
}) {
  const queryClient = useQueryClient();
  const [formError, setFormError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<EditCostCenterFormValues>({
    resolver: zodResolver(editCostCenterFormSchema),
    defaultValues: {
      name: costCenter.name,
      monthly_spend_limit: costCenter.monthly_spend_limit ?? '',
      status: costCenter.status,
    },
  });
  const mutation = useMutation({
    mutationFn: (values: EditCostCenterFormValues) => updateCostCenter(costCenter.id, values),
    onMutate: () => setFormError(null),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['company-cost-centers', companyId] });
      onClose();
    },
    onError: (error) => {
      setFormError(
        applyServerErrors(error, setError, editCostCenterFormFields, 'No se pudo actualizar el centro de costo.'),
      );
    },
  });

  return (
    <Modal title={`Editar ${costCenter.code}`} onClose={onClose}>
      <form onSubmit={handleSubmit((values) => mutation.mutate(values))} className="flex flex-col gap-4 p-5">
        <Input label="Nombre" error={errors.name?.message} {...register('name')} />
        <Input
          label="Tope mensual (opcional)"
          inputMode="decimal"
          placeholder="Ej. 150000.00"
          error={errors.monthly_spend_limit?.message}
          {...register('monthly_spend_limit')}
        />
        <p className="text-xs text-gray-500 dark:text-white/50">
          No puede superar el tope de la empresa. Dejalo vacío para no ponerle tope propio.
        </p>
        <label className="flex flex-col gap-1 text-[10px] font-semibold uppercase tracking-wider text-gray-400">
          Estado
          <select
            {...register('status')}
            className="rounded-md border border-gray-200 bg-white px-3 py-2 text-[13px] text-gray-800 focus:border-champagne-gold focus:outline-none focus:ring-1 focus:ring-champagne-gold/20 dark:border-white/10 dark:bg-white/5 dark:text-white"
          >
            <option value="active">Activo</option>
            <option value="archived">Archivado</option>
          </select>
        </label>
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
