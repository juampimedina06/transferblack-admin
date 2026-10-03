import { z } from 'zod';

// Utilidades compartidas por toda la feature de viajes reservados (alta,
// edicion, cobros): mismo patron que la carga de saldo de empresas
// (`companyTopUps.api.ts`), pero sin acoplarse a ese modulo.

/** Importe positivo de hasta diez digitos enteros y dos decimales. Igual regex que el backend (`scheduled-trip.dto.ts`): nunca un `number`. */
export const moneyAmount = z
  .string()
  .trim()
  .regex(/^\d{1,10}(\.\d{1,2})?$/, 'Ingresá un importe positivo con hasta 2 decimales')
  .refine((value) => Number(value) > 0, 'Ingresá un importe positivo con hasta 2 decimales');

/**
 * Minimo de anticipacion por defecto (`SCHEDULED_TRIP_MIN_LEAD_MINUTES` en el
 * backend, configurable por entorno): esto es solo para que el formulario
 * avise temprano. El backend es la fuente de verdad y devuelve
 * `SCHEDULED_TRIP_LEAD_TIME_TOO_SHORT` (422) con el minimo real en
 * `details.minimum_lead_minutes` si el valor configurado fuera otro.
 */
export const SCHEDULED_TRIP_DEFAULT_MIN_LEAD_MINUTES = 30;

/**
 * Combina fecha y hora locales de Argentina en un ISO con el offset fijo
 * -03:00, sin pasar por el huso horario del navegador (mismo patron que
 * `paid_at` en `registerTopUpManualTransfer`): un `datetime-local` sin
 * timezone mas "-03:00" preserva exactamente la hora que elige el admin.
 */
export function toArgentineIso(date: string, time: string): string {
  return `${date}T${time}:00-03:00`;
}

/** Valida `YYYY-MM-DD` como fecha de calendario real (rechaza 2026-02-30, etc). */
export function isValidCalendarDate(value: string): boolean {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return false;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
}

export function extractErrorCode(error: unknown): string | undefined {
  return (error as { response?: { data?: { error?: { code?: string } } } })?.response?.data?.error?.code;
}

export function extractErrorDetails(error: unknown): Record<string, unknown> | undefined {
  const details = (error as { response?: { data?: { error?: { details?: unknown } } } })?.response?.data?.error
    ?.details;
  return details && typeof details === 'object' ? (details as Record<string, unknown>) : undefined;
}
