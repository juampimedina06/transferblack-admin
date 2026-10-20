export type AdminPayoutStatus =
  | 'pending'
  | 'processing'
  | 'completed'
  | 'failed'
  // Compatibilidad hacia atrás
  | 'requested'
  | 'approved'
  | 'paid'
  | 'rejected';

export type AdminPayoutType = 'immediate' | 'weekly';

export type AdminPayoutFilterStatus = 'all' | AdminPayoutStatus;
export type AdminPayoutFilterType = 'all' | AdminPayoutType;

export interface AdminPayoutFilters {
  status?: AdminPayoutStatus;
  type?: AdminPayoutType;
  driver_id?: string;
  page?: number;
  limit?: number;
}

export type AdminResolvePayoutPayload =
  | { status: 'processing' }
  | { status: 'completed'; transfer_reference: string; receipt_url?: string }
  | { status: 'failed'; rejection_reason: string }
  // Compatibilidad hacia atrás
  | { status: 'approved' }
  | { status: 'paid'; transfer_reference: string; receipt_url?: string }
  | { status: 'rejected'; rejection_reason: string };

export interface RunWeeklyBatchPayload {
  force?: boolean;
}

export interface RunWeeklyBatchResponse {
  success?: boolean;
  message?: string;
  data?: {
    processed?: number;
    total_amount?: number;
    [key: string]: unknown;
  };
}

export interface AdminPayoutItem {
  id: string;
  driver_id: string;
  type?: AdminPayoutType;
  amount: number | string; // Monto bruto solicitado
  fee_amount?: number | string; // Comisión cobrada
  net_amount?: number | string; // Monto neto exacto que el admin debe transferir manualmente
  currency?: string;
  status: AdminPayoutStatus;
  is_outside_hours?: boolean;
  scheduled_for?: string | null;
  payment_method?: 'CBU' | 'CVU' | string | null;
  destination_alias?: string | null;
  destination_cbu_cvu?: string | null;
  account_holder_name?: string | null;
  account_holder_document?: string | null;
  receipt_url?: string | null;
  transfer_reference?: string | null;
  rejection_reason?: string | null;
  created_at?: string;
  requested_at?: string;
  resolved_at?: string | null;
  resolved_by_user_id?: string | null;
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

