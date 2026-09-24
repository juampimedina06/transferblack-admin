import axios from 'axios';
import { adminApi } from '../../api/adminApi';
import type {
  ApiErrorResponse,
  AuthResponse,
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
};
