import { useEffect, useRef, useState } from 'react';
import { bearingDegrees, distanceMeters, interpolate, type GeoCoordinates } from '../utils/geo';

/** Cada cuanto se repinta el marcador durante la animacion (~20 fps). */
const FRAME_MS = 50;
/** Un salto mayor es un error de GPS o una reconexion: se mueve sin animar. */
const MAX_ANIMATED_METERS = 1_000;

/**
 * Lleva el marcador de la posicion anterior a la nueva a lo largo de
 * `durationMs` en vez de saltar, igual que `useAnimatedCoordinate` en la app
 * del pasajero (`transfer-black-passenger-app/src/presentation/hooks/useAnimatedCoordinate.ts`).
 * Con una duracion igual al intervalo entre sondeos, el auto se ve moverse sin
 * pausas en vez de "teletransportarse" cada vez que llega un dato nuevo.
 *
 * Tambien devuelve el rumbo (0 = norte, sentido horario), para girar el icono
 * hacia donde va.
 */
export function useAnimatedDriverPosition(target: GeoCoordinates | null, durationMs = 5_000) {
  // `animated` solo se toca desde el efecto cuando hay un `target` real: nunca
  // es un simple espejo de la prop (eso se resuelve al leer `coordinate` mas
  // abajo), para no mezclar la animacion con el reseteo a null.
  const [animated, setAnimated] = useState<GeoCoordinates | null>(target);
  const [rotation, setRotation] = useState(0);
  const previousTarget = useRef<GeoCoordinates | null>(target);

  useEffect(() => {
    if (!target) {
      previousTarget.current = null;
      return;
    }

    const from = previousTarget.current;
    const jump = from ? distanceMeters(from, target) : Infinity;

    if (from && jump >= 2 && jump <= MAX_ANIMATED_METERS) {
      setRotation(bearingDegrees(from, target));
    }

    if (!from || jump > MAX_ANIMATED_METERS) {
      previousTarget.current = target;
      setAnimated(target);
      return;
    }

    // Detenido: el GPS oscila unos metros y giraria el auto sin motivo.
    if (jump < 2) return;

    const startedAt = Date.now();
    let lastPaint = 0;
    let frame: number | null = null;

    const step = () => {
      const now = Date.now();
      const progress = Math.min(1, (now - startedAt) / durationMs);

      if (progress === 1 || now - lastPaint >= FRAME_MS) {
        lastPaint = now;
        // Se guarda aunque no termine: la proxima animacion arranca desde aca.
        previousTarget.current = interpolate(from, target, progress);
        setAnimated(previousTarget.current);
      }

      frame = progress < 1 ? requestAnimationFrame(step) : null;
    };

    frame = requestAnimationFrame(step);

    return () => {
      if (frame !== null) cancelAnimationFrame(frame);
    };
  }, [target, durationMs]);

  // Sin posicion del chofer (no asignado, viaje terminado) no hay auto que
  // dibujar, sin importar si quedo una posicion animada de un chofer anterior.
  const coordinate = target ? animated : null;

  return { coordinate, rotation };
}
