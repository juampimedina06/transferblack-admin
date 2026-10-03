import React, { useEffect, useState } from 'react';
import { Check, MapPin } from 'lucide-react';
import { Input } from '../../components/common';
import { useAddressAutocomplete } from '../hooks/useAddressAutocomplete';
import type { ScheduledTripPointFormValues } from '../../../core/scheduledTrips/scheduledTrip.api';

interface AddressAutocompleteFieldProps {
  label: string;
  value: ScheduledTripPointFormValues | null;
  onChange: (point: ScheduledTripPointFormValues | null) => void;
  error?: string;
}

/**
 * Campo de direccion con autocompletado de Geoapify. Sin `VITE_GEOAPIFY_API_KEY`
 * no hay forma de resolver lat/lng desde el navegador (el backend los exige):
 * se muestra el aviso y se habilitan dos campos numericos manuales como
 * alternativa, para no bloquear el alta.
 */
export const AddressAutocompleteField: React.FC<AddressAutocompleteFieldProps> = ({ label, value, onChange, error }) => {
  const [query, setQuery] = useState(value?.address ?? '');
  const [isOpen, setIsOpen] = useState(false);
  const { results, isLoading, isConfigured } = useAddressAutocomplete(query);

  useEffect(() => {
    const timer = setTimeout(() => setQuery(value?.address ?? ''), 0);
    return () => clearTimeout(timer);
  }, [value?.address]);

  const hasCoordinates = value !== null;

  return (
    <div className="flex flex-col gap-1.5">
      <div className="relative">
        <Input
          label={label}
          value={query}
          placeholder="Ej. Av. Colón 1234, Córdoba"
          leftIcon={<MapPin size={14} />}
          rightIcon={hasCoordinates ? <Check size={14} className="text-emerald-500" /> : undefined}
          error={error}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
            if (value) onChange(null);
          }}
          onFocus={() => setIsOpen(true)}
          onBlur={() => setTimeout(() => setIsOpen(false), 150)}
        />

        {isConfigured && isOpen && query.trim().length >= 3 && (
          <div className="absolute left-0 right-0 top-full z-20 mt-1 max-h-56 overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-xl dark:border-dark-border dark:bg-dark-surface">
            {isLoading ? (
              <p className="px-3 py-2 text-xs text-gray-400">Buscando...</p>
            ) : results.length === 0 ? (
              <p className="px-3 py-2 text-xs text-gray-400">Sin resultados.</p>
            ) : (
              results.map((place) => (
                <button
                  key={place.placeId}
                  type="button"
                  onClick={() => {
                    onChange({ address: place.address, lat: place.lat, lng: place.lng, place_id: place.placeId });
                    setQuery(place.address);
                    setIsOpen(false);
                  }}
                  className="block w-full truncate px-3 py-2 text-left text-xs text-gray-700 hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-white/5"
                  title={place.address}
                >
                  {place.address}
                </button>
              ))
            )}
          </div>
        )}
      </div>

      {!isConfigured && (
        <div className="flex flex-col gap-2 rounded-lg border border-amber-200 bg-amber-50 p-2.5 dark:border-amber-800 dark:bg-amber-950/30">
          <p className="text-[11px] text-amber-800 dark:text-amber-300">
            El autocompletado de direcciones no está configurado (falta <code>VITE_GEOAPIFY_API_KEY</code>). Ingresá
            la latitud y la longitud a mano.
          </p>
          <div className="grid grid-cols-2 gap-2">
            <Input
              type="number"
              step="any"
              placeholder="Latitud"
              value={value?.lat ?? ''}
              onChange={(e) => {
                const lat = Number(e.target.value);
                if (Number.isNaN(lat)) return;
                onChange({ address: query, lat, lng: value?.lng ?? 0 });
              }}
            />
            <Input
              type="number"
              step="any"
              placeholder="Longitud"
              value={value?.lng ?? ''}
              onChange={(e) => {
                const lng = Number(e.target.value);
                if (Number.isNaN(lng)) return;
                onChange({ address: query, lat: value?.lat ?? 0, lng });
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};
