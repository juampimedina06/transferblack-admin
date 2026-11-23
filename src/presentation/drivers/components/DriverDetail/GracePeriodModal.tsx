import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { addDays, format } from 'date-fns';
import { es } from 'date-fns/locale';
import { CalendarClock, X } from 'lucide-react';
import { Button, Input } from '../../../components/common';

const gracePeriodSchema = z.object({
  days: z
    .number({ message: 'Ingresá una cantidad de días válida' })
    .int('Debe ser un número entero')
    .min(1, 'El plazo mínimo es de 1 día')
    .max(365, 'El plazo máximo es de 365 días'),
});

type GracePeriodFormData = z.infer<typeof gracePeriodSchema>;

const PRESET_DAYS = [15, 30, 60, 90] as const;

interface GracePeriodModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (days: number) => void;
  documentTitle: string;
  currentGraceUntil?: string | null;
  isSubmitting?: boolean;
}

export const GracePeriodModal: React.FC<GracePeriodModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  documentTitle,
  currentGraceUntil,
  isSubmitting = false,
}) => {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<GracePeriodFormData>({
    resolver: zodResolver(gracePeriodSchema),
    defaultValues: { days: 30 },
  });

  useEffect(() => {
    if (isOpen) {
      reset({ days: 30 });
    }
  }, [isOpen, reset]);

  if (!isOpen) return null;

  const watchedDays = watch('days');
  const validPreviewDays = Number.isFinite(watchedDays) && watchedDays >= 1 && watchedDays <= 365 ? watchedDays : null;
  const previewDate = validPreviewDays ? addDays(new Date(), validPreviewDays) : null;

  const handleFormSubmit = (data: GracePeriodFormData) => {
    onSubmit(data.days);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Otorgar plazo de gracia"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-obsidian border border-gray-200 dark:border-white/10 rounded-xl w-full max-w-md overflow-hidden flex flex-col shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-4 border-b border-gray-100 dark:border-white/10">
          <div className="flex items-center gap-2 min-w-0">
            <CalendarClock className="w-4 h-4 text-champagne-gold shrink-0" />
            <h3 className="text-gray-900 dark:text-white font-semibold text-sm truncate">
              Otorgar plazo de gracia
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 dark:text-white/50 dark:hover:text-white transition-colors cursor-pointer"
            aria-label="Cerrar modal"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="p-4 flex flex-col gap-4">
          <div className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
            El documento <strong className="text-gray-900 dark:text-white">{documentTitle}</strong> se encuentra vencido y no puede aprobarse directamente. Podés habilitar un plazo temporal para que el conductor siga operando mientras lo renueva.
          </div>

          {currentGraceUntil && (
            <div className="bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/25 rounded-lg px-3 py-2 text-xs text-amber-800 dark:text-amber-300">
              Prórroga actual vigente hasta{' '}
              <strong>{format(new Date(currentGraceUntil), 'dd/MM/yyyy', { locale: es })}</strong>.
            </div>
          )}

          <div className="flex flex-col gap-2">
            <Input
              label="Plazo en días"
              type="number"
              min={1}
              max={365}
              step={1}
              {...register('days', { valueAsNumber: true })}
              error={errors.days?.message}
            />

            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[11px] text-gray-500 dark:text-gray-400 mr-1">Opciones rápidas:</span>
              {PRESET_DAYS.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setValue('days', preset, { shouldValidate: true })}
                  className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                    watchedDays === preset
                      ? 'bg-obsidian dark:bg-champagne-gold text-white dark:text-obsidian'
                      : 'bg-gray-100 dark:bg-white/5 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/10'
                  }`}
                >
                  {preset} días
                </button>
              ))}
            </div>
          </div>

          {previewDate && (
            <div className="bg-gray-50 dark:bg-white/[0.03] border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2.5 text-xs text-gray-700 dark:text-gray-200 flex items-center justify-between">
              <span>Habilitado hasta:</span>
              <strong className="text-gray-900 dark:text-champagne-gold">
                {format(previewDate, "dd 'de' MMMM 'de' yyyy", { locale: es })}
              </strong>
            </div>
          )}

          <div className="flex justify-end gap-2.5 mt-1">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={isSubmitting}
              onClick={onClose}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={isSubmitting}
            >
              Confirmar plazo
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
