import { useQuery } from '@tanstack/react-query';
import { getPassengerDetail } from '../../../core/passengers/actions/getPassengerDetail.action';

export const usePassengerDetail = (id: string) => {
  return useQuery({
    queryKey: ['passenger-detail', id],
    queryFn: () => getPassengerDetail(id),
    enabled: !!id,
    staleTime: 1000 * 30,
  });
};
