import axios from 'axios';
import { authStorage } from '../../presentation/auth/store/authStorage';
import { useAuthStore } from '../../presentation/auth/store/useAuthStore';

export const adminApi = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

adminApi.interceptors.request.use(
  (config) => {
    const token = authStorage.getAccessToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

adminApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const isLoginRequest = error.config?.url?.includes('/auth/login');
      if (!isLoginRequest) {
        console.warn("Token expired or invalid, logging out");
        useAuthStore.getState().logout();
      }
    }
    return Promise.reject(error);
  }
);

export const extractApiErrorMessage = (error: unknown, fallback = 'Ocurrió un error inesperado'): string => {
  const err = error as {
    response?: {
      data?: {
        error?: { message?: string } | string;
        message?: string | string[];
      };
    };
    message?: string;
  };
  const data = err?.response?.data;
  if (!data) return err?.message || fallback;
  if (typeof data?.error === 'object' && data.error?.message) return data.error.message;
  if (data?.message) {
    if (Array.isArray(data.message)) return data.message.join('. ');
    return data.message;
  }
  if (typeof data?.error === 'string') return data.error;
  return fallback;
};
