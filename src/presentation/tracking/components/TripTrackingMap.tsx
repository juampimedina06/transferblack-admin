import { useEffect, useMemo, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, useMap } from 'react-leaflet';
import L, { type LatLngBoundsExpression, type LatLngExpression } from 'leaflet';
import { Locate } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import type {
  TripTrackingDriverLocation,
  TripTrackingPoint,
  TripTrackingRoute,
} from '../../../core/tracking/interfaces/trip-tracking.interface';

const TILES_URL =
  import.meta.env.VITE_MAP_TILES_URL || 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';

const TILES_ATTRIBUTION = '&copy; OpenStreetMap contributors &copy; CARTO';

// Iconos propios via divIcon: el icono default de Leaflet se rompe con Vite
// porque las rutas de sus PNG no se resuelven al empaquetar.
function buildDotIcon(colorClassName: string): L.DivIcon {
  return L.divIcon({
    className: '',
    html: `<span class="block w-4 h-4 rounded-full border-2 border-white shadow ${colorClassName}"></span>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
  });
}

function buildCarIcon(): L.DivIcon {
  return L.divIcon({
    className: '',
    html: `<span class="flex items-center justify-center w-8 h-8 rounded-full bg-obsidian border-2 border-champagne-gold shadow-lg text-champagne-gold text-base leading-none">🚗</span>`,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });
}

const originIcon = buildDotIcon('bg-emerald-500');
const destinationIcon = buildDotIcon('bg-red-500');
const carIcon = buildCarIcon();

interface Props {
  origin: TripTrackingPoint | null;
  destination: TripTrackingPoint | null;
  driverLocation: TripTrackingDriverLocation | null;
  route: TripTrackingRoute | null;
}

/** Ajusta el encuadre una sola vez al cargar, y de nuevo cuando se pide "centrar". */
function FitBounds({ points, recenterRequestId }: { points: LatLngExpression[]; recenterRequestId: number }) {
  const map = useMap();
  const hasFitOnce = useRef(false);

  useEffect(() => {
    if (points.length === 0 || hasFitOnce.current) {
      return;
    }
    map.fitBounds(points as LatLngBoundsExpression, { padding: [32, 32], maxZoom: 15 });
    hasFitOnce.current = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [points]);

  useEffect(() => {
    if (recenterRequestId === 0 || points.length === 0) {
      return;
    }
    map.fitBounds(points as LatLngBoundsExpression, { padding: [32, 32], maxZoom: 15 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recenterRequestId]);

  return null;
}

export const TripTrackingMap: React.FC<Props> = ({ origin, destination, driverLocation, route }) => {
  const [recenterRequestId, setRecenterRequestId] = useState(0);

  const points = useMemo<LatLngExpression[]>(() => {
    const result: LatLngExpression[] = [];
    if (origin) result.push([origin.latitude, origin.longitude]);
    if (destination) result.push([destination.latitude, destination.longitude]);
    if (driverLocation) result.push([driverLocation.latitude, driverLocation.longitude]);
    return result;
  }, [origin, destination, driverLocation]);

  const routeLine = useMemo<LatLngExpression[] | null>(() => {
    if (!route || route.coordinates.length === 0) {
      return null;
    }
    return route.coordinates.flat().map(([lng, lat]) => [lat, lng] as LatLngExpression);
  }, [route]);

  const fallbackLine = useMemo<LatLngExpression[] | null>(() => {
    if (routeLine || !origin || !destination) {
      return null;
    }
    return [
      [origin.latitude, origin.longitude],
      [destination.latitude, destination.longitude],
    ];
  }, [routeLine, origin, destination]);

  if (points.length === 0) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-gray-100 text-sm text-gray-500 rounded-xl">
        La ubicación todavía no está disponible.
      </div>
    );
  }

  return (
    <div className="relative h-full w-full rounded-xl overflow-hidden">
      <MapContainer
        center={points[0]}
        zoom={14}
        scrollWheelZoom
        className="h-full w-full"
        attributionControl
      >
        <TileLayer url={TILES_URL} attribution={TILES_ATTRIBUTION} />
        <FitBounds points={points} recenterRequestId={recenterRequestId} />

        {origin && <Marker position={[origin.latitude, origin.longitude]} icon={originIcon} />}
        {destination && <Marker position={[destination.latitude, destination.longitude]} icon={destinationIcon} />}
        {driverLocation && <Marker position={[driverLocation.latitude, driverLocation.longitude]} icon={carIcon} />}

        {routeLine && <Polyline positions={routeLine} pathOptions={{ color: '#D4AF37', weight: 4 }} />}
        {fallbackLine && (
          <Polyline positions={fallbackLine} pathOptions={{ color: '#D4AF37', weight: 3, dashArray: '6 8' }} />
        )}
      </MapContainer>

      <button
        type="button"
        onClick={() => setRecenterRequestId((id) => id + 1)}
        className="absolute bottom-3 right-3 z-[1000] flex items-center gap-1.5 bg-white text-obsidian text-xs font-semibold px-3 py-2 rounded-lg shadow-md hover:bg-gray-50"
      >
        <Locate className="w-3.5 h-3.5" />
        Centrar
      </button>
    </div>
  );
};
