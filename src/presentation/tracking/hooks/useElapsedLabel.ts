import { useEffect, useState } from 'react';

/**
 * Devuelve "hace X s" / "hace X min" a partir de un timestamp ISO, y se
 * actualiza solo cada segundo. Se usa para mostrar la frescura de la
 * ubicacion del chofer sin depender de que llegue un nuevo sondeo.
 *
 * `Date.now()` solo se lee dentro del efecto (nunca en el cuerpo del
 * componente ni de forma sincrónica al montar), para no violar las reglas de
 * pureza de render de React.
 */
export function useElapsedLabel(isoTimestamp: string | null): string | null {
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    if (!isoTimestamp) {
      return;
    }

    const tick = () => setNow(Date.now());
    const intervalId = window.setInterval(tick, 1000);
    tick();

    return () => window.clearInterval(intervalId);
  }, [isoTimestamp]);

  if (!isoTimestamp || now === null) {
    return null;
  }

  const elapsedSeconds = Math.max(0, Math.floor((now - new Date(isoTimestamp).getTime()) / 1000));

  if (elapsedSeconds < 60) {
    return `hace ${elapsedSeconds} s`;
  }

  const elapsedMinutes = Math.floor(elapsedSeconds / 60);
  return `hace ${elapsedMinutes} min`;
}
