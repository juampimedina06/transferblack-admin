import { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { autocompleteAddress, type Place } from '../../../core/places/places.api';

const MIN_QUERY_LENGTH = 3;
const DEBOUNCE_MS = 350;

/**
 * Autocompletado con debounce: evita pegarle al backend en cada tecla.
 * `latestQueryRef` descarta la respuesta de un pedido viejo que llega
 * despues de uno mas nuevo (el `AbortController` cancela el pedido anterior,
 * pero no cubre el caso en que ya habia respondido justo antes del abort).
 */
export function useAddressAutocomplete(query: string) {
  const [results, setResults] = useState<Place[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUnavailable, setIsUnavailable] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const latestQueryRef = useRef(query);

  useEffect(() => {
    latestQueryRef.current = query;
  }, [query]);

  useEffect(() => {
    if (query.trim().length < MIN_QUERY_LENGTH) {
      abortRef.current?.abort();
      const clearTimer = setTimeout(() => {
        setResults([]);
        setIsUnavailable(false);
      }, 0);
      return () => clearTimeout(clearTimer);
    }

    const timer = setTimeout(() => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;
      const requestedQuery = query;
      setIsLoading(true);
      autocompleteAddress(requestedQuery, { signal: controller.signal })
        .then((places) => {
          if (latestQueryRef.current !== requestedQuery) return;
          setResults(places);
          setIsUnavailable(false);
        })
        .catch((error) => {
          if (axios.isCancel(error)) return;
          if (latestQueryRef.current !== requestedQuery) return;
          setResults([]);
          setIsUnavailable(axios.isAxiosError(error) && error.response?.status === 503);
        })
        .finally(() => {
          if (latestQueryRef.current === requestedQuery) setIsLoading(false);
        });
    }, DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [query]);

  return { results, isLoading, isUnavailable };
}
