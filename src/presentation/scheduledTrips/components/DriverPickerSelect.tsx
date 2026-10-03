import React, { useState } from 'react';
import { ChevronDown, Search, UserX } from 'lucide-react';
import { useApprovedDrivers } from '../hooks/useApprovedDrivers';

interface DriverPickerSelectProps {
  value: string | null | undefined;
  onChange: (driverId: string | null) => void;
  error?: string;
}

/**
 * Selector de chofer reservado. Sale de `/admin/applications?status=approved`
 * (no hay un endpoint que liste choferes aprobados con vehiculo): el backend
 * sigue validando `DRIVER_NOT_APPROVED` / `DRIVER_WITHOUT_VEHICLE` al confirmar,
 * asi que un chofer que perdio el vehiculo aprobado se rechaza igual ahi.
 */
export const DriverPickerSelect: React.FC<DriverPickerSelectProps> = ({ value, onChange, error }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const { data, isLoading } = useApprovedDrivers(search);

  const selectedDriver = data?.data.find((driver) => driver.id === value);

  return (
    <div className="relative flex flex-col gap-1">
      <label className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-white/40">
        Chofer reservado (opcional)
      </label>
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        className="flex w-full items-center justify-between rounded-md border border-gray-200 bg-white px-3 py-2 text-[13px] text-gray-800 transition-colors focus:outline-none focus:ring-1 focus:ring-champagne-gold/20 dark:border-white/10 dark:bg-white/5 dark:text-white"
      >
        <span className={selectedDriver ? '' : 'text-gray-400'}>
          {selectedDriver ? `${selectedDriver.fullName}` : 'Sin chofer (lo busca el despacho automático)'}
        </span>
        <ChevronDown size={14} className="shrink-0 text-gray-400" />
      </button>
      {error && <p className="mt-0.5 text-xs text-red-500 dark:text-red-400">{error}</p>}

      {isOpen && (
        <div className="absolute left-0 right-0 top-full z-20 mt-1 max-h-64 overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-xl dark:border-dark-border dark:bg-dark-surface">
          <div className="sticky top-0 border-b border-gray-100 bg-white p-2 dark:border-dark-border dark:bg-dark-surface">
            <div className="relative">
              <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                autoFocus
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar por nombre..."
                className="w-full rounded border border-gray-200 bg-gray-50 py-1.5 pl-7 pr-2 text-xs text-gray-800 dark:border-dark-border dark:bg-dark-card dark:text-gray-200"
              />
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              onChange(null);
              setIsOpen(false);
            }}
            className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-white/5"
          >
            <UserX size={14} className="text-gray-400" />
            Sin chofer (lo busca el despacho automático)
          </button>

          {isLoading ? (
            <p className="px-3 py-2 text-xs text-gray-400">Buscando choferes...</p>
          ) : data?.data.length === 0 ? (
            <p className="px-3 py-2 text-xs text-gray-400">No hay choferes aprobados con ese nombre.</p>
          ) : (
            data?.data.map((driver) => (
              <button
                key={driver.id}
                type="button"
                onClick={() => {
                  onChange(driver.id);
                  setIsOpen(false);
                }}
                className="block w-full truncate px-3 py-2 text-left text-xs text-gray-700 hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-white/5"
              >
                {driver.fullName}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
};
