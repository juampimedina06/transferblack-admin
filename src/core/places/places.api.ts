import { z } from 'zod';
import { adminApi } from '../api/adminApi';

/**
 * Autocompletado de direcciones para el alta de un viaje reservado. Antes
 * pegaba directo a Geoapify desde el navegador con `VITE_GEOAPIFY_API_KEY`
 * (cualquier `VITE_*` queda escrita en el bundle, asi que esa clave era
 * publica). Ahora lo resuelve el backend (`GET /admin/places/autocomplete`),
 * que guarda su propia clave de Geoapify del lado del servidor: mismo
 * proveedor que usa la app del pasajero y que el backend usa para resolver
 * `place_id` en `POST /rides/quote`, pero sin exponer nada en el cliente.
 */

const placeSchema = z.object({
  place_id: z.string(),
  address: z.string(),
  lat: z.number(),
  lng: z.number(),
});

const placesAutocompleteResponseSchema = z.object({
  data: z.array(placeSchema),
});

export interface Place {
  placeId: string;
  address: string;
  lat: number;
  lng: number;
}

const MIN_QUERY_LENGTH = 3;
const SUGGESTIONS_LIMIT = 6;

function toPlace(result: z.infer<typeof placeSchema>): Place {
  return {
    placeId: result.place_id,
    address: result.address,
    lat: result.lat,
    lng: result.lng,
  };
}

export async function autocompleteAddress(text: string, options: { signal?: AbortSignal } = {}): Promise<Place[]> {
  if (text.trim().length < MIN_QUERY_LENGTH) return [];

  const { data } = await adminApi.get('/admin/places/autocomplete', {
    signal: options.signal,
    params: { text, limit: SUGGESTIONS_LIMIT },
  });

  return placesAutocompleteResponseSchema.parse(data).data.map(toPlace);
}
