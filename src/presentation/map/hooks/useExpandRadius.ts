import { useMutation, useQueryClient } from '@tanstack/react-query';
import { expandRadius } from '../../../core/map/actions/expandRadius.action';
import type { ExpandRadiusPayload, ExpandRadiusResponse } from '../../../core/map/interfaces/live-map.interface';
import { extractApiErrorMessage } from '../../../core/api/adminApi';

interface UseExpandRadiusOptions {
  onSuccess?: (data: ExpandRadiusResponse) => void;
  onError?: (errorMessage: string) => void;
}

export const useExpandRadius = (options: UseExpandRadiusOptions = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: ExpandRadiusPayload) => expandRadius(payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['active-trips'] });
      if (options.onSuccess) {
        options.onSuccess(data);
      }
    },
    onError: (error: unknown) => {
      const message = extractApiErrorMessage(
        error,
        'No se pudo ampliar el radio de búsqueda para este viaje.'
      );
      if (options.onError) {
        options.onError(message);
      }
    },
  });
};
