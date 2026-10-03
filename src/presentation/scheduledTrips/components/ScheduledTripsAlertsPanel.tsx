import React from 'react';
import { AlertTriangle, Bell } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { useScheduledTripAlerts } from '../hooks/useScheduledTripAlerts';
import { scheduledTripAlertLabels, type ScheduledTripAlertType } from '../../../core/scheduledTrips/scheduledTripAlerts.api';

interface ScheduledTripsAlertsPanelProps {
  onSelectTrip?: (tripId: string) => void;
}

/**
 * Panel chico de alertas operativas de viajes reservados (chofer no
 * disponible, sin cobrar, nadie acepto, cobro duplicado). El panel todavia
 * no tiene una pantalla general de alertas: alcance acotado, pedido del
 * usuario.
 */
export const ScheduledTripsAlertsPanel: React.FC<ScheduledTripsAlertsPanelProps> = ({ onSelectTrip }) => {
  const { data: alerts = [], isLoading } = useScheduledTripAlerts();

  if (isLoading || alerts.length === 0) return null;

  return (
    <div className="rounded-xl border border-amber-300 bg-amber-50/70 p-4 shadow-sm dark:border-amber-700/60 dark:bg-amber-950/20">
      <div className="mb-2 flex items-center gap-2">
        <Bell className="h-4 w-4 text-amber-700 dark:text-amber-300" />
        <h3 className="text-sm font-bold text-amber-900 dark:text-amber-200">
          Alertas de viajes reservados ({alerts.length})
        </h3>
      </div>
      <ul className="flex flex-col gap-1.5">
        {alerts.slice(0, 5).map((alert) => (
          <li key={alert.id}>
            <button
              type="button"
              disabled={!alert.trip_id || !onSelectTrip}
              onClick={() => alert.trip_id && onSelectTrip?.(alert.trip_id)}
              className="flex w-full items-center justify-between gap-3 rounded-lg px-2 py-1.5 text-left text-xs transition-colors hover:bg-amber-100/70 disabled:cursor-default disabled:hover:bg-transparent dark:hover:bg-amber-900/30"
            >
              <span className="flex items-center gap-1.5 text-amber-900 dark:text-amber-200">
                <AlertTriangle
                  className={`h-3.5 w-3.5 shrink-0 ${
                    alert.severity === 'critical' ? 'text-red-600' : 'text-amber-600'
                  }`}
                />
                <span className="font-medium">{scheduledTripAlertLabels[alert.type as ScheduledTripAlertType]}</span>
              </span>
              <span className="whitespace-nowrap text-[11px] text-amber-700/80 dark:text-amber-300/70">
                {formatDistanceToNow(new Date(alert.detected_at), { addSuffix: true, locale: es })}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};
