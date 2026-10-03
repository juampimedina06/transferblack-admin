import { useMutation, useQueryClient } from '@tanstack/react-query';
import { assignDriver } from '../../../core/map/actions/assignDriver.action';
import type { AssignDriverPayload, AssignDriverResponse } from '../../../core/map/interfaces/live-map.interface';
import { extractApiErrorMessage } from '../../../core/api/adminApi';

interface UseManualAssignOptions {
  onSuccess?: (data: AssignDriverResponse) => void;
  onError?: (errorMessage: string) => void;
}

export const useManualAssign = (options: UseManualAssignOptions = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: AssignDriverPayload) => assignDriver(payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['active-trips'] });
      queryClient.invalidateQueries({ queryKey: ['fleet-locations'] });
      queryClient.invalidateQueries({ queryKey: ['live-map-kpis'] });
      if (options.onSuccess) {
        options.onSuccess(data);
      }
    },
    onError: (error: unknown) => {
      const message = extractApiErrorMessage(
        error,
        'No se pudo asignar el conductor. Verificá que el viaje siga disponible y que el conductor esté en línea.'
      );
      if (options.onError) {
        options.onError(message);
      }
    },
  });
};
