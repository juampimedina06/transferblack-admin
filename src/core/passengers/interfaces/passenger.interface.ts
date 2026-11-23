export type PassengerAccountStatus = 'active' | 'blocked' | 'deleted';

export interface PassengerListItem {
  id: string;
  fullName: string;
  email: string;
  phone?: string | null;
  status: PassengerAccountStatus;
  emailVerifiedAt?: string | null;
  lastLoginAt?: string | null;
  createdAt: string;
}

export interface PassengersPaginationMeta {
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

export interface PaginatedPassengersResponse {
  data: PassengerListItem[];
  pagination: PassengersPaginationMeta;
}

export interface GetPassengersFilters {
  page: number;
  limit: number;
  status?: PassengerAccountStatus;
  search?: string;
  order?: 'asc' | 'desc';
}

export interface PassengerRecentTrip {
  id: string;
  status: string;
  originAddress?: string | null;
  destinationAddress?: string | null;
  totalAmount?: number | null;
  createdAt: string;
}

export interface PassengerDetail {
  id: string;
  email: string;
  status: PassengerAccountStatus;
  roles: string[];
  emailVerifiedAt?: string | null;
  lastLoginAt?: string | null;
  createdAt: string;
  profile: {
    firstName?: string | null;
    lastName?: string | null;
    fullName: string;
    phoneE164?: string | null;
    documentType?: string | null;
    documentNumber?: string | null;
    birthDate?: string | null;
    addressText?: string | null;
    avatarUrl?: string | null;
  };
  stats: {
    totalTrips: number;
    completedTrips: number;
    cancelledTrips: number;
  };
  recentTrips: PassengerRecentTrip[];
}

export interface PassengerDetailResponse {
  data: PassengerDetail;
}
