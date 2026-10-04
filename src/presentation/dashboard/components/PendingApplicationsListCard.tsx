import React from 'react';
import { Link } from 'react-router-dom';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import type { DriverListItem } from '../../../core/drivers/interfaces/driver.interface';

interface PendingApplicationsListCardProps {
  drivers: DriverListItem[];
  totalCount: number;
  isLoading: boolean;
  isError: boolean;
}

export const PendingApplicationsListCard: React.FC<PendingApplicationsListCardProps> = ({
  drivers,
  totalCount,
  isLoading,
  isError,
}) => {
  const formatDate = (dateStr: string) => {
    try {
      return format(parseISO(dateStr), 'dd/MM/yyyy', { locale: es });
    } catch {
      return dateStr;
    }
  };

  const renderBadge = (driver: DriverListItem) => {
    if (driver.meetingStatus === 'confirmed' || driver.meetingStatus === 'proposed') {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-purple-50 text-purple-700 dark:bg-purple-950/50 dark:text-purple-300 border border-purple-200/80 dark:border-purple-800/40">
          Reunión agendada
        </span>
      );
    }

    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/40">
        Legajo completo
      </span>
    );
  };

  return (
    <div className="bg-white dark:bg-dark-surface rounded-xl border border-gray-100 dark:border-dark-border shadow-sm p-5 sm:p-6 flex flex-col justify-between transition-colors">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-dark-border">
          <div className="flex items-center gap-2">
            <h2 className="text-sm sm:text-base font-bold text-gray-900 dark:text-white">
              Postulaciones esperando revisión
            </h2>
            {!isLoading && totalCount > 0 && (
              <span className="bg-amber-100 text-amber-900 dark:bg-amber-900/40 dark:text-amber-200 text-xs px-2 py-0.5 rounded font-semibold">
                {totalCount}
              </span>
            )}
          </div>
          <Link
            to="/conductores?status=pending"
            className="text-xs font-semibold text-amber-600 dark:text-champagne-gold hover:underline flex items-center gap-0.5"
          >
            <span>Ver todas</span>
            <span className="text-sm font-bold leading-none">›</span>
          </Link>
        </div>

        {/* Content list */}
        {isLoading ? (
          <div className="divide-y divide-gray-100 dark:divide-dark-border">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="py-3 flex items-center justify-between animate-pulse">
                <div className="space-y-1.5">
                  <div className="h-4 w-36 bg-gray-200 dark:bg-white/10 rounded" />
                  <div className="h-3 w-48 bg-gray-100 dark:bg-white/5 rounded" />
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-5 w-24 bg-gray-200 dark:bg-white/10 rounded" />
                  <div className="h-4 w-12 bg-gray-200 dark:bg-white/10 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : isError ? (
          <div className="py-8 text-center text-xs text-gray-400 dark:text-gray-500">
            No se pudieron cargar las postulaciones pendientes.
          </div>
        ) : drivers.length === 0 ? (
          <div className="py-8 text-center text-xs text-gray-400 dark:text-gray-500">
            No hay postulaciones pendientes de revisión.
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-dark-border">
            {drivers.slice(0, 5).map((driver) => (
              <div
                key={driver.id}
                className="py-3 flex items-center justify-between gap-3 group hover:bg-gray-50/50 dark:hover:bg-white/[0.02] -mx-2 px-2 rounded-lg transition-colors"
              >
                <div className="min-w-0">
                  <p className="text-sm font-bold text-gray-900 dark:text-white truncate">
                    {driver.fullName || 'Conductor sin nombre'}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">
                    Postuló {formatDate(driver.createdAt)}
                  </p>
                </div>

                <div className="flex items-center gap-3 flex-shrink-0">
                  {renderBadge(driver)}
                  <Link
                    to={`/conductores/${driver.id}`}
                    className="text-xs font-semibold text-gray-600 dark:text-gray-300 hover:text-champagne-gold transition-colors"
                  >
                    Revisar
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
