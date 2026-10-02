import { AlertTriangle } from 'lucide-react';
import { Button } from '../../components/common';
import { Modal } from './Modal';

// Confirmacion generica para acciones destructivas de la feature de empresas
// (hoy: revocar un miembro). Sin esto, un click de mas revocaba el acceso de
// un empleado sin forma de arrepentirse.
export function ConfirmDialog({
  title,
  description,
  confirmLabel,
  isLoading = false,
  error,
  onConfirm,
  onClose,
}: {
  title: string;
  description: string;
  confirmLabel: string;
  isLoading?: boolean;
  error?: string | null;
  onConfirm: () => void;
  onClose: () => void;
}) {
  return (
    <Modal title={title} onClose={onClose} dismissible={!isLoading}>
      <div className="flex flex-col gap-4 p-5">
        <div className="flex gap-3">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" />
          <p className="text-sm text-gray-600 dark:text-white/70">{description}</p>
        </div>
        {error && (
          <p role="alert" className="text-sm text-red-600">
            {error}
          </p>
        )}
        <div className="flex justify-end gap-3 border-t border-gray-100 pt-4 dark:border-white/10">
          <Button type="button" variant="secondary" onClick={onClose} disabled={isLoading}>
            Cancelar
          </Button>
          <Button type="button" variant="danger" isLoading={isLoading} onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
