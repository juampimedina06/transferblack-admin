import { useEffect, useRef, useState } from 'react';
import { autocompleteAddress, isGeoapifyConfigured, type GeoapifyPlace } from '../../../core/places/geoapifyPlaces.api';

/** Autocompletado con debounce: evita pegarle a Geoapify en cada tecla. */
export function useAddressAutocomplete(query: string) {
  const [results, setResults] = useState<GeoapifyPlace[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (!isGeoapifyConfigured() || query.trim().length < 3) {
      const clearTimer = setTimeout(() => setResults([]), 0);
      return () => clearTimeout(clearTimer);
    }

    const timer = setTimeout(() => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;
      setIsLoading(true);
      autocompleteAddress(query, { signal: controller.signal })
        .then(setResults)
        .catch(() => {
          // Una busqueda cancelada o fallida deja la lista anterior: no vale la pena
          // mostrar un error por esto, el campo de direccion sigue editable a mano.
        })
        .finally(() => setIsLoading(false));
    }, 350);

    return () => clearTimeout(timer);
  }, [query]);

  return { results, isLoading, isConfigured: isGeoapifyConfigured() };
}
