import { useQuery } from '@tanstack/react-query';
import { getRefundClaims, type ListRefundClaimsFilters } from '../../../core/refundClaims/refundClaim.api';

export const useRefundClaims = (filters: ListRefundClaimsFilters) => {
  return useQuery({
    queryKey: ['refund-claims', filters],
    queryFn: ({ signal }) => getRefundClaims(filters, signal),
    staleTime: 1000 * 20,
    refetchInterval: 30000,
  });
};
