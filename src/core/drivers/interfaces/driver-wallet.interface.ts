export type WalletLedgerEntryType =
  | 'trip_earning'
  | 'trip_commission_debt'
  | 'trip_refund'
  | 'trip_chargeback'
  | 'debt_settlement'
  | 'manual_adjustment'
  | 'payout';

export interface DriverWalletBreakdown {
  trip_earnings: string;
  cash_commission_debt: string;
  refunds: string;
  settlements: string;
  adjustments: string;
  paid_out: string;
}

export interface DriverWalletSummary {
  currency: string;
  balance: string;
  available_balance: string;
  breakdown: DriverWalletBreakdown;
  pending_payout: {
    id: string;
    amount: string;
    status: string;
    requested_at: string;
  } | null;
  debt_limit: string;
  can_accept_trips: boolean;
  is_cash_restricted: boolean;
  last_entry_at: string | null;
}

export interface DriverWalletTransaction {
  id: string;
  entry_group_id: string;
  entry_type: WalletLedgerEntryType | string;
  amount: string;
  currency: string;
  trip_id: string | null;
  payment_id: string | null;
  payout_request_id: string | null;
  commission_percent: string | null;
  notes: string | null;
  created_at: string;
}

export interface DriverWalletAdminData {
  driver_id: string;
  wallet: DriverWalletSummary;
  transactions: DriverWalletTransaction[];
}

export interface DriverWalletAdminResponse {
  data: DriverWalletAdminData;
}

export type DebtSettlementMethod = 'cash' | 'transfer';

export interface SettleDriverDebtPayload {
  amount: string;
  method: DebtSettlementMethod;
  notes: string;
}

export interface SettleDriverDebtResponse {
  data: DriverWalletSummary;
}
