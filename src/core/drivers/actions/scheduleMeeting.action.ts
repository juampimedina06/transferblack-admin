import { adminApi } from '../../api/adminApi';
import type { DriverMeeting } from '../interfaces/driver-detail.interface';

interface ScheduleMeetingPayload {
  scheduledAt: string;
  location: string;
}

export const scheduleMeeting = async (id: string, payload: ScheduleMeetingPayload): Promise<DriverMeeting> => {
  const { data } = await adminApi.post<DriverMeeting>(`/admin/applications/${id}/meeting`, payload);
  return data;
};
