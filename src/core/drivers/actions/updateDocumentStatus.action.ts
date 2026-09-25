import { adminApi } from '../../api/adminApi';

interface UpdateDocumentStatusPayload {
  status: 'approved' | 'rejected';
  rejectionReason?: string;
}

export const updateDocumentStatus = async (id: string, payload: UpdateDocumentStatusPayload): Promise<void> => {
  await adminApi.patch(`/admin/documents/${id}/status`, payload);
};
