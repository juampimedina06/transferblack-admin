import axios from 'axios';
import { adminApi } from '../../api/adminApi';
import type {
  ApiErrorResponse,
  AuthResponse,
  ForgotPasswordResponse,
  ResetPasswordVerifyResponse,
  ResetPasswordResponse,
} from '../interface/auth.interface';
import { AuthError } from '../interface/auth.interface';

const handleApiError = (error: unknown, fallbackMessage: string): never => {
  if (error instanceof AuthError) {
    throw error;
  }
  if (axios.isAxiosError<ApiErrorResponse>(error) && error.response?.data?.error) {
    const apiError = error.response.data.error;
    throw new AuthError(
      apiError.message || fallbackMessage,
      error.response.status,
      apiError.code,
      apiError.details
    );
  }
  if (error instanceof Error) {
    throw new AuthError(error.message);
  }
  throw new AuthError(fallbackMessage);
};

export const authActions = {
  async login(email: string, password: string): Promise<AuthResponse> {
    try {
      const { data } = await adminApi.post<AuthResponse>('/auth/login', { email, password });
      return data;
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        throw new AuthError('Credenciales inválidas', 401);
      }
      return handleApiError(error, 'Error al iniciar sesión. Verifique sus credenciales.');
    }
  },

  async forgotPassword(email: string): Promise<ForgotPasswordResponse> {
    try {
      const { data } = await adminApi.post<ForgotPasswordResponse>('/auth/forgot-password', {
        email: email.trim().toLowerCase(),
      });
      return data;
    } catch (error: unknown) {
      return handleApiError(error, 'Error al solicitar el código de recuperación.');
    }
  },

  async verifyResetCode(email: string, code: string): Promise<ResetPasswordVerifyResponse> {
    try {
      const { data } = await adminApi.post<ResetPasswordVerifyResponse>(
        '/auth/reset-password/verify',
        {
          email: email.trim().toLowerCase(),
          code: code.trim(),
        }
      );
      return data;
    } catch (error: unknown) {
      return handleApiError(error, 'El código ingresado es incorrecto o ha expirado.');
    }
  },

  async resetPassword(resetToken: string, newPassword: string): Promise<ResetPasswordResponse> {
    try {
      const { data } = await adminApi.post<ResetPasswordResponse>('/auth/reset-password', {
        reset_token: resetToken,
        new_password: newPassword,
      });
      return data;
    } catch (error: unknown) {
      return handleApiError(error, 'No se pudo restablecer la contraseña. Intente nuevamente.');
    }
  },
};

