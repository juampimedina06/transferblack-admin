import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Loader2, Radar, Save } from 'lucide-react';

import { getDispatchSettings, updateDispatchSettings } from '../../core/settings/pricingSettings.api';
import { extractApiErrorMessage } from '../../core/api/adminApi';

const MIN_KM = 0.5;
const MAX_KM = 50;

const formatKm = (meters: number) => `${(meters / 1000).toLocaleString('es-AR', { maximumFractionDigits: 1 })} km`;

const RadiusForm: React.FC<{ currentMeters: number }> = ({ currentMeters }) => {
  const queryClient = useQueryClient();
  const [km, setKm] = useState(String(currentMeters / 1000).replace('.', ','));
  const [feedback, setFeedback] = useState<{ type: 'ok' | 'error'; text: string } | null>(null);

  const mutation = useMutation({
    mutationFn: updateDispatchSettings,
    onSuccess: (saved) => {
      setFeedback({ type: 'ok', text: `Guardado: ${formatKm(saved.default_search_radius_meters)}. Rige para los próximos pedidos.` });
      void queryClient.invalidateQueries({ queryKey: ['dispatch-settings'] });
    },
    onError: (error) => setFeedback({ type: 'error', text: extractApiErrorMessage(error, 'No pudimos guardar el radio.') }),
  });

  const parsedKm = Number(km.replace(',', '.'));
  const isValid = Number.isFinite(parsedKm) && parsedKm >= MIN_KM && parsedKm <= MAX_KM;

  const save = () => {
    if (!isValid) {
      setFeedback({ type: 'error', text: `El radio tiene que estar entre ${MIN_KM.toLocaleString('es-AR')} y ${MAX_KM} km.` });
      return;
    }
    const meters = Math.round(parsedKm * 1000);
    if (meters === currentMeters) {
      setFeedback({ type: 'ok', text: 'No hay cambios para guardar.' });
      return;
    }
    setFeedback(null);
    mutation.mutate(meters);
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-end gap-3">
        <label className="block space-y-1">
          <span className="text-xs font-semibold text-gray-600 dark:text-gray-300">Radio de búsqueda</span>
          <div className="relative w-40">
            <input
              inputMode="decimal"
              value={km}
              onChange={(event) => setKm(event.target.value)}
              onKeyDown={(event) => event.key === 'Enter' && save()}
              className="w-full pl-3 pr-10 py-2 text-sm rounded-lg border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-card text-gray-900 dark:text-white"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">km</span>
          </div>
        </label>
        <button
          type="button"
          onClick={save}
          disabled={mutation.isPending}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg bg-champagne-gold text-obsidian hover:brightness-105 disabled:opacity-50"
        >
          {mutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Guardar
        </button>
      </div>
      <p className="text-[11px] text-gray-400">
        Entre {MIN_KM.toLocaleString('es-AR')} y {MAX_KM} km. Más grande encuentra más choferes, pero pueden tardar más en llegar.
        Al ampliar la búsqueda a mano desde el mapa, cada ronda suma este radio.
      </p>
      {feedback && (
        <p className={`text-xs ${feedback.type === 'ok' ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
          {feedback.text}
        </p>
      )}
    </div>
  );
};

/** Radio con el que el despacho busca choferes cerca del punto de subida (antes fijo en 5 km). */
export const DispatchRadiusCard: React.FC = () => {
  const { data, isLoading, isError, refetch } = useQuery({ queryKey: ['dispatch-settings'], queryFn: getDispatchSettings });

  return (
    <div className="bg-white dark:bg-dark-surface rounded-xl border border-gray-200 dark:border-dark-border p-5 space-y-4">
      <div className="flex items-start gap-3">
        <Radar className="w-5 h-5 text-champagne-gold mt-0.5" />
        <div>
          <h2 className="text-base font-bold text-gray-900 dark:text-white">Búsqueda de choferes</h2>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Hasta qué distancia del punto de subida se les ofrece un viaje a los choferes conectados.
            {data && ` Hoy: ${formatKm(data.default_search_radius_meters)}.`}
          </p>
        </div>
      </div>

      {isLoading && (
        <p className="flex items-center gap-2 text-sm text-gray-500">
          <Loader2 className="w-4 h-4 animate-spin" /> Cargando...
        </p>
      )}
      {isError && (
        <button type="button" onClick={() => refetch()} className="text-sm text-red-600 underline">
          No pudimos cargar el radio. Reintentar
        </button>
      )}
      {data && <RadiusForm key={data.default_search_radius_meters} currentMeters={data.default_search_radius_meters} />}
    </div>
  );
};
