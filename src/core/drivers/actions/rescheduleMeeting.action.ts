import { adminApi } from '../../api/adminApi';
import type { DriverMeeting } from '../interfaces/driver-detail.interface';

interface RescheduleMeetingPayload {
  scheduledAt: string;
  location: string;
}

export const rescheduleMeeting = async (meetingId: string, payload: RescheduleMeetingPayload): Promise<DriverMeeting> => {
  const { data } = await adminApi.patch<DriverMeeting>(`/admin/meetings/${meetingId}/reschedule`, payload);
  return data;
};
