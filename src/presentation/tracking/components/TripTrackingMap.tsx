import { useEffect, useMemo, useRef, useState } from 'react';
import { Map, AdvancedMarker, Marker, Polyline, useMap } from '@vis.gl/react-google-maps';
import { Locate } from 'lucide-react';
import { GoogleMapsProvider } from '../../shared/googleMaps/GoogleMapsProvider';
import { GOOGLE_MAPS_MAP_ID, supportsAdvancedMarkers } from '../../shared/googleMaps/googleMapsConfig';
import { GOOGLE_MAPS_DARK_STYLE } from '../../shared/googleMaps/googleMapsDarkStyle';
import type {
  TripTrackingDriverLocation,
  TripTrackingPoint,
  TripTrackingRoute,
} from '../../../core/tracking/interfaces/trip-tracking.interface';

type DotColor = 'origin' | 'destination';

const DOT_HEX: Record<DotColor, string> = {
  origin: '#10B981', // emerald-500
  destination: '#EF4444', // red-500
};

const DOT_CLASS: Record<DotColor, string> = {
  origin: 'bg-emerald-500',
  destination: 'bg-red-500',
};

function DotMarkerContent({ color }: { color: DotColor }) {
  return <span className={`block w-4 h-4 rounded-full border-2 border-white shadow ${DOT_CLASS[color]}`} />;
}

function CarMarkerContent() {
  return (
    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-obsidian border-2 border-champagne-gold shadow-lg text-champagne-gold text-base leading-none">
      🚗
    </span>
  );
}

// Iconos propios via SVG en data URI: el icono default de Google Maps se usa como fallback
// cuando no hay Map ID (sin AdvancedMarker), igual que el divIcon que reemplazaba al de Leaflet.
function buildClassicDotIcon(color: DotColor): google.maps.Icon {
  const hex = DOT_HEX[color];
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
    <circle cx="8" cy="8" r="6" fill="${hex}" stroke="#ffffff" stroke-width="2" />
  </svg>`;
  return {
    url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`,
    scaledSize: { width: 16, height: 16 } as google.maps.Size,
    anchor: { x: 8, y: 8 } as google.maps.Point,
  };
}

function buildClassicCarIcon(): google.maps.Icon {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
    <circle cx="16" cy="16" r="15" fill="#0b0b0b" stroke="#D4AF37" stroke-width="2" />
    <text x="16" y="21" font-size="15" text-anchor="middle">🚗</text>
  </svg>`;
  return {
    url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`,
    scaledSize: { width: 32, height: 32 } as google.maps.Size,
    anchor: { x: 16, y: 16 } as google.maps.Point,
  };
}

/** Patron de icono repetido que simula un trazo punteado (Polyline de Google no tiene dashArray nativo). */
const DASHED_LINE_ICONS: google.maps.IconSequence[] = [
  {
    icon: {
      path: 'M 0,-1 0,1',
      strokeOpacity: 1,
      strokeColor: '#D4AF37',
      scale: 3,
    } as google.maps.Symbol,
    offset: '0',
    repeat: '14px',
  },
];

interface Props {
  origin: TripTrackingPoint | null;
  destination: TripTrackingPoint | null;
  driverLocation: TripTrackingDriverLocation | null;
  route: TripTrackingRoute | null;
}

interface TrackingMapControllerProps {
  points: google.maps.LatLngLiteral[];
  recenterRequestId: number;
}

/** Ajusta el encuadre una sola vez al cargar, y de nuevo cuando se pide "centrar". */
function TrackingMapController({ points, recenterRequestId }: TrackingMapControllerProps) {
  const map = useMap();
  const hasFitOnce = useRef(false);

  useEffect(() => {
    if (!map || points.length === 0 || hasFitOnce.current) return;
    const bounds = new google.maps.LatLngBounds();
    points.forEach((p) => bounds.extend(p));
    map.fitBounds(bounds, 32);
    hasFitOnce.current = true;
  }, [map, points]);

  useEffect(() => {
    if (!map || recenterRequestId === 0 || points.length === 0) return;
    const bounds = new google.maps.LatLngBounds();
    points.forEach((p) => bounds.extend(p));
    map.fitBounds(bounds, 32);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, recenterRequestId]);

  return null;
}

export const TripTrackingMap: React.FC<Props> = ({ origin, destination, driverLocation, route }) => {
  const [recenterRequestId, setRecenterRequestId] = useState(0);

  const points = useMemo<google.maps.LatLngLiteral[]>(() => {
    const result: google.maps.LatLngLiteral[] = [];
    if (origin) result.push({ lat: origin.latitude, lng: origin.longitude });
    if (destination) result.push({ lat: destination.latitude, lng: destination.longitude });
    if (driverLocation) result.push({ lat: driverLocation.latitude, lng: driverLocation.longitude });
    return result;
  }, [origin, destination, driverLocation]);

  const routeLine = useMemo<google.maps.LatLngLiteral[] | null>(() => {
    if (!route || route.coordinates.length === 0) {
      return null;
    }
    return route.coordinates.flat().map(([lng, lat]) => ({ lat, lng }));
  }, [route]);

  const fallbackLine = useMemo<google.maps.LatLngLiteral[] | null>(() => {
    if (routeLine || !origin || !destination) {
      return null;
    }
    return [
      { lat: origin.latitude, lng: origin.longitude },
      { lat: destination.latitude, lng: destination.longitude },
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
      <GoogleMapsProvider placeholderClassName="rounded-xl">
        <Map
          className="h-full w-full"
          defaultCenter={points[0]}
          defaultZoom={14}
          mapId={GOOGLE_MAPS_MAP_ID}
          styles={GOOGLE_MAPS_MAP_ID ? undefined : GOOGLE_MAPS_DARK_STYLE}
          disableDefaultUI
          zoomControl
          gestureHandling="greedy"
        >
          <TrackingMapController points={points} recenterRequestId={recenterRequestId} />

          {origin &&
            (supportsAdvancedMarkers ? (
              <AdvancedMarker position={{ lat: origin.latitude, lng: origin.longitude }}>
                <DotMarkerContent color="origin" />
              </AdvancedMarker>
            ) : (
              <Marker position={{ lat: origin.latitude, lng: origin.longitude }} icon={buildClassicDotIcon('origin')} />
            ))}

          {destination &&
            (supportsAdvancedMarkers ? (
              <AdvancedMarker position={{ lat: destination.latitude, lng: destination.longitude }}>
                <DotMarkerContent color="destination" />
              </AdvancedMarker>
            ) : (
              <Marker
                position={{ lat: destination.latitude, lng: destination.longitude }}
                icon={buildClassicDotIcon('destination')}
              />
            ))}

          {driverLocation &&
            (supportsAdvancedMarkers ? (
              <AdvancedMarker position={{ lat: driverLocation.latitude, lng: driverLocation.longitude }}>
                <CarMarkerContent />
              </AdvancedMarker>
            ) : (
              <Marker
                position={{ lat: driverLocation.latitude, lng: driverLocation.longitude }}
                icon={buildClassicCarIcon()}
              />
            ))}

          {routeLine && <Polyline path={routeLine} strokeColor="#D4AF37" strokeWeight={4} strokeOpacity={0.95} />}
          {fallbackLine && (
            <Polyline path={fallbackLine} strokeOpacity={0} icons={DASHED_LINE_ICONS} strokeColor="#D4AF37" />
          )}
        </Map>
      </GoogleMapsProvider>

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
