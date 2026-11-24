import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Controller, useForm } from 'react-hook-form';
import { Banknote, CalendarPlus, CreditCard } from 'lucide-react';
import { applyServerErrors } from '../../../core/api/adminApi';
import {
  createScheduledTrip,
  createScheduledTripFormFields,
  createScheduledTripFormSchema,
  friendlyScheduledTripErrorMessage,
  type CreateScheduledTripFormValues,
  type ScheduledTripPaymentMethod,
  type ScheduledTripPointFormValues,
} from '../../../core/scheduledTrips/scheduledTrip.api';
import { Button, Input, Textarea } from '../../components/common';
import { Modal } from '../../companies/components/Modal';
import { AddressAutocompleteField } from './AddressAutocompleteField';
import { DriverPickerSelect } from './DriverPickerSelect';
import { RouteMapPreview } from './RouteMapPreview';
import { cn } from '../../utils/cn';

const PAYMENT_METHOD_OPTIONS: {
  value: ScheduledTripPaymentMethod;
  label: string;
  hint: string;
  icon: typeof Banknote;
}[] = [
  {
    value: 'account_money',
    label: 'Prepago',
    hint: 'Lo cobrás antes con link de Mercado Pago o transferencia. Sin pago no se activa.',
    icon: CreditCard,
  },
  {
    value: 'cash',
    label: 'Efectivo',
    hint: 'El pasajero le paga al chofer al terminar. Se activa solo, sin cobro previo.',
    icon: Banknote,
  },
];

interface CreateScheduledTripModalProps {
  onClose: () => void;
  onCreated: () => void;
}

/**
 * Alta de un viaje reservado: la agencia ya arreglo precio y cobro con el
 * pasajero por WhatsApp, esto solo registra el viaje (`POST
 * /admin/scheduled-trips`). Prepago: el cobro se genera despues, desde el
 * detalle. Efectivo: no hay cobro previo, lo cobra el chofer al terminar.
 *
 * Origen y destino se manejan afuera de react-hook-form: son objetos que
 * elige `AddressAutocompleteField` (direccion + lat/lng), no inputs sueltos,
 * y se validan a mano al enviar en vez de forzar un tipo `T | null` dentro
 * del resolver de zod.
 */
export function CreateScheduledTripModal({ onClose, onCreated }: CreateScheduledTripModalProps) {
  const queryClient = useQueryClient();
  const [formError, setFormError] = useState<string | null>(null);
  const [origin, setOrigin] = useState<ScheduledTripPointFormValues | null>(null);
  const [destination, setDestination] = useState<ScheduledTripPointFormValues | null>(null);
  const [pointsError, setPointsError] = useState<string | null>(null);

  const {
    control,
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<CreateScheduledTripFormValues>({
    resolver: zodResolver(createScheduledTripFormSchema),
    defaultValues: {
      passenger_email: '',
      scheduled_date: '',
      scheduled_time: '',
      agreed_fare: '',
      reserved_driver_id: undefined,
      notes: undefined,
      payment_method: 'account_money',
    },
  });

  const mutation = useMutation({
    mutationFn: createScheduledTrip,
    onMutate: () => setFormError(null),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['scheduled-trips'] });
      onCreated();
    },
    onError: (error) => {
      setFormError(
        friendlyScheduledTripErrorMessage(error) ??
          applyServerErrors(error, setError, createScheduledTripFormFields, 'No se pudo crear el viaje reservado.'),
      );
    },
  });

  const onSubmit = (values: CreateScheduledTripFormValues) => {
    if (!origin || !destination) {
      setPointsError('Elegí el origen y el destino.');
      return;
    }
    setPointsError(null);
    mutation.mutate({ ...values, origin, destination });
  };

  return (
    <Modal title="Nueva reserva" onClose={onClose} dismissible={!mutation.isPending}>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 p-5">
        <Input
          label="Email del pasajero"
          placeholder="pasajero@ejemplo.com"
          autoFocus
          error={errors.passenger_email?.message}
          {...register('passenger_email')}
        />

        <AddressAutocompleteField
          label="Origen"
          value={origin}
          onChange={setOrigin}
          error={!origin ? pointsError ?? undefined : undefined}
        />

        <AddressAutocompleteField
          label="Destino"
          value={destination}
          onChange={setDestination}
          error={!destination ? pointsError ?? undefined : undefined}
        />

        {(origin || destination) && <RouteMapPreview origin={origin} destination={destination} />}

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Fecha de retiro"
            type="date"
            error={errors.scheduled_date?.message}
            {...register('scheduled_date')}
          />
          <Input
            label="Hora de retiro"
            type="time"
            error={errors.scheduled_time?.message}
            {...register('scheduled_time')}
          />
        </div>

        <Input
          label="Precio acordado (ARS)"
          inputMode="decimal"
          placeholder="Ej. 15000.00"
          error={errors.agreed_fare?.message}
          {...register('agreed_fare')}
        />

        <Controller
          control={control}
          name="payment_method"
          render={({ field }) => {
            const selected = PAYMENT_METHOD_OPTIONS.find((option) => option.value === field.value);
            return (
              <div className="flex flex-col gap-1.5">
                <span className="block text-[11px] font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                  Forma de pago
                </span>
                <div
                  role="radiogroup"
                  aria-label="Forma de pago"
                  className="flex gap-1 rounded-lg border border-gray-200 p-1 dark:border-white/10"
                >
                  {PAYMENT_METHOD_OPTIONS.map(({ value, label, icon: Icon }) => (
                    <button
                      key={value}
                      type="button"
                      role="radio"
                      aria-checked={field.value === value}
                      onClick={() => field.onChange(value)}
                      className={cn(
                        'flex flex-1 items-center justify-center gap-1.5 rounded-md px-3 py-2 text-[13px] font-medium transition-colors',
                        field.value === value
                          ? 'bg-champagne-gold/15 text-[#9A7D3A] dark:text-champagne-gold'
                          : 'text-gray-500 hover:bg-gray-50 dark:text-white/60 dark:hover:bg-white/5',
                      )}
                    >
                      <Icon size={14} /> {label}
                    </button>
                  ))}
                </div>
                {selected && <p className="text-xs text-gray-500 dark:text-white/60">{selected.hint}</p>}
              </div>
            );
          }}
        />

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
          label="Notas (opcional)"
          placeholder="Cualquier detalle para el chofer o la agencia"
          {...register('notes')}
        />

        {formError && (
          <p role="alert" className="text-sm text-red-600">
            {formError}
          </p>
        )}

        <div className="flex justify-end gap-3 border-t border-gray-100 pt-4 dark:border-white/10">
          <Button type="button" variant="secondary" onClick={onClose} disabled={mutation.isPending}>
            Cancelar
          </Button>
          <Button type="submit" variant="gold" isLoading={mutation.isPending} leftIcon={<CalendarPlus size={15} />}>
            Crear reserva
          </Button>
        </div>
      </form>
    </Modal>
  );
}
