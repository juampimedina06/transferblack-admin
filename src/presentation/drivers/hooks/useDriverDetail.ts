import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getDriverDetail } from '../../../core/drivers/actions/getDriverDetail.action';
import { updateDocumentStatus } from '../../../core/drivers/actions/updateDocumentStatus.action';
import { updateApplicationStatus } from '../../../core/drivers/actions/updateApplicationStatus.action';
import { scheduleMeeting } from '../../../core/drivers/actions/scheduleMeeting.action';
import { finalizeMeeting } from '../../../core/drivers/actions/finalizeMeeting.action';

import type { DriverDetailResponse } from '../../../core/drivers/interfaces/driver-detail.interface';

import { extractApiErrorMessage } from '../../../core/api/adminApi';

export const useDriverDetail = (id: string) => {
  const queryClient = useQueryClient();

  const detailQuery = useQuery({
    queryKey: ['driver-detail', id],
    queryFn: () => getDriverDetail(id),
    enabled: !!id,
    refetchInterval: 4000,
  });

  const documentMutation = useMutation({
    mutationFn: ({ docId, status, reason }: { docId: string; status: 'approved' | 'rejected'; reason?: string }) =>
      updateDocumentStatus(docId, { status, rejectionReason: reason }),
    onMutate: async ({ docId, status, reason }) => {
      await queryClient.cancelQueries({ queryKey: ['driver-detail', id] });
      const previousDetail = queryClient.getQueryData<DriverDetailResponse>(['driver-detail', id]);

      if (previousDetail) {
        queryClient.setQueryData<DriverDetailResponse>(['driver-detail', id], {
          ...previousDetail,
          driverDocuments: previousDetail.driverDocuments.map(doc =>
            doc.id === docId ? { ...doc, status, rejectionReason: reason } : doc
          ),
          vehicleDocuments: previousDetail.vehicleDocuments.map(doc =>
            doc.id === docId ? { ...doc, status, rejectionReason: reason } : doc
          ),
        });
      }

      return { previousDetail };
    },
    onError: (error: unknown, _vars, context) => {
      if (context?.previousDetail) {
        queryClient.setQueryData(['driver-detail', id], context.previousDetail);
      }
      alert(extractApiErrorMessage(error, 'Error al actualizar el documento'));
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['driver-detail', id] });
    },
  });

  const statusMutation = useMutation({
    mutationFn: ({ status, reason }: { status: 'approved' | 'rejected' | 'suspended', reason?: string }) =>
      updateApplicationStatus(id, { status, rejectionReason: reason }),
    onMutate: async ({ status, reason }) => {
      await queryClient.cancelQueries({ queryKey: ['driver-detail', id] });
      const previousDetail = queryClient.getQueryData<DriverDetailResponse>(['driver-detail', id]);

      if (previousDetail) {
        queryClient.setQueryData<DriverDetailResponse>(['driver-detail', id], {
          ...previousDetail,
          driverProfile: {
            ...previousDetail.driverProfile,
            approvalStatus: status,
            rejectionReason: reason || null,
          },
        });
      }

      return { previousDetail };
    },
    onError: (error: unknown, _vars, context) => {
      if (context?.previousDetail) {
        queryClient.setQueryData(['driver-detail', id], context.previousDetail);
      }
      alert(extractApiErrorMessage(error, 'Error al actualizar el legajo'));
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['driver-detail', id] });
    },
  });

  const scheduleMutation = useMutation({
    mutationFn: ({ scheduledAt, location }: { scheduledAt: string, location: string }) =>
      scheduleMeeting(id, { scheduledAt, location }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['driver-detail', id] });
    },
    onError: (error: unknown) => {
      alert(extractApiErrorMessage(error, 'Error al agendar la reunión'));
    }
  });

  const finalizeMeetingMutation = useMutation({
    mutationFn: ({ meetingId, status, adminNotes }: { meetingId: string, status: 'completed' | 'no_show' | 'cancelled', adminNotes?: string }) =>
      finalizeMeeting(meetingId, { status, adminNotes }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['driver-detail', id] });
    },
    onError: (error: unknown) => {
      alert(extractApiErrorMessage(error, 'Error al cerrar la reunión'));
    }
  });

  return {
    detailQuery,
    documentMutation,
    statusMutation,
    scheduleMutation,
    finalizeMeetingMutation,
  };
};
