import { useMutation, useQueryClient } from '@tanstack/react-query';
import { resolveRefundClaim, type ResolveRefundClaimPayload } from '../../../core/refundClaims/refundClaim.api';

interface ResolveRefundClaimParams {
  tripId: string;
  idempotencyKey: string;
  payload: ResolveRefundClaimPayload;
}

export const useResolveRefundClaim = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ tripId, idempotencyKey, payload }: ResolveRefundClaimParams) =>
      resolveRefundClaim(tripId, idempotencyKey, payload),
    onSuccess: () => {
      // Un reclamo resuelto puede desaparecer de "pendientes" y aparecer en
      // "resueltos", o seguir en pendientes con menos monto (resolucion
      // parcial): invalida ambas pestañas.
      void queryClient.invalidateQueries({ queryKey: ['refund-claims'] });
    },
  });
};
