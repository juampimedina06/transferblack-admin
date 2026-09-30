const CORDOBA_TIME_ZONE = 'America/Argentina/Cordoba';

/**
 * `period_start` llega como la medianoche del dia 1 en Cordoba, expresada
 * como instante UTC (ver `formatPeriod` en `company-statement.service.ts`
 * del backend, por ejemplo `2026-09-01T03:00:00Z`). Leer el mes con el
 * navegador en su huso horario local rompe si ese huso no es UTC-3: por eso
 * se lee siempre en UTC, igual que el propio backend (`getUTCFullYear` /
 * `getUTCMonth`), sin importar donde este el navegador que abre el panel.
 */
export function formatPeriodLabel(periodStartIso: string): string {
  const date = new Date(periodStartIso);
  return new Intl.DateTimeFormat('es-AR', { month: 'long', year: 'numeric', timeZone: 'UTC' }).format(date);
}

/**
 * Fechas de negocio (vencimientos, pagos, movimientos): se muestran siempre
 * en la zona horaria de Cordoba en vez de la del navegador que abre el
 * panel, para que no cambien de dia segun desde donde se lo mire.
 */
export function formatArgentineDate(iso: string): string {
  return new Intl.DateTimeFormat('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    timeZone: CORDOBA_TIME_ZONE,
  }).format(new Date(iso));
}

export function formatArgentineDateTime(iso: string): string {
  const date = new Intl.DateTimeFormat('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: CORDOBA_TIME_ZONE,
  }).format(new Date(iso));
  return `${date.replace(', ', ' ')}hs`;
}
