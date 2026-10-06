import { z } from 'zod';
import axios from 'axios';
import { adminApi } from '../api/adminApi';

/**
 * Autocompletado y detalle de direcciones para el alta de un viaje reservado.
 * Google (Places API New) ya no devuelve coordenadas en el autocompletado:
 * primero se listan sugerencias (`primary_text`/`secondary_text`) dentro de
 * una sesion (`session_token`), y solo al elegir una se pide el detalle
 * (`GET /places/details/:placeId`), que cierra esa sesion y recien ahi trae
 * `lat`/`lng`. El backend expone los endpoints publicos bajo `/places/...`;
 * si el rol admin no tiene acceso (403) se cae al alias viejo
 * `/admin/places/...`, que devuelve el mismo shape. Si todavia llega una
 * sugerencia con `lat`/`lng` (backend previo a este cambio) se usa directo,
 * sin pedir el detalle.
 */

const placeSuggestionSchema = z.object({
  place_id: z.string(),
  primary_text: z.string().optional(),
  secondary_text: z.string().optional(),
  description: z.string().optional(),
  // Compatibilidad con el shape viejo (`address`, sin texto primario/secundario).
  address: z.string().optional(),
  lat: z.number().optional(),
  lng: z.number().optional(),
});

const placesAutocompleteResponseSchema = z.object({
  data: z.array(placeSuggestionSchema),
});

const placeDetailsSchema = z.object({
  place_id: z.string(),
  address: z.string(),
  lat: z.number(),
  lng: z.number(),
});

const placeDetailsResponseSchema = z.object({
  data: placeDetailsSchema,
});

export interface PlaceSuggestion {
  placeId: string;
  primaryText: string;
  secondaryText: string;
  description: string;
  /** Solo las trae un backend viejo (sin sesion de Google): si estan, no hace falta pedir el detalle. */
  lat?: number;
  lng?: number;
  address?: string;
}

export interface Place {
  placeId: string;
  address: string;
  lat: number;
  lng: number;
}

const MIN_QUERY_LENGTH = 3;
const SUGGESTIONS_CACHE_MAX_ENTRIES = 50;

function toSuggestion(result: z.infer<typeof placeSuggestionSchema>): PlaceSuggestion {
  const fallbackText = result.address ?? result.description ?? '';
  return {
    placeId: result.place_id,
    primaryText: result.primary_text ?? fallbackText,
    secondaryText: result.secondary_text ?? '',
    description: result.description ?? fallbackText,
    lat: result.lat,
    lng: result.lng,
    address: result.address,
  };
}

/**
 * Cache chica en memoria por (sesion, texto): dentro de una misma sesion es
 * comun repetir una busqueda (el usuario borra y escribe lo mismo), y no
 * tiene sentido pagarle a Google de nuevo. No se invalida por sesion, solo
 * por tamano: una sesion dura poco y el texto cambia en cada tecla.
 */
const suggestionsCache = new Map<string, PlaceSuggestion[]>();

function cacheKey(sessionToken: string, text: string): string {
  return `${sessionToken}:${text}`;
}

function rememberSuggestions(key: string, suggestions: PlaceSuggestion[]): void {
  if (suggestionsCache.size >= SUGGESTIONS_CACHE_MAX_ENTRIES) {
    const oldestKey = suggestionsCache.keys().next().value;
    if (oldestKey !== undefined) suggestionsCache.delete(oldestKey);
  }
  suggestionsCache.set(key, suggestions);
}

/** Una sesion por secuencia de tipeo: se abre al empezar a escribir y se cierra con un Place Details. */
export function createPlacesSessionToken(): string {
  return crypto.randomUUID();
}

/** 429 RATE_LIMIT_EXCEEDED del backend, con el `Retry-After` si vino. */
export class PlacesRateLimitError extends Error {
  readonly retryAfterSeconds: number | null;

  constructor(retryAfterSeconds: number | null) {
    super('RATE_LIMIT_EXCEEDED');
    this.name = 'PlacesRateLimitError';
    this.retryAfterSeconds = retryAfterSeconds;
  }
}

function getRetryAfterSeconds(error: unknown): number | null {
  if (!axios.isAxiosError(error)) return null;
  const header = error.response?.headers?.['retry-after'];
  const seconds = Number(header);
  return Number.isFinite(seconds) && seconds > 0 ? seconds : null;
}

function isForbidden(error: unknown): boolean {
  return axios.isAxiosError(error) && error.response?.status === 403;
}

function toPlacesError(error: unknown): unknown {
  if (axios.isAxiosError(error) && error.response?.status === 429) {
    return new PlacesRateLimitError(getRetryAfterSeconds(error));
  }
  return error;
}

/**
 * Pega primero al endpoint publico; si el rol admin no esta habilitado (403)
 * cae al alias `/admin/places/...`. El 503 (proveedor caido) se deja pasar
 * tal cual para que lo manejen los que llaman (muestran el fallback manual).
 */
async function fetchPlaces<T>(
  publicPath: string,
  adminPath: string,
  params: Record<string, string>,
  signal: AbortSignal | undefined,
): Promise<T> {
  try {
    const { data } = await adminApi.get(publicPath, { signal, params });
    return data as T;
  } catch (error) {
    if (isForbidden(error)) {
      try {
        const { data } = await adminApi.get(adminPath, { signal, params });
        return data as T;
      } catch (fallbackError) {
        throw toPlacesError(fallbackError);
      }
    }
    throw toPlacesError(error);
  }
}

export async function autocompleteAddress(
  text: string,
  sessionToken: string,
  options: { signal?: AbortSignal } = {},
): Promise<PlaceSuggestion[]> {
  const trimmed = text.trim();
  if (trimmed.length < MIN_QUERY_LENGTH) return [];

  const key = cacheKey(sessionToken, trimmed);
  const cached = suggestionsCache.get(key);
  if (cached) return cached;

  const data = await fetchPlaces<unknown>(
    '/places/autocomplete',
    '/admin/places/autocomplete',
    { text: trimmed, session_token: sessionToken },
    options.signal,
  );
  const suggestions = placesAutocompleteResponseSchema.parse(data).data.map(toSuggestion);
  rememberSuggestions(key, suggestions);
  return suggestions;
}

export async function getPlaceDetails(
  placeId: string,
  sessionToken: string,
  options: { signal?: AbortSignal } = {},
): Promise<Place> {
  const data = await fetchPlaces<unknown>(
    `/places/details/${encodeURIComponent(placeId)}`,
    `/admin/places/details/${encodeURIComponent(placeId)}`,
    { session_token: sessionToken },
    options.signal,
  );
  const details = placeDetailsResponseSchema.parse(data).data;
  return { placeId: details.place_id, address: details.address, lat: details.lat, lng: details.lng };
}
