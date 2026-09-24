export type UserRole = 'passenger' | 'driver' | 'admin';

export interface UserProfile {
  id: string;
  email: string;
  first_name?: string | null;
  last_name?: string | null;
  roles?: UserRole[] | string[];
  status?: string;
}

export interface AuthTokens {
  access_token: string;
  refresh_token?: string;
}

export interface AuthResponse {
  data: {
    profile: UserProfile;
    tokens: {
      access_token: string;
      refresh_token?: string;
    };
  };
}

export class AuthError extends Error {
  status?: number;
  code?: string;
  details?: unknown;

  constructor(
    message: string,
    status?: number,
    code?: string,
    details?: unknown
  ) {
    super(message);
    this.name = 'AuthError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export interface ApiErrorResponse {
  error?: {
    message: string;
    code?: string;
    details?: unknown;
  };
}
