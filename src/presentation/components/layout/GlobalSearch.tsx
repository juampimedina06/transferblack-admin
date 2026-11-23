import React, { useEffect, useRef, useState } from 'react';
import { Car, Loader2, Route, Search, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { globalSearch, type GlobalSearchResult, type SearchPersonHit } from '../../../core/search/globalSearch.api';

const MIN_CHARS = 2;
const DEBOUNCE_MS = 300;

const personLabel = (person: SearchPersonHit) => person.full_name || person.email || person.phone_e164 || 'Sin nombre';
const personDetail = (person: SearchPersonHit) => [person.email, person.phone_e164].filter(Boolean).join(' · ');

/**
 * Buscador del encabezado: viajes por codigo, conductores y pasajeros por
 * nombre, email o telefono. Elegir un resultado abre su pantalla.
 */
export const GlobalSearch: React.FC = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [result, setResult] = useState<GlobalSearchResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const trimmed = query.trim();
    // Con menos de 2 caracteres no se busca; el panel ni se muestra.
    if (trimmed.length < MIN_CHARS) return;

    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setIsLoading(true);
      setHasError(false);
      try {
        setResult(await globalSearch(trimmed, controller.signal));
      } catch {
        if (!controller.signal.aborted) {
          setHasError(true);
          setResult(null);
        }
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    }, DEBOUNCE_MS);

    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [query]);

  useEffect(() => {
    const onClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) setIsOpen(false);
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  const go = (path: string) => {
    setIsOpen(false);
    setQuery('');
    navigate(path);
  };

  const isEmpty = result && !result.trips.length && !result.drivers.length && !result.passengers.length;
  const showPanel = isOpen && query.trim().length >= MIN_CHARS;

  return (
    <div ref={containerRef} className="hidden md:block relative">
      <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
      <input
        type="search"
        value={query}
        onChange={(event) => {
          setQuery(event.target.value);
          setIsOpen(true);
        }}
        onFocus={() => setIsOpen(true)}
        onKeyDown={(event) => event.key === 'Escape' && setIsOpen(false)}
        placeholder="Buscar viaje, conductor o pasajero"
        aria-label="Buscar viaje, conductor o pasajero"
        className="pl-10 pr-4 py-2 bg-gray-100 dark:bg-dark-card border border-transparent dark:border-dark-border rounded-lg text-sm text-gray-900 dark:text-white placeholder-gray-500 focus:bg-white dark:focus:bg-dark-card focus:border-champagne-gold focus:ring-1 focus:ring-champagne-gold outline-none w-72 transition-all"
      />

      {showPanel && (
        <div className="absolute right-0 mt-2 w-[26rem] max-h-[70vh] overflow-y-auto rounded-xl border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-surface shadow-xl z-50 py-2">
          {isLoading && (
            <div className="flex items-center gap-2 px-4 py-3 text-sm text-gray-500">
              <Loader2 className="w-4 h-4 animate-spin" /> Buscando…
            </div>
          )}
          {hasError && <p className="px-4 py-3 text-sm text-red-500">No pudimos buscar. Probá de nuevo.</p>}
          {!isLoading && isEmpty && (
            <p className="px-4 py-3 text-sm text-gray-500">No encontramos nada para “{query.trim()}”.</p>
          )}

          {!isLoading && result && result.trips.length > 0 && (
            <ResultGroup title="Viajes">
              {result.trips.map((trip) => (
                <ResultRow
                  key={trip.id}
                  icon={<Route className="w-4 h-4" />}
                  title={trip.public_code}
                  detail={new Date(trip.created_at).toLocaleString('es-AR', { dateStyle: 'short', timeStyle: 'short' })}
                  onClick={() => go(`/viajes?tripId=${trip.id}`)}
                />
              ))}
            </ResultGroup>
          )}
          {!isLoading && result && result.drivers.length > 0 && (
            <ResultGroup title="Conductores">
              {result.drivers.map((driver) => (
                <ResultRow
                  key={driver.id}
                  icon={<Car className="w-4 h-4" />}
                  title={personLabel(driver)}
                  detail={personDetail(driver)}
                  onClick={() => go(`/conductores/${driver.id}`)}
                />
              ))}
            </ResultGroup>
          )}
          {!isLoading && result && result.passengers.length > 0 && (
            <ResultGroup title="Pasajeros (ver sus viajes)">
              {result.passengers.map((passenger) => (
                <ResultRow
                  key={passenger.id}
                  icon={<User className="w-4 h-4" />}
                  title={personLabel(passenger)}
                  detail={personDetail(passenger)}
                  onClick={() => go(`/viajes?passengerId=${passenger.id}`)}
                />
              ))}
            </ResultGroup>
          )}
        </div>
      )}
    </div>
  );
};

const ResultGroup: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="py-1">
    <p className="px-4 py-1 text-[11px] font-semibold uppercase tracking-wide text-gray-400">{title}</p>
    {children}
  </div>
);

const ResultRow: React.FC<{ icon: React.ReactNode; title: string; detail: string; onClick: () => void }> = ({
  icon,
  title,
  detail,
  onClick,
}) => (
  <button
    type="button"
    onClick={onClick}
    className="w-full flex items-center gap-3 px-4 py-2 text-left hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
  >
    <span className="text-champagne-gold">{icon}</span>
    <span className="min-w-0">
      <span className="block text-sm font-medium text-gray-900 dark:text-white truncate">{title}</span>
      {detail && <span className="block text-xs text-gray-500 truncate">{detail}</span>}
    </span>
  </button>
);
