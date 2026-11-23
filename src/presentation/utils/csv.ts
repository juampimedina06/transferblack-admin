/**
 * Descarga un CSV que Excel en español abre bien: separador `;` (la coma es
 * el separador decimal) y BOM para que respete los acentos.
 */
export const downloadCsv = (filename: string, headers: string[], rows: (string | number | null | undefined)[][]): void => {
  const escape = (value: string | number | null | undefined) => {
    const text = value === null || value === undefined ? '' : String(value);
    return /[";\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
  };

  const content = [headers, ...rows].map((row) => row.map(escape).join(';')).join('\r\n');
  const blob = new Blob(['﻿', content], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
};

/** `12500.5` -> `12500,50` (numero, sin simbolo, con coma decimal para Excel). */
export const toCsvAmount = (value: string | number | null | undefined): string => {
  if (value === null || value === undefined || value === '') return '';
  const number = Number(value);
  return Number.isFinite(number) ? number.toFixed(2).replace('.', ',') : '';
};
