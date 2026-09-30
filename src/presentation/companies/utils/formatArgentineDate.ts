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

/**
 * Limites del mes calendario vigente en Cordoba, como instantes UTC (misma
 * convencion que `period_start`/`period_end` de los resumenes: ver el
 * comentario de `formatPeriodLabel`). Cordoba es UTC-3 fijo, sin horario de
 * verano, asi que el dia 1 00:00 local es siempre las 03:00 UTC.
 *
 * Sirve para pedir "el consumo del mes" al reporte de consumo
 * (`GET /corporate/reports/consumption`), que exige `start_date`/`end_date`
 * en formato datetime ISO (`z.string().datetime()`, no solo fecha).
 */
export function getCurrentCordobaMonthRange(): { startDate: string; endDate: string; label: string } {
  const cordobaNow = new Date(Date.now() - 3 * 60 * 60 * 1000);
  const year = cordobaNow.getUTCFullYear();
  const month = cordobaNow.getUTCMonth();
  const start = new Date(Date.UTC(year, month, 1, 3, 0, 0));
  const nextMonthStart = new Date(Date.UTC(year, month + 1, 1, 3, 0, 0));
  const end = new Date(nextMonthStart.getTime() - 1);
  return { startDate: start.toISOString(), endDate: end.toISOString(), label: formatPeriodLabel(start.toISOString()) };
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
