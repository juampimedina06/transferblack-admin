import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { extractApiErrorMessage } from '../../../core/api/adminApi';
import {
  editMonthlySpendLimitFormSchema,
  updateCompanyMonthlySpendLimit,
  type Company,
  type EditMonthlySpendLimitFormValues,
} from '../../../core/companies/company.api';
import { Button, Input } from '../../components/common';
import { Modal } from './Modal';

export function EditMonthlyLimitModal({
  company,
  onClose,
  onUpdated,
}: {
  company: Company;
  onClose: () => void;
  onUpdated: (company: Company) => void;
}) {
  const queryClient = useQueryClient();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<EditMonthlySpendLimitFormValues>({
    resolver: zodResolver(editMonthlySpendLimitFormSchema),
    defaultValues: { monthly_spend_limit: company.monthly_spend_limit ?? '' },
  });
  const mutation = useMutation({
    mutationFn: (values: EditMonthlySpendLimitFormValues) =>
      updateCompanyMonthlySpendLimit(company.id, values),
    onSuccess: (updated) => {
      onUpdated(updated);
      void queryClient.invalidateQueries({ queryKey: ['companies'] });
      onClose();
    },
  });

  return (
    <Modal title="Editar tope mensual" onClose={onClose}>
      <form
        onSubmit={handleSubmit((values) => mutation.mutate(values))}
        className="flex flex-col gap-4 p-5"
      >
        <Input
          label="Tope mensual"
          inputMode="decimal"
          placeholder="Ej. 250000.00"
          autoFocus
          error={errors.monthly_spend_limit?.message}
          {...register('monthly_spend_limit')}
        />
        <p className="text-xs text-gray-500 dark:text-white/50">
          Es obligatorio para que los empleados puedan viajar a cuenta de la empresa.
        </p>
        {mutation.isError && (
          <p role="alert" className="text-sm text-red-600">
            {extractApiErrorMessage(mutation.error, 'No se pudo actualizar el tope mensual.')}
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
