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

export const extractRetryAfterSeconds = (error: unknown): number | null => {
  if (!axios.isAxiosError(error)) return null;

  // 1. Cabecera Retry-After de la respuesta HTTP
  const retryAfterHeader =
    error.response?.headers?.['retry-after'] ??
    (typeof error.response?.headers?.get === 'function'
      ? error.response.headers.get('retry-after')
      : undefined);

  if (retryAfterHeader !== undefined && retryAfterHeader !== null) {
    const parsed = parseInt(String(retryAfterHeader), 10);
    if (!Number.isNaN(parsed) && parsed > 0) {
      return parsed;
    }
  }

  // 2. Fallback de resiliencia: detalles en cuerpo JSON si CORS oculta la cabecera
  const details = error.response?.data?.error?.details as
    | { retry_after_seconds?: number }
    | undefined;

  if (typeof details?.retry_after_seconds === 'number' && details.retry_after_seconds > 0) {
    return details.retry_after_seconds;
  }

  return null;
};

let isRefreshing = false;
let failedQueue: {
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}[] = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

adminApi.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;

    if (
      status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !originalRequest.url?.includes('/auth/login') &&
      !originalRequest.url?.includes('/auth/refresh')
    ) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return adminApi(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = authStorage.getRefreshToken();
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        const refreshResponse = await axios.post(
          `${import.meta.env.VITE_API_URL}/auth/refresh`,
          { refresh_token: refreshToken },
          { headers: { 'Content-Type': 'application/json' } }
        );

        const tokens =
          refreshResponse.data?.data?.tokens || refreshResponse.data?.tokens;
        const newAccessToken = tokens?.access_token;
        const newRefreshToken = tokens?.refresh_token;

        if (!newAccessToken) {
          throw new Error('No access token returned from refresh');
        }

        authStorage.setTokens(newAccessToken, newRefreshToken || refreshToken);
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        }

        processQueue(null, newAccessToken);
        return adminApi(originalRequest);
      } catch (refreshErr) {
        processQueue(refreshErr, null);
        console.warn('Session expired and refresh failed, logging out');
        useAuthStore.getState().logout();
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }

    if (status === 429) {
      const retryAfter = extractRetryAfterSeconds(error);
      if (retryAfter !== null) {
        (error as { retryAfter?: number }).retryAfter = retryAfter;
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

/**
 * Etiquetas en espanol para paths de issues que no son un campo propio del
 * formulario (ej. `origin.address` en el alta de un viaje reservado, cuyo
 * origen/destino se eligen con `AddressAutocompleteField` y no son inputs
 * sueltos de react-hook-form). Un path que no esta aca se muestra tal cual.
 */
const UNMAPPED_ISSUE_PATH_LABELS: Record<string, string> = {
  'origin.address': 'la dirección de origen',
  'origin.lat': 'la latitud de origen',
  'origin.lng': 'la longitud de origen',
  'destination.address': 'la dirección de destino',
  'destination.lat': 'la latitud de destino',
  'destination.lng': 'la longitud de destino',
  scheduled_at: 'la fecha y hora del viaje',
  agreed_fare: 'el precio acordado',
  passenger_email: 'el email del pasajero',
  reserved_driver_id: 'el chofer reservado',
  notes: 'las notas',
};

function describeUnmappedIssue(issue: ApiValidationIssue): string {
  const pathKey = issue.path.join('.');
  const label = UNMAPPED_ISSUE_PATH_LABELS[pathKey];
  return label ? `${label} (${issue.message})` : `${pathKey || 'un dato'}: ${issue.message}`;
}

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
 * desconocido, ej. `origin.address` en el alta de un viaje reservado, cuyo
 * origen/destino no son inputs de react-hook-form), devuelve un mensaje que
 * lista esos datos con una etiqueta en espanol para los paths conocidos
 * (`UNMAPPED_ISSUE_PATH_LABELS`) y el path crudo mas el mensaje del backend
 * para el resto, en vez de la frase generica. Si el error no es un
 * `VALIDATION_ERROR`, devuelve el mensaje general de `extractApiErrorMessage`.
 * Si todos los issues se mapearon a campos, devuelve `null` porque el error
 * ya se ve junto a cada input.
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

  const unmappedDescriptions: string[] = [];
  for (const issue of issues) {
    const field = issue.path[0];
    if (typeof field === 'string' && (fields as readonly string[]).includes(field)) {
      setError(field as Path<T>, { type: 'server', message: issue.message });
    } else {
      unmappedDescriptions.push(describeUnmappedIssue(issue));
    }
  }
  if (unmappedDescriptions.length === 0) return null;
  return `Revisá estos datos: ${unmappedDescriptions.join('; ')}.`;
}
