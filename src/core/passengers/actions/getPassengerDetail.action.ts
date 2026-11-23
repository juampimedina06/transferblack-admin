import { adminApi } from '../../api/adminApi';
import type {
  PassengerDetail,
  PassengerDetailResponse,
} from '../interfaces/passenger.interface';

export const getPassengerDetail = async (id: string): Promise<PassengerDetail> => {
  const { data } = await adminApi.get<PassengerDetailResponse | PassengerDetail>(
    `/admin/passengers/${id}`,
  );
  return 'data' in data ? data.data : data;
};
