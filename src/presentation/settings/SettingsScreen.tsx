import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Loader2, Save } from 'lucide-react';

import {
  getPricingSettings,
  updateServiceTypePricing,
  type ServiceTypePricing,
  type ServiceTypePricingChanges,
} from '../../core/settings/pricingSettings.api';
import { extractApiErrorMessage } from '../../core/api/adminApi';

const money = (value: string | number) =>
  new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 2 }).format(Number(value));

/** "1.500,50" o "1500.50" -> "1500.50" (lo que espera el backend). */
const toApiAmount = (value: string) => {
  const trimmed = value.trim();
  return trimmed.includes(',') ? trimmed.replace(/\./g, '').replace(',', '.') : trimmed;
};

type FieldKey = 'base_fare' | 'daytime_fraction_fare' | 'nighttime_fraction_fare' | 'minimum_fare' | 'platform_fee_percent';

const FIELDS: { key: FieldKey; label: string; help: string; suffix?: string }[] = [
  { key: 'base_fare', label: 'Bajada de bandera', help: 'Lo que cuesta subir al auto.' },
  { key: 'daytime_fraction_fare', label: 'Ficha diurna', help: 'Por cada fracción de distancia, de 6 a 22 h.' },
  { key: 'nighttime_fraction_fare', label: 'Ficha nocturna', help: 'Por cada fracción de distancia, de 22 a 6 h.' },
  { key: 'minimum_fare', label: 'Tarifa mínima', help: 'Ningún viaje cuesta menos. En 0 rige la mínima general.' },
  { key: 'platform_fee_percent', label: 'Comisión Transfer Black', help: 'Porcentaje de cada viaje que queda para la empresa.', suffix: '%' },
];

const ServiceTypeCard: React.FC<{ serviceType: ServiceTypePricing; defaultMinimum: string }> = ({ serviceType, defaultMinimum }) => {
  const queryClient = useQueryClient();
  const [draft, setDraft] = useState<Record<FieldKey, string>>(() => ({
    base_fare: serviceType.base_fare,
    daytime_fraction_fare: serviceType.daytime_fraction_fare,
    nighttime_fraction_fare: serviceType.nighttime_fraction_fare,
    minimum_fare: serviceType.minimum_fare,
    platform_fee_percent: serviceType.platform_fee_percent,
  }));
  const [fractionMeters, setFractionMeters] = useState(String(serviceType.distance_fraction_meters));
  const [isActive, setIsActive] = useState(serviceType.is_active);
  const [feedback, setFeedback] = useState<{ type: 'ok' | 'error'; text: string } | null>(null);

  const mutation = useMutation({
    mutationFn: (changes: ServiceTypePricingChanges) => updateServiceTypePricing(serviceType.id, changes),
    onSuccess: () => {
      setFeedback({ type: 'ok', text: 'Guardado. Rige para los viajes que se coticen desde ahora.' });
      void queryClient.invalidateQueries({ queryKey: ['pricing-settings'] });
    },
    onError: (error) => setFeedback({ type: 'error', text: extractApiErrorMessage(error, 'No pudimos guardar.') }),
  });

  const save = () => {
    const changes: ServiceTypePricingChanges = {};
    for (const field of FIELDS) {
      const value = toApiAmount(draft[field.key]);
      if (value !== serviceType[field.key]) changes[field.key] = value;
    }
    const meters = Number(fractionMeters);
    if (meters !== serviceType.distance_fraction_meters) changes.distance_fraction_meters = meters;
    if (isActive !== serviceType.is_active) changes.is_active = isActive;

    if (Object.keys(changes).length === 0) {
      setFeedback({ type: 'ok', text: 'No hay cambios para guardar.' });
      return;
    }
    if ((changes.platform_fee_percent || changes.minimum_fare || changes.base_fare) && !window.confirm('¿Guardar la nueva tarifa? Cambia el precio de los viajes nuevos.')) {
      return;
    }
    setFeedback(null);
    mutation.mutate(changes);
  };

  return (
    <div className="bg-white dark:bg-dark-surface rounded-xl border border-gray-200 dark:border-dark-border p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-gray-900 dark:text-white">{serviceType.name}</h2>
          <p className="text-xs text-gray-500">Código: {serviceType.code}</p>
        </div>
        <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-200">
          <input type="checkbox" checked={isActive} onChange={(event) => setIsActive(event.target.checked)} className="accent-champagne-gold" />
          Se ofrece a los pasajeros
        </label>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {FIELDS.map((field) => (
          <label key={field.key} className="block space-y-1">
            <span className="text-xs font-semibold text-gray-600 dark:text-gray-300">{field.label}</span>
            <div className="relative">
              {!field.suffix && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">$</span>}
              <input
                inputMode="decimal"
                value={draft[field.key]}
                onChange={(event) => setDraft((prev) => ({ ...prev, [field.key]: event.target.value }))}
                className={`w-full ${field.suffix ? 'pl-3 pr-8' : 'pl-7 pr-3'} py-2 text-sm rounded-lg border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-card text-gray-900 dark:text-white`}
              />
              {field.suffix && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">{field.suffix}</span>}
            </div>
            <span className="block text-[11px] text-gray-400">
              {field.key === 'minimum_fare' && Number(draft.minimum_fare) === 0 ? `Hoy rige la general: ${money(defaultMinimum)}.` : field.help}
            </span>
          </label>
        ))}
        <label className="block space-y-1">
          <span className="text-xs font-semibold text-gray-600 dark:text-gray-300">Metros por ficha</span>
          <input
            type="number"
            min={10}
            max={10000}
            value={fractionMeters}
            onChange={(event) => setFractionMeters(event.target.value)}
            className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-card text-gray-900 dark:text-white"
          />
          <span className="block text-[11px] text-gray-400">Cada cuántos metros se cobra una ficha.</span>
        </label>
      </div>

      <div className="flex items-center justify-between gap-3">
        {feedback ? (
          <p className={`text-xs ${feedback.type === 'ok' ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>{feedback.text}</p>
        ) : (
          <span />
        )}
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
    </div>
  );
};

/** Configuración: tarifas por categoría (las únicas que hoy se pueden cambiar sin tocar el servidor). */
export default function SettingsScreen() {
  const { data, isLoading, isError, refetch } = useQuery({ queryKey: ['pricing-settings'], queryFn: getPricingSettings });

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">Tarifas</h1>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
          Precio = (bajada de bandera + fichas × metros recorridos) × multiplicador de la categoría. Los cambios valen para los viajes nuevos.
        </p>
      </div>

      {isLoading && (
        <p className="flex items-center gap-2 text-sm text-gray-500">
          <Loader2 className="w-4 h-4 animate-spin" /> Cargando tarifas...
        </p>
      )}
      {isError && (
        <button type="button" onClick={() => refetch()} className="text-sm text-red-600 underline">
          No pudimos cargar las tarifas. Reintentar
        </button>
      )}
      {data?.service_types.map((serviceType) => (
        <ServiceTypeCard
          key={`${serviceType.id}-${serviceType.base_fare}-${serviceType.minimum_fare}-${serviceType.platform_fee_percent}`}
          serviceType={serviceType}
          defaultMinimum={data.default_minimum_fare}
        />
      ))}
    </div>
  );
}
