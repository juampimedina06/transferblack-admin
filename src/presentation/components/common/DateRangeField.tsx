import React, { useEffect, useRef, useState } from 'react';
import { Calendar, ChevronDown } from 'lucide-react';

import { DATE_RANGE_PRESETS, describeDateRange } from '../../utils/dates';

interface DateRangeFieldProps {
  label?: string;
  start: string;
  end: string;
  /** Se llama al elegir un atajo, al tocar "Listo" o "Limpiar". */
  onChange: (range: { start: string; end: string }) => void;
}

/**
 * Rango de fechas con atajos (Hoy, Ayer, Últimos 7 días, Este mes, Mes
 * pasado) y un rango personalizado. Las fechas viajan como `YYYY-MM-DD` del
 * dia local; el boton las muestra como dd/mm/aaaa.
 */
export const DateRangeField: React.FC<DateRangeFieldProps> = ({ label = 'Fechas', start, end, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [draft, setDraft] = useState({ start, end });
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) setIsOpen(false);
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  const open = () => {
    setDraft({ start, end });
    setIsOpen((value) => !value);
  };

  const apply = (range: { start: string; end: string }) => {
    onChange(range);
    setIsOpen(false);
  };

  return (
    <div className="space-y-1 relative" ref={ref}>
      <label className="text-[10.5px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">{label}</label>
      <button
        type="button"
        onClick={open}
        className="w-full flex items-center justify-between px-3 py-2 text-xs border border-gray-200 dark:border-dark-border rounded-lg bg-gray-50/50 dark:bg-dark-card hover:bg-gray-50 dark:hover:bg-white/5 transition-colors text-gray-800 dark:text-gray-200"
      >
        <span className="flex items-center gap-2 truncate">
          <Calendar className="w-3.5 h-3.5 text-gray-400 shrink-0" />
          <span className="truncate">{describeDateRange(start, end)}</span>
        </span>
        <ChevronDown className="w-3.5 h-3.5 text-gray-400 shrink-0" />
      </button>

      {isOpen && (
        <div className="absolute left-0 mt-1.5 w-80 bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border rounded-lg shadow-xl p-3 z-50 space-y-3">
          <div className="flex flex-wrap gap-1.5">
            {DATE_RANGE_PRESETS.map((preset) => (
              <button
                key={preset.key}
                type="button"
                onClick={() => apply(preset.range())}
                className="px-2.5 py-1 text-xs rounded-full border border-gray-200 dark:border-dark-border text-gray-700 dark:text-gray-200 hover:border-champagne-gold hover:text-champagne-gold transition-colors"
              >
                {preset.label}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-100 dark:border-dark-border">
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-gray-500">Desde</label>
              <input
                type="date"
                lang="es-AR"
                value={draft.start}
                max={draft.end || undefined}
                onChange={(event) => setDraft((prev) => ({ ...prev, start: event.target.value }))}
                className="w-full text-xs px-2 py-1.5 border border-gray-200 dark:border-dark-border rounded bg-gray-50 dark:bg-dark-card text-gray-800 dark:text-gray-200"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-gray-500">Hasta</label>
              <input
                type="date"
                lang="es-AR"
                value={draft.end}
                min={draft.start || undefined}
                onChange={(event) => setDraft((prev) => ({ ...prev, end: event.target.value }))}
                className="w-full text-xs px-2 py-1.5 border border-gray-200 dark:border-dark-border rounded bg-gray-50 dark:bg-dark-card text-gray-800 dark:text-gray-200"
              />
            </div>
          </div>

          <div className="flex justify-between items-center">
            <button
              type="button"
              onClick={() => apply({ start: '', end: '' })}
              className="text-[11px] text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            >
              Limpiar
            </button>
            <button
              type="button"
              onClick={() => apply(draft)}
              className="px-3 py-1 text-[11px] bg-champagne-gold text-obsidian rounded font-semibold hover:brightness-105"
            >
              Listo
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
