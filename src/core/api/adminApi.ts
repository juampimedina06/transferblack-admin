import axios from 'axios';
import { ZodError } from 'zod';
import type { FieldValues, Path, UseFormSetError } from 'react-hook-form';
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
  // Si la respuesta no matchea el schema esperado, `.parse()` tira un
  // ZodError cuyo `.message` es el volcado crudo de los issues (formato
  // JSON en ingles): nunca se le muestra eso al usuario, se loguea para
  // debug y se usa el mensaje amigable.
  if (error instanceof ZodError) {
    console.error('Error de validacion de respuesta:', error.issues);
    return fallback;
  }
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

type ApiValidationIssue = { path: Array<string | number>; message: string };

function extractValidationIssues(error: unknown): ApiValidationIssue[] | null {
  const err = error as {
    response?: { data?: { error?: { code?: string; details?: unknown } } };
  };
  const apiError = err?.response?.data?.error;
  if (!apiError || apiError.code !== 'VALIDATION_ERROR' || !Array.isArray(apiError.details)) {
    return null;
  }
  return apiError.details.filter((issue): issue is ApiValidationIssue => {
    const candidate = issue as Partial<ApiValidationIssue> | null;
    return Boolean(candidate) && Array.isArray(candidate?.path) && typeof candidate?.message === 'string';
  });
}

/**
 * Traduce un `VALIDATION_ERROR` del backend (`{ error: { code, message,
 * details } }`, `details` son los issues de Zod) a errores de campo del
 * formulario con `setError`, en vez de mostrar el mensaje generico y sin
 * tildes del backend ("Los datos ingresados no son validos") como unica
 * devolucion al usuario.
 *
 * Si algun issue no corresponde a un campo del formulario (path vacio o
 * desconocido) o el error no es un `VALIDATION_ERROR`, devuelve un mensaje
 * general para mostrar aparte; si todos los issues se mapearon a campos,
 * devuelve `null` porque el error ya se ve junto a cada input.
 */
export function applyServerErrors<T extends FieldValues>(
  error: unknown,
  setError: UseFormSetError<T>,
  fields: readonly Path<T>[],
  fallback: string,
): string | null {
  const issues = extractValidationIssues(error);
  if (!issues) return extractApiErrorMessage(error, fallback);
  if (issues.length === 0) return fallback;

  let hasUnmappedIssue = false;
  for (const issue of issues) {
    const field = issue.path[0];
    if (typeof field === 'string' && (fields as readonly string[]).includes(field)) {
      setError(field as Path<T>, { type: 'server', message: issue.message });
    } else {
      hasUnmappedIssue = true;
    }
  }
  return hasUnmappedIssue ? 'No pudimos validar algunos datos. Revisá el formulario e intentá de nuevo.' : null;
}
