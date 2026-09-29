import { adminApi } from '../../api/adminApi';

interface UpdateApplicationStatusPayload {
  status: 'approved' | 'rejected' | 'suspended';
  rejectionReason?: string;
}

export const updateApplicationStatus = async (id: string, payload: UpdateApplicationStatusPayload): Promise<void> => {
  await adminApi.patch(`/admin/applications/${id}/status`, payload);
};
