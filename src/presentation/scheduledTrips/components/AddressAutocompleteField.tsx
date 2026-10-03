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
const isValidLat = (lat: number): boolean => Number.isFinite(lat) && lat >= -90 && lat <= 90;
const isValidLng = (lng: number): boolean => Number.isFinite(lng) && lng >= -180 && lng <= 180;

export const AddressAutocompleteField: React.FC<AddressAutocompleteFieldProps> = ({ label, value, onChange, error }) => {
  const [query, setQuery] = useState(value?.address ?? '');
  const [isOpen, setIsOpen] = useState(false);
  const [manualLat, setManualLat] = useState(value?.lat !== undefined ? String(value.lat) : '');
  const [manualLng, setManualLng] = useState(value?.lng !== undefined ? String(value.lng) : '');
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
              value={manualLat}
              onChange={(e) => {
                const next = e.target.value;
                setManualLat(next);
                const lat = Number(next);
                const lng = Number(manualLng);
                onChange(
                  next.trim() !== '' && manualLng.trim() !== '' && isValidLat(lat) && isValidLng(lng)
                    ? { address: query, lat, lng }
                    : null,
                );
              }}
            />
            <Input
              type="number"
              step="any"
              placeholder="Longitud"
              value={manualLng}
              onChange={(e) => {
                const next = e.target.value;
                setManualLng(next);
                const lat = Number(manualLat);
                const lng = Number(next);
                onChange(
                  manualLat.trim() !== '' && next.trim() !== '' && isValidLat(lat) && isValidLng(lng)
                    ? { address: query, lat, lng }
                    : null,
                );
              }}
            />
          </div>
          {(manualLat.trim() !== '' || manualLng.trim() !== '') && !hasCoordinates && (
            <p className="text-[11px] text-red-600">
              Ingresá latitud (-90 a 90) y longitud (-180 a 180) válidas para habilitar el envío.
            </p>
          )}
        </div>
      )}
    </div>
  );
};
