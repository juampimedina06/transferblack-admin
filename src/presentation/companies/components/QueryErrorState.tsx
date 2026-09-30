import { AlertTriangle } from 'lucide-react';
import { extractApiErrorMessage } from '../../../core/api/adminApi';
import { Button } from '../../components/common';

// Estado de error compartido para las consultas de la ficha de empresa: sin
// esto, un fetch fallido dejaba la tabla o la tarjeta simplemente vacía, sin
// forma de saber que algo salió mal ni de reintentar.
export function QueryErrorState({
  error,
  fallback,
  onRetry,
}: {
  error: unknown;
  fallback: string;
  onRetry: () => void;
}) {
  return (
    <div role="alert" className="flex flex-col items-center gap-2 py-6 text-center text-sm text-red-600">
      <AlertTriangle className="h-5 w-5" />
      <p>{extractApiErrorMessage(error, fallback)}</p>
      <Button size="sm" variant="dangerOutline" onClick={onRetry}>
        Reintentar
      </Button>
    </div>
  );
}
