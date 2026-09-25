import React from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { X } from 'lucide-react';
import { Button, Textarea } from '../../../components/common';

const rejectionSchema = z.object({
  reason: z.string().min(10, 'El motivo debe tener al menos 10 caracteres'),
});

type RejectionFormData = z.infer<typeof rejectionSchema>;

interface RejectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (reason: string) => void;
  title: string;
}

export const RejectionModal: React.FC<RejectionModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  title,
}) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<RejectionFormData>({
    resolver: zodResolver(rejectionSchema),
  });

  if (!isOpen) return null;

  const handleFormSubmit = (data: RejectionFormData) => {
    onSubmit(data.reason);
    reset();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-obsidian border border-white/10 rounded-xl w-full max-w-md overflow-hidden flex flex-col shadow-2xl">
        <div className="flex justify-between items-center p-4 border-b border-white/10">
          <h3 className="text-white font-semibold text-sm">{title}</h3>
          <button onClick={onClose} className="text-white/50 hover:text-white transition-colors cursor-pointer">
            <X size={18} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit(handleFormSubmit)} className="p-4 flex flex-col gap-4">
          <Textarea
            label="Motivo del rechazo"
            {...register('reason')}
            rows={4}
            placeholder="Explica detalladamente por qué se rechaza..."
            error={errors.reason?.message}
          />
          
          <div className="flex justify-end gap-2.5 mt-1">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-white/70 hover:text-white"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="danger"
              size="sm"
              isLoading={isSubmitting}
            >
              Confirmar Rechazo
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
