import { adminApi } from '../../api/adminApi';

interface FinalizeMeetingPayload {
  status: 'completed' | 'no_show' | 'cancelled';
  adminNotes?: string;
}

export const finalizeMeeting = async (meetingId: string, payload: FinalizeMeetingPayload): Promise<void> => {
  await adminApi.patch(`/admin/meetings/${meetingId}/finalize`, payload);
};
