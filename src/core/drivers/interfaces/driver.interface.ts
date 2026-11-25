export interface DriverListItem {
  id: string;
  fullName: string;
  email?: string;
  phone?: string;
  approvalStatus: 'pending' | 'approved' | 'rejected' | 'suspended';
  meetingStatus: string;
  walletBalance?: string | null;
  isCashRestricted?: boolean;
  createdAt: string;
}

export interface PaginationMeta {
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

export interface PaginatedDriversResponse {
  data: DriverListItem[];
  pagination: PaginationMeta;
  pendingCount?: number;
}

export interface GetDriversFilters {
  page: number;
  limit: number;
  status?: string;
  search?: string;
  order?: 'asc' | 'desc';
}
