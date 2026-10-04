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
