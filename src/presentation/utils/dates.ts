/**
 * Fechas del panel: siempre en hora de Cordoba (UTC-3, sin horario de verano)
 * y mostradas como en Argentina (dd/mm/aaaa, 24 h).
 */
const CORDOBA_OFFSET = '-03:00';

const pad = (value: number) => String(value).padStart(2, '0');

/** `YYYY-MM-DD` del dia local (no UTC: despues de las 21 h, UTC ya es el dia siguiente). */
export const toLocalISODate = (date: Date): string =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

/** Inicio y fin del dia en Cordoba, en ISO, para mandar al backend. */
export const startOfDayISO = (isoDate: string): string => new Date(`${isoDate}T00:00:00.000${CORDOBA_OFFSET}`).toISOString();
export const endOfDayISO = (isoDate: string): string => new Date(`${isoDate}T23:59:59.999${CORDOBA_OFFSET}`).toISOString();

/** `2026-11-23` -> `23/11/2026`. */
export const formatISODateAR = (isoDate: string): string => {
  const [year, month, day] = isoDate.split('-');
  return year && month && day ? `${day}/${month}/${year}` : isoDate;
};

export const formatDateTimeAR = (value: string | Date): string =>
  new Date(value).toLocaleString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });

export interface DateRangePreset {
  key: string;
  label: string;
  range: () => { start: string; end: string };
}

const daysAgo = (days: number) => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date;
};

export const DATE_RANGE_PRESETS: DateRangePreset[] = [
  { key: 'today', label: 'Hoy', range: () => ({ start: toLocalISODate(new Date()), end: toLocalISODate(new Date()) }) },
  { key: 'yesterday', label: 'Ayer', range: () => ({ start: toLocalISODate(daysAgo(1)), end: toLocalISODate(daysAgo(1)) }) },
  { key: 'last7', label: 'Últimos 7 días', range: () => ({ start: toLocalISODate(daysAgo(6)), end: toLocalISODate(new Date()) }) },
  {
    key: 'thisMonth',
    label: 'Este mes',
    range: () => {
      const now = new Date();
      return { start: toLocalISODate(new Date(now.getFullYear(), now.getMonth(), 1)), end: toLocalISODate(now) };
    },
  },
  {
    key: 'lastMonth',
    label: 'Mes pasado',
    range: () => {
      const now = new Date();
      return {
        start: toLocalISODate(new Date(now.getFullYear(), now.getMonth() - 1, 1)),
        end: toLocalISODate(new Date(now.getFullYear(), now.getMonth(), 0)),
      };
    },
  },
];

/** Texto del rango para un boton: "23/11/2026 — 30/11/2026", "Desde 23/11/2026" o "Todas las fechas". */
export const describeDateRange = (start: string, end: string): string => {
  if (start && end) return start === end ? formatISODateAR(start) : `${formatISODateAR(start)} — ${formatISODateAR(end)}`;
  if (start) return `Desde ${formatISODateAR(start)}`;
  if (end) return `Hasta ${formatISODateAR(end)}`;
  return 'Todas las fechas';
};
