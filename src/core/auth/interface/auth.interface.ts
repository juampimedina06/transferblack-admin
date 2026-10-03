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

export interface ForgotPasswordRequest {
  email: string;
}

export interface ForgotPasswordResponse {
  data: {
    message: string;
  };
}

export interface ResetPasswordVerifyRequest {
  email: string;
  code: string;
}

export interface ResetPasswordVerifyResponse {
  data: {
    reset_token: string;
    expires_in: number;
  };
}

export interface ResetPasswordRequest {
  reset_token: string;
  new_password: string;
}

export interface ResetPasswordResponse {
  data: {
    message: string;
  };
}

