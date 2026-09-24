export type UserRole = 'passenger' | 'driver' | 'admin';

export interface UserProfile {
  id: string;
  email: string;
  roles?: UserRole[];
}

export interface AuthTokens {
  access_token: string;
  refresh_token?: string;
}

export interface AuthResponse {
  data: {
    user: UserProfile; // Using "user" since the previous code had "user", although the other project had "profile". We will adapt to admin-web's current backend.
    access_token: string;
    refresh_token?: string;
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
