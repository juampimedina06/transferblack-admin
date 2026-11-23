/** `500000.00` -> `$ 500.000` (sin decimales cuando son ,00). */
export const formatArs = (value: string | number | null | undefined, currency = 'ARS'): string => {
  const number = Number(value);
  if (value === null || value === undefined || value === '' || !Number.isFinite(number)) return '—';
  const hasCents = Math.round(number * 100) % 100 !== 0;
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency,
    minimumFractionDigits: hasCents ? 2 : 0,
    maximumFractionDigits: 2,
  }).format(number);
};
