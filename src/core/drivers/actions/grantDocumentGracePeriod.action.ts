import { adminApi } from '../../api/adminApi';

export interface GrantDocumentGracePeriodPayload {
  days: number;
}

export interface GrantDocumentGracePeriodResponse {
  data: {
    id: string;
    status: string;
    expiresAt: string | null;
    graceUntil: string;
  };
}

export const grantDocumentGracePeriod = async (
  documentId: string,
  payload: GrantDocumentGracePeriodPayload,
): Promise<GrantDocumentGracePeriodResponse> => {
  const { data } = await adminApi.patch<GrantDocumentGracePeriodResponse>(
    `/admin/documents/${documentId}/grace-period`,
    payload,
  );
  return data;
};
