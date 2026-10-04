import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Controller, useForm } from 'react-hook-form';
import { AlertCircle } from 'lucide-react';
import {
  createRecurringTrip,
  friendlyRecurringTripErrorMessage,
} from '../../../core/recurringTrips/recurringTrip.api';
import {
  DAYS_OF_WEEK_OPTIONS,
  createRecurringScheduleFormSchema,
  type CreateRecurringScheduleFormValues,
} from '../../../core/recurringTrips/recurringTrip.interface';
import { type ScheduledTripPointFormValues } from '../../../core/scheduledTrips/scheduledTrip.api';
import { Button, Input, Textarea } from '../../components/common';
import { Modal } from '../../companies/components/Modal';
import { AddressAutocompleteField } from '../../scheduledTrips/components/AddressAutocompleteField';
import { DriverPickerSelect } from '../../scheduledTrips/components/DriverPickerSelect';
import { RouteMapPreview } from '../../scheduledTrips/components/RouteMapPreview';

interface CreateRecurringTripModalProps {
  onClose: () => void;
  onCreated: () => void;
}

export function CreateRecurringTripModal({ onClose, onCreated }: CreateRecurringTripModalProps) {
  const queryClient = useQueryClient();
  const [formError, setFormError] = useState<string | null>(null);
  const [origin, setOrigin] = useState<ScheduledTripPointFormValues | null>(null);
  const [destination, setDestination] = useState<ScheduledTripPointFormValues | null>(null);
  const [pointsError, setPointsError] = useState<string | null>(null);

  const todayStr = new Date().toISOString().slice(0, 10);

  const {
    control,
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CreateRecurringScheduleFormValues>({
    resolver: zodResolver(createRecurringScheduleFormSchema),
    defaultValues: {
      passenger_email: '',
      days_of_week: [1, 3, 5],
      time_of_day: '08:30',
      unit_fare: '',
      billing_cycle: 'weekly',
      valid_from_date: todayStr,
      valid_until_date: '',
      reserved_driver_id: undefined,
      notes: '',
    },
  });

  const selectedDays = watch('days_of_week') || [];
  const selectedBillingCycle = watch('billing_cycle');

  const toggleDay = (dayValue: number) => {
    if (selectedDays.includes(dayValue)) {
      if (selectedDays.length === 1) return;
      setValue(
        'days_of_week',
        selectedDays.filter((d) => d !== dayValue),
        { shouldValidate: true }
      );
    } else {
      setValue('days_of_week', [...selectedDays, dayValue].sort(), { shouldValidate: true });
    }
  };

  const mutation = useMutation({
    mutationFn: createRecurringTrip,
    onMutate: () => setFormError(null),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['recurring-trips'] });
      onCreated();
    },
    onError: (error: unknown) => {
      const friendly = friendlyRecurringTripErrorMessage(error);
      const serverMsg = (error as { response?: { data?: { error?: { message?: string } } }; message?: string })
        ?.response?.data?.error?.message || (error as Error)?.message;
      setFormError(friendly || serverMsg || 'No se pudo crear el abono recurrente.');
    },
  });

  const onSubmit = (values: CreateRecurringScheduleFormValues) => {
    if (!origin || !destination) {
      setPointsError('Seleccioná el origen y el destino en el mapa.');
      return;
    }
    setPointsError(null);
    mutation.mutate({
      ...values,
      origin,
      destination,
    });
  };

  return (
    <Modal title="Nuevo Abono Recurrente" onClose={onClose} dismissible={!mutation.isPending}>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 p-5 max-h-[80vh] overflow-y-auto">
        {formError && (
          <div className="flex items-center gap-2 p-3 text-xs bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 rounded-lg border border-rose-200 dark:border-rose-900/50">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{formError}</span>
          </div>
        )}

        <Input
          label="Email del pasajero / cliente"
          placeholder="cliente@ejemplo.com"
          autoFocus
          error={errors.passenger_email?.message}
          {...register('passenger_email')}
        />

        {/* Días de la semana */}
        <div>
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            Días de la semana
          </label>
          <div className="grid grid-cols-7 gap-1.5">
            {DAYS_OF_WEEK_OPTIONS.map((day) => {
              const isSelected = selectedDays.includes(day.value);
              return (
                <button
                  key={day.value}
                  type="button"
                  onClick={() => toggleDay(day.value)}
                  className={`py-2 px-1 text-xs rounded-lg font-semibold border transition-all text-center ${
                    isSelected
                      ? 'bg-champagne-gold text-obsidian border-champagne-gold shadow-sm'
                      : 'bg-white dark:bg-dark-surface text-gray-600 dark:text-gray-400 border-gray-200 dark:border-dark-border hover:bg-gray-50 dark:hover:bg-white/5'
                  }`}
                >
                  <span className="block text-[11px]">{day.shortLabel}</span>
                </button>
              );
            })}
          </div>
          {errors.days_of_week && (
            <p className="text-xs text-rose-500 mt-1">{errors.days_of_week.message}</p>
          )}
        </div>

        {/* Hora y Ciclo de facturación */}
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Hora fija de retiro"
            type="time"
            error={errors.time_of_day?.message}
            {...register('time_of_day')}
          />
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Ciclo de cobro
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setValue('billing_cycle', 'weekly')}
                className={`py-2 px-2 text-xs font-medium rounded-lg border text-center transition-colors ${
                  selectedBillingCycle === 'weekly'
                    ? 'bg-champagne-gold/20 text-champagne-gold border-champagne-gold font-bold'
                    : 'bg-white dark:bg-dark-surface text-gray-600 dark:text-gray-400 border-gray-200 dark:border-dark-border'
                }`}
              >
                Semanal
              </button>
              <button
                type="button"
                onClick={() => setValue('billing_cycle', 'monthly')}
                className={`py-2 px-2 text-xs font-medium rounded-lg border text-center transition-colors ${
                  selectedBillingCycle === 'monthly'
                    ? 'bg-champagne-gold/20 text-champagne-gold border-champagne-gold font-bold'
                    : 'bg-white dark:bg-dark-surface text-gray-600 dark:text-gray-400 border-gray-200 dark:border-dark-border'
                }`}
              >
                Mensual
              </button>
            </div>
          </div>
        </div>

        {/* Origen y Destino */}
        <AddressAutocompleteField
          label="Origen habitual"
          value={origin}
          onChange={setOrigin}
          error={!origin ? pointsError ?? undefined : undefined}
        />

        <AddressAutocompleteField
          label="Destino habitual"
          value={destination}
          onChange={setDestination}
          error={!destination ? pointsError ?? undefined : undefined}
        />

        {(origin || destination) && <RouteMapPreview origin={origin} destination={destination} />}

        {/* Tarifa y Vigencia */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Input
            label="Tarifa por viaje (ARS)"
            inputMode="decimal"
            placeholder="Ej. 12000.00"
            error={errors.unit_fare?.message}
            {...register('unit_fare')}
          />
          <Input
            label="Válido desde"
            type="date"
            error={errors.valid_from_date?.message}
            {...register('valid_from_date')}
          />
          <Input
            label="Válido hasta (opc.)"
            type="date"
            error={errors.valid_until_date?.message}
            {...register('valid_until_date')}
          />
        </div>

        {/* Chofer fijo opcional */}
        <Controller
          control={control}
          name="reserved_driver_id"
          render={({ field }) => (
            <DriverPickerSelect
              value={field.value ?? null}
              onChange={(driverId) => field.onChange(driverId ?? undefined)}
              error={errors.reserved_driver_id?.message}
            />
          )}
        />

        <Textarea
          label="Notas internas (opcional)"
          placeholder="Instrucciones para el chofer o detalles de facturación..."
          {...register('notes')}
        />

        <div className="flex justify-end gap-2.5 pt-2 border-t border-gray-100 dark:border-dark-border">
          <Button variant="secondary" type="button" onClick={onClose} disabled={mutation.isPending}>
            Cancelar
          </Button>
          <Button variant="primary" type="submit" isLoading={mutation.isPending}>
            Crear Abono
          </Button>
        </div>
      </form>
    </Modal>
  );
}
