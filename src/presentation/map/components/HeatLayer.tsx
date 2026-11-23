import { useEffect } from 'react';
import { useMap } from '@vis.gl/react-google-maps';

export interface HeatPoint {
  lat: number;
  lng: number;
  weight: number;
}

interface HeatLayerProps {
  points: HeatPoint[];
  /** Color base de las manchas (oferta y demanda se distinguen por color). */
  color: string;
}

/** Radio de cada punto en metros: alrededor de 4 cuadras. */
const BASE_RADIUS_M = 350;

/**
 * Mapa de calor liviano: cada punto es un circulo semitransparente y donde se
 * juntan muchos el color se intensifica. Evita sumar una libreria (la
 * HeatmapLayer de Google esta deprecada) y alcanza para ver donde se
 * concentran choferes o pedidos.
 */
export const HeatLayer: React.FC<HeatLayerProps> = ({ points, color }) => {
  const map = useMap();

  useEffect(() => {
    if (!map || points.length === 0) return;

    const maxWeight = Math.max(...points.map((point) => point.weight), 1);
    const circles = points.map(
      (point) =>
        new google.maps.Circle({
          map,
          center: { lat: point.lat, lng: point.lng },
          radius: BASE_RADIUS_M * (0.7 + (0.6 * point.weight) / maxWeight),
          strokeOpacity: 0,
          fillColor: color,
          fillOpacity: 0.18 + (0.32 * point.weight) / maxWeight,
          clickable: false,
        }),
    );

    return () => circles.forEach((circle) => circle.setMap(null));
  }, [map, points, color]);

  return null;
};
