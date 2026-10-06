import { useCallback, useEffect, useRef, useState } from 'react';
import axios from 'axios';
import {
  autocompleteAddress,
  createPlacesSessionToken,
  getPlaceDetails,
  PlacesRateLimitError,
  type Place,
  type PlaceSuggestion,
} from '../../../core/places/places.api';

const MIN_QUERY_LENGTH = 3;
const DEBOUNCE_MS = 350;

/**
 * Autocompletado con debounce y sesion de Google Places: la sesion se abre
 * sola al empezar a tipear (primera consulta de esta tanda) y se cierra al
 * elegir una sugerencia (`selectPlace`, que pide el detalle con el mismo
 * token y recien ahi resuelve `lat`/`lng`). `latestQueryRef` descarta la
 * respuesta de un pedido viejo que llega despues de uno mas nuevo (el
 * `AbortController` cancela el pedido anterior, pero no cubre el caso en que
 * ya habia respondido justo antes del abort).
 */
export function useAddressAutocomplete(query: string) {
  const [results, setResults] = useState<PlaceSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUnavailable, setIsUnavailable] = useState(false);
  const [rateLimitRetryAfter, setRateLimitRetryAfter] = useState<number | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const latestQueryRef = useRef(query);
  const sessionTokenRef = useRef<string | null>(null);

  useEffect(() => {
    latestQueryRef.current = query;
  }, [query]);

  useEffect(() => {
    if (query.trim().length < MIN_QUERY_LENGTH) {
      abortRef.current?.abort();
      const clearTimer = setTimeout(() => {
        setResults([]);
        setIsUnavailable(false);
        setRateLimitRetryAfter(null);
      }, 0);
      return () => clearTimeout(clearTimer);
    }

    if (!sessionTokenRef.current) sessionTokenRef.current = createPlacesSessionToken();
    const sessionToken = sessionTokenRef.current;

    const timer = setTimeout(() => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;
      const requestedQuery = query;
      setIsLoading(true);
      autocompleteAddress(requestedQuery, sessionToken, { signal: controller.signal })
        .then((suggestions) => {
          if (latestQueryRef.current !== requestedQuery) return;
          setResults(suggestions);
          setIsUnavailable(false);
          setRateLimitRetryAfter(null);
        })
        .catch((error) => {
          if (axios.isCancel(error)) return;
          if (latestQueryRef.current !== requestedQuery) return;
          setResults([]);
          if (error instanceof PlacesRateLimitError) {
            setIsUnavailable(false);
            setRateLimitRetryAfter(error.retryAfterSeconds);
            return;
          }
          setRateLimitRetryAfter(null);
          setIsUnavailable(axios.isAxiosError(error) && error.response?.status === 503);
        })
        .finally(() => {
          if (latestQueryRef.current === requestedQuery) setIsLoading(false);
        });
    }, DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [query]);

  /**
   * Resuelve una sugerencia elegida en un punto con coordenadas. Si todavia
   * trae `lat`/`lng` (backend viejo) se usa directo, sin pedir el detalle.
   * Cierra la sesion actual (una por seleccion): la proxima tanda de tipeo
   * abre una nueva.
   */
  const selectPlace = useCallback(async (suggestion: PlaceSuggestion): Promise<Place | null> => {
    const address = suggestion.address ?? suggestion.description ?? suggestion.primaryText;

    if (suggestion.lat !== undefined && suggestion.lng !== undefined) {
      sessionTokenRef.current = null;
      return { placeId: suggestion.placeId, address, lat: suggestion.lat, lng: suggestion.lng };
    }

    const sessionToken = sessionTokenRef.current ?? createPlacesSessionToken();
    sessionTokenRef.current = null;

    try {
      return await getPlaceDetails(suggestion.placeId, sessionToken);
    } catch (error) {
      if (error instanceof PlacesRateLimitError) {
        setIsUnavailable(false);
        setRateLimitRetryAfter(error.retryAfterSeconds);
      } else if (axios.isAxiosError(error) && error.response?.status === 503) {
        setRateLimitRetryAfter(null);
        setIsUnavailable(true);
      }
      return null;
    }
  }, []);

  return { results, isLoading, isUnavailable, rateLimitRetryAfter, selectPlace };
}
