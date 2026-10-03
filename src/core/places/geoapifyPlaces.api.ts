import axios from 'axios';

/**
 * Autocompletado de direcciones para el alta de un viaje reservado. Mismo
 * proveedor que usa la app del pasajero (`geoapify-places-provider.ts`), que
 * es el mismo que usa el backend para resolver `place_id` en
 * `POST /rides/quote`: si se cambia de proveedor hay que cambiarlo en los
 * tres lados.
 */

export interface GeoapifyPlace {
  placeId: string;
  /** Linea principal: calle y altura, o el nombre del lugar. */
  name: string;
  /** Direccion completa en una linea. */
  address: string;
  lat: number;
  lng: number;
}

interface GeoapifyResult {
  place_id: string;
  formatted: string;
  address_line1?: string;
  name?: string;
  lat: number;
  lon: number;
}

interface GeoapifyResultsResponse {
  results: GeoapifyResult[];
}

const SUGGESTIONS_LIMIT = 6;

// Cliente propio y no `adminApi`: es otro servidor y no debe recibir el
// bearer token del panel.
const geoapifyApi = axios.create({
  baseURL: 'https://api.geoapify.com/v1/geocode',
  timeout: 8_000,
});

export function getGeoapifyApiKey(): string | undefined {
  return import.meta.env.VITE_GEOAPIFY_API_KEY;
}

export function isGeoapifyConfigured(): boolean {
  return Boolean(getGeoapifyApiKey());
}

function toPlace(result: GeoapifyResult): GeoapifyPlace {
  return {
    placeId: result.place_id,
    name: result.address_line1 || result.name || result.formatted,
    address: result.formatted,
    lat: result.lat,
    lng: result.lon,
  };
}

export async function autocompleteAddress(
  text: string,
  options: { signal?: AbortSignal } = {},
): Promise<GeoapifyPlace[]> {
  const apiKey = getGeoapifyApiKey();
  if (!apiKey || text.trim().length < 3) return [];

  const { data } = await geoapifyApi.get<GeoapifyResultsResponse>('/autocomplete', {
    signal: options.signal,
    params: {
      apiKey,
      text,
      lang: 'es',
      format: 'json',
      limit: SUGGESTIONS_LIMIT,
      filter: 'countrycode:ar',
    },
  });

  return data.results.map(toPlace);
}
