export type AdminPayoutStatus = 'requested' | 'approved' | 'paid' | 'rejected';

export type AdminPayoutFilterStatus = 'all' | AdminPayoutStatus;

export interface AdminPayoutFilters {
  status?: AdminPayoutStatus;
  driver_id?: string;
  page?: number;
  limit?: number;
}

export interface AdminResolvePayoutPayload {
  status: 'approved' | 'paid' | 'rejected';
  transfer_reference?: string; // Obligatorio si status === 'paid' (1 a 200 caracteres)
  receipt_url?: string;        // Opcional si status === 'paid' (URL válida max 1000 car.)
  rejection_reason?: string;   // Obligatorio si status === 'rejected' (1 a 500 car.)
}

export interface AdminPayoutItem {
  id: string;
  driver_id: string;
  amount: string;
  currency: string;
  status: AdminPayoutStatus;
  payment_method: 'CBU' | 'CVU' | string | null;
  destination_alias: string | null;
  destination_cbu_cvu: string | null;
  account_holder_name: string | null;
  account_holder_document: string | null;
  receipt_url: string | null;
  requested_at: string;
  resolved_at: string | null;
  resolved_by_user_id: string | null;
  rejection_reason: string | null;
  transfer_reference: string | null;
}

export interface AdminPayoutPagination {
  page: number;
  limit: number;
  total: number;
  total_pages: number;
}

export interface AdminPayoutsListResponse {
  data: {
    payouts: AdminPayoutItem[];
    pagination: AdminPayoutPagination;
  };
}

export interface AdminPayoutDetailResponse {
  data: AdminPayoutItem;
}
