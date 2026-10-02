import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { Plus } from 'lucide-react';
import { applyServerErrors } from '../../../core/api/adminApi';
import {
  createCostCenter,
  createCostCenterFormFields,
  createCostCenterFormSchema,
  type CostCenter,
  type CreateCostCenterFormValues,
} from '../../../core/companies/costCenters.api';
import { Button, Input } from '../../components/common';
import { Modal } from './Modal';

export function CreateCostCenterModal({
  companyId,
  onClose,
  onCreated,
}: {
  companyId: string;
  onClose: () => void;
  onCreated: (costCenter: CostCenter) => void;
}) {
  const queryClient = useQueryClient();
  const [formError, setFormError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<CreateCostCenterFormValues>({
    resolver: zodResolver(createCostCenterFormSchema),
    defaultValues: { code: '', name: '', monthly_spend_limit: '' },
  });
  const mutation = useMutation({
    mutationFn: (values: CreateCostCenterFormValues) => createCostCenter(companyId, values),
    onMutate: () => setFormError(null),
    onSuccess: (created) => {
      onCreated(created);
      void queryClient.invalidateQueries({ queryKey: ['company-cost-centers', companyId] });
      onClose();
    },
    onError: (error) => {
      setFormError(
        applyServerErrors(error, setError, createCostCenterFormFields, 'No se pudo crear el centro de costo.'),
      );
    },
  });

  return (
    <Modal title="Nuevo centro de costo" onClose={onClose}>
      <form onSubmit={handleSubmit((values) => mutation.mutate(values))} className="flex flex-col gap-4 p-5">
        <Input
          label="Código"
          placeholder="Ej. VENTAS-AR"
          autoFocus
          error={errors.code?.message}
          {...register('code')}
        />
        <Input label="Nombre" placeholder="Ej. Ventas Argentina" error={errors.name?.message} {...register('name')} />
        <Input
          label="Tope mensual (opcional)"
          inputMode="decimal"
          placeholder="Ej. 150000.00"
          error={errors.monthly_spend_limit?.message}
          {...register('monthly_spend_limit')}
        />
        {formError && (
          <p role="alert" className="text-sm text-red-600">
            {formError}
          </p>
        )}
        <div className="flex justify-end gap-3 border-t border-gray-100 pt-4 dark:border-white/10">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" variant="gold" isLoading={mutation.isPending} leftIcon={<Plus size={16} />}>
            Crear centro de costo
          </Button>
        </div>
      </form>
    </Modal>
  );
}
