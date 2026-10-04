import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  updateRecurringTrip,
  renewRecurringTripCycle,
  type UpdateRecurringTripPayload,
} from '../../../core/recurringTrips/recurringTrip.api';

export function useRecurringTripMutations(tripId?: string) {
  const queryClient = useQueryClient();

  const invalidateQueries = (id?: string) => {
    void queryClient.invalidateQueries({ queryKey: ['recurring-trips'] });
    if (id) {
      void queryClient.invalidateQueries({ queryKey: ['recurring-trip-detail', id] });
    }
  };

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateRecurringTripPayload }) =>
      updateRecurringTrip(id, payload),
    onSuccess: (_, variables) => {
      invalidateQueries(variables.id);
    },
  });

  const renewMutation = useMutation({
    mutationFn: (id: string) => renewRecurringTripCycle(id),
    onSuccess: (_, id) => {
      invalidateQueries(id);
    },
  });

  return {
    updateStatus: (status: 'active' | 'paused' | 'cancelled', id = tripId) => {
      if (!id) return;
      return updateMutation.mutateAsync({ id, payload: { status } });
    },
    renewCycle: (id = tripId) => {
      if (!id) return;
      return renewMutation.mutateAsync(id);
    },
    isUpdating: updateMutation.isPending,
    isRenewing: renewMutation.isPending,
    updateError: updateMutation.error,
    renewError: renewMutation.error,
  };
}
