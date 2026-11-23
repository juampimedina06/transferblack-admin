import React, { useEffect, useRef, useState } from 'react';
import { Loader2, X } from 'lucide-react';

import { globalSearch, type SearchPersonHit } from '../../../core/search/globalSearch.api';

export interface PickedPerson {
  id: string;
  label: string;
}

interface PersonPickerProps {
  label: string;
  kind: 'driver' | 'passenger';
  value: PickedPerson | null;
  onChange: (person: PickedPerson | null) => void;
  placeholder?: string;
}

const MIN_CHARS = 2;

const toLabel = (person: SearchPersonHit) => person.full_name || person.email || person.phone_e164 || 'Sin nombre';

/**
 * Selector de conductor o pasajero: busca por nombre, email o telefono y
 * entrega el ID. Reemplaza al campo libre "nombre o ID", que mandaba el
 * nombre como si fuera un ID.
 */
export const PersonPicker: React.FC<PersonPickerProps> = ({ label, kind, value, onChange, placeholder }) => {
  const [query, setQuery] = useState('');
  const [options, setOptions] = useState<SearchPersonHit[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < MIN_CHARS) return;

    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setIsLoading(true);
      try {
        const result = await globalSearch(trimmed, controller.signal);
        setOptions(kind === 'driver' ? result.drivers : result.passengers);
      } catch {
        if (!controller.signal.aborted) setOptions([]);
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    }, 300);

    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [query, kind]);

  useEffect(() => {
    const onClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) setIsOpen(false);
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  const inputClass =
    'w-full px-3 py-2 text-xs border border-gray-200 dark:border-dark-border rounded-lg bg-gray-50/50 dark:bg-dark-card text-gray-800 dark:text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-champagne-gold transition-colors';

  return (
    <div className="space-y-1 relative" ref={ref}>
      <label className="text-[10.5px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">{label}</label>

      {value ? (
        <div className={`${inputClass} flex items-center justify-between gap-2`}>
          <span className="truncate font-medium">{value.label}</span>
          <button
            type="button"
            onClick={() => onChange(null)}
            className="text-gray-400 hover:text-red-500"
            aria-label={`Quitar ${label.toLowerCase()}`}
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : (
        <input
          type="search"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder ?? 'Todos · buscá por nombre, email o teléfono'}
          className={inputClass}
        />
      )}

      {isOpen && !value && query.trim().length >= MIN_CHARS && (
        <div className="absolute left-0 right-0 mt-1 max-h-60 overflow-y-auto bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border rounded-lg shadow-xl z-50 py-1">
          {isLoading && (
            <p className="flex items-center gap-2 px-3 py-2 text-xs text-gray-500">
              <Loader2 className="w-3.5 h-3.5 animate-spin" /> Buscando…
            </p>
          )}
          {!isLoading && options.length === 0 && <p className="px-3 py-2 text-xs text-gray-500">Sin resultados.</p>}
          {!isLoading &&
            options.map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => {
                  onChange({ id: option.id, label: toLabel(option) });
                  setQuery('');
                  setIsOpen(false);
                }}
                className="w-full text-left px-3 py-2 hover:bg-gray-50 dark:hover:bg-white/5"
              >
                <span className="block text-xs font-medium text-gray-900 dark:text-white truncate">{toLabel(option)}</span>
                <span className="block text-[11px] text-gray-500 truncate">
                  {[option.email, option.phone_e164].filter(Boolean).join(' · ')}
                </span>
              </button>
            ))}
        </div>
      )}
    </div>
  );
};
