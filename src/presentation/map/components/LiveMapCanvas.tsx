import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Map,
  AdvancedMarker,
  Marker,
  InfoWindow,
  useMap,
  useAdvancedMarkerRef,
  useMarkerRef,
} from '@vis.gl/react-google-maps';
import { Locate, Star, Phone, Car, Compass, Clock, Maximize2, Minimize2 } from 'lucide-react';
import { GoogleMapsProvider } from '../../shared/googleMaps/GoogleMapsProvider';
import { GOOGLE_MAPS_MAP_ID, supportsAdvancedMarkers } from '../../shared/googleMaps/googleMapsConfig';
import { GOOGLE_MAPS_DARK_STYLE } from '../../shared/googleMaps/googleMapsDarkStyle';
import type { DriverLocationFeature, DriverAvailabilityStatus } from '../../../core/map/interfaces/live-map.interface';

// Coordenadas default de centro (Córdoba Capital)
const DEFAULT_CENTER = { lat: -31.4201, lng: -64.1834 };
const AIRPORT_COORDS = { lat: -31.3155, lng: -64.2084 };

const STATUS_COLORS: Record<DriverAvailabilityStatus, { ring: string; dot: string; car: string }> = {
  online: { ring: '#10B981', dot: 'bg-emerald-500', car: '#10B981' },
  in_trip: { ring: '#F59E0B', dot: 'bg-amber-500', car: '#F59E0B' },
  offline: { ring: '#9CA3AF', dot: 'bg-gray-400', car: '#9CA3AF' },
};

function resolveStatusColors(status: DriverAvailabilityStatus) {
  return STATUS_COLORS[status] ?? STATUS_COLORS.online;
}

/** Contenido HTML del marcador para AdvancedMarker (requiere Map ID), igual al divIcon que usaba Leaflet. */
function CarMarkerContent({ status }: { status: DriverAvailabilityStatus }) {
  const { ring, car } = resolveStatusColors(status);
  const ringClass =
    status === 'in_trip'
      ? 'border-amber-500 shadow-[0_0_14px_rgba(245,158,11,0.7)]'
      : status === 'offline'
      ? 'border-gray-500/80 shadow-none opacity-75'
      : 'border-emerald-500 shadow-[0_0_14px_rgba(16,185,129,0.7)]';
  const dotClass =
    status === 'in_trip' ? 'bg-amber-500' : status === 'offline' ? 'bg-gray-400' : 'bg-emerald-500';

  return (
    <div
      className={`relative flex items-center justify-center w-8 h-8 rounded-full bg-neutral-900 border-2 ${ringClass} transition-all duration-300 hover:scale-125 cursor-pointer`}
    >
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill={car} xmlns="http://www.w3.org/2000/svg">
        <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.85 7h10.29l1.04 3H5.81l1.04-3zM19 17H5v-4.66l.12-.34h13.77l.11.34V17z" />
        <circle cx="7.5" cy="14.5" r="1.5" fill="#ffffff" />
        <circle cx="16.5" cy="14.5" r="1.5" fill="#ffffff" />
      </svg>
      <span className={`absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full border-2 border-neutral-900 ${dotClass}`} />
      <span className="sr-only">{ring}</span>
    </div>
  );
}

/** Icono clasico (data URI) para cuando no hay Map ID / no se puede usar AdvancedMarker. */
function buildClassicCarIcon(status: DriverAvailabilityStatus): google.maps.Icon {
  const { ring, car } = resolveStatusColors(status);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
    <circle cx="16" cy="16" r="14" fill="#171717" stroke="${ring}" stroke-width="2.5" />
    <g transform="translate(5.5 6.5) scale(0.6)">
      <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.85 7h10.29l1.04 3H5.81l1.04-3zM19 17H5v-4.66l.12-.34h13.77l.11.34V17z" fill="${car}" />
    </g>
  </svg>`;
  return {
    url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`,
    scaledSize: { width: 32, height: 32 } as google.maps.Size,
    anchor: { x: 16, y: 16 } as google.maps.Point,
  };
}

interface DriverPopupContentProps {
  feature: DriverLocationFeature;
  onSelectTrip?: (tripId: string) => void;
}

function DriverPopupContent({ feature, onSelectTrip }: DriverPopupContentProps) {
  const {
    fullName,
    phone,
    ratingAverage,
    ratingCount,
    availabilityStatus,
    currentTripId,
    currentTripStatus,
    vehicle,
    lastLocationUpdateAt,
  } = feature.properties;

  return (
    <div className="p-3 bg-neutral-950 text-white rounded-xl shadow-2xl border border-white/10 min-w-[240px]">
      <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-2 mb-2">
        <div>
          <h4 className="font-bold text-sm text-white">{fullName}</h4>
          <div className="flex items-center gap-1 text-xs text-amber-400 mt-0.5">
            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
            <span>{ratingAverage ? ratingAverage.toFixed(1) : '5.0'}</span>
            <span className="text-gray-400 text-[10px]">({ratingCount || 0})</span>
          </div>
        </div>

        <span
          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider ${
            availabilityStatus === 'online'
              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
              : availabilityStatus === 'in_trip'
              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
              : 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
          }`}
        >
          {availabilityStatus === 'online' ? 'Disponible' : availabilityStatus === 'in_trip' ? 'En viaje' : 'Desconectado'}
        </span>
      </div>

      {vehicle && (
        <div className="flex items-center gap-2 text-xs text-gray-300 py-1">
          <Car className="w-3.5 h-3.5 text-gray-400" />
          <span>
            {vehicle.brand} {vehicle.model}
          </span>
          <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 bg-white/10 rounded text-gray-200">
            {vehicle.plate}
          </span>
        </div>
      )}

      {phone && (
        <div className="flex items-center gap-2 text-xs text-gray-400 py-0.5">
          <Phone className="w-3.5 h-3.5" />
          <span>{phone}</span>
        </div>
      )}

      {currentTripId && (
        <div className="mt-2 pt-2 border-t border-white/10 flex items-center justify-between">
          <span className="text-xs text-champagne-gold font-medium">
            Viaje en curso: {currentTripStatus || 'Activo'}
          </span>
          {onSelectTrip && (
            <button
              type="button"
              onClick={() => onSelectTrip(currentTripId)}
              className="text-[11px] underline text-gray-300 hover:text-white"
            >
              Ver
            </button>
          )}
        </div>
      )}

      <div className="mt-2 text-[10px] text-gray-500 flex items-center gap-1">
        <Clock className="w-3 h-3" />
        <span>
          {lastLocationUpdateAt ? `Ubicación: ${new Date(lastLocationUpdateAt).toLocaleTimeString()}` : 'Ubicación en tiempo real'}
        </span>
      </div>
    </div>
  );
}

interface DriverMarkerProps {
  feature: DriverLocationFeature;
  onSelectTrip?: (tripId: string) => void;
}

/** Marcador con AdvancedMarker (Map ID presente): contenido HTML en vivo igual al divIcon de Leaflet. */
const AdvancedDriverMarker: React.FC<DriverMarkerProps> = React.memo(({ feature, onSelectTrip }) => {
  const [infoOpen, setInfoOpen] = useState(false);
  const [markerRef, marker] = useAdvancedMarkerRef();
  const [lng, lat] = feature.geometry.coordinates;

  return (
    <>
      <AdvancedMarker
        ref={markerRef}
        position={{ lat, lng }}
        onClick={() => setInfoOpen((open) => !open)}
      >
        <CarMarkerContent status={feature.properties.availabilityStatus} />
      </AdvancedMarker>
      {infoOpen && marker && (
        <InfoWindow anchor={marker} headerDisabled onCloseClick={() => setInfoOpen(false)}>
          <DriverPopupContent feature={feature} onSelectTrip={onSelectTrip} />
        </InfoWindow>
      )}
    </>
  );
});
AdvancedDriverMarker.displayName = 'AdvancedDriverMarker';

/** Marcador clasico (sin Map ID): icono svg horneado por status. */
const ClassicDriverMarker: React.FC<DriverMarkerProps> = React.memo(({ feature, onSelectTrip }) => {
  const [infoOpen, setInfoOpen] = useState(false);
  const [markerRef, marker] = useMarkerRef();
  const [lng, lat] = feature.geometry.coordinates;
  const icon = useMemo(() => buildClassicCarIcon(feature.properties.availabilityStatus), [feature.properties.availabilityStatus]);

  return (
    <>
      <Marker
        ref={markerRef}
        position={{ lat, lng }}
        icon={icon}
        onClick={() => setInfoOpen((open) => !open)}
      />
      {infoOpen && marker && (
        <InfoWindow anchor={marker} headerDisabled onCloseClick={() => setInfoOpen(false)}>
          <DriverPopupContent feature={feature} onSelectTrip={onSelectTrip} />
        </InfoWindow>
      )}
    </>
  );
});
ClassicDriverMarker.displayName = 'ClassicDriverMarker';

interface MapControllerProps {
  features: DriverLocationFeature[];
  recenterTrigger: number;
  flyTarget: google.maps.LatLngLiteral | null;
  isFullscreen?: boolean;
}

/** Equivalente a los hooks useMap de react-leaflet: fit bounds inicial, recentrado, vuelo al aeropuerto y resize en fullscreen. */
function MapController({ features, recenterTrigger, flyTarget, isFullscreen }: MapControllerProps) {
  const map = useMap();
  const hasFittedRef = useRef(false);

  useEffect(() => {
    if (!map || features.length === 0 || hasFittedRef.current) return;
    const bounds = new google.maps.LatLngBounds();
    features.forEach((f) => bounds.extend({ lat: f.geometry.coordinates[1], lng: f.geometry.coordinates[0] }));
    map.fitBounds(bounds, 40);
    hasFittedRef.current = true;
  }, [map, features]);

  useEffect(() => {
    if (!map || recenterTrigger === 0) return;
    if (features.length === 0) {
      map.setCenter(DEFAULT_CENTER);
      map.setZoom(13);
      return;
    }
    const bounds = new google.maps.LatLngBounds();
    features.forEach((f) => bounds.extend({ lat: f.geometry.coordinates[1], lng: f.geometry.coordinates[0] }));
    map.fitBounds(bounds, 40);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, recenterTrigger]);

  useEffect(() => {
    if (!map || !flyTarget) return;
    map.panTo(flyTarget);
    map.setZoom(14);
  }, [map, flyTarget]);

  useEffect(() => {
    if (!map) return;
    const timer1 = setTimeout(() => google.maps.event.trigger(map, 'resize'), 100);
    const timer2 = setTimeout(() => google.maps.event.trigger(map, 'resize'), 300);
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [map, isFullscreen]);

  return null;
}

interface Props {
  features: DriverLocationFeature[];
  filterStatus: 'all' | 'online' | 'in_trip' | 'offline';
  onFilterStatusChange: (status: 'all' | 'online' | 'in_trip' | 'offline') => void;
  onSelectTrip?: (tripId: string) => void;
  isFullscreen?: boolean;
  onToggleFullscreen?: () => void;
}

export const LiveMapCanvas: React.FC<Props> = ({
  features,
  filterStatus,
  onFilterStatusChange,
  onSelectTrip,
  isFullscreen = false,
  onToggleFullscreen,
}) => {
  const [recenterCount, setRecenterCount] = useState(0);
  const [flyTarget, setFlyTarget] = useState<google.maps.LatLngLiteral | null>(null);

  // Nota: `defaultCenter` del Map solo se lee al montar (prop no controlada), asi que
  // recalcular esto cuando cambian los datos no hace que el mapa se recentre solo.
  const initialCenter = useMemo<google.maps.LatLngLiteral>(() => {
    if (features.length > 0) {
      return { lat: features[0].geometry.coordinates[1], lng: features[0].geometry.coordinates[0] };
    }
    return DEFAULT_CENTER;
  }, [features]);

  const handleAirportClick = () => {
    setFlyTarget(AIRPORT_COORDS);
  };

  return (
    <div
      className={`relative w-full h-full overflow-hidden bg-neutral-900 transition-all ${
        isFullscreen
          ? 'rounded-none border-0 shadow-none'
          : 'min-h-[520px] rounded-xl border border-gray-200 dark:border-white/10 shadow-inner'
      }`}
    >
      <GoogleMapsProvider>
        <Map
          className="w-full h-full z-0"
          defaultCenter={initialCenter}
          defaultZoom={13}
          mapId={GOOGLE_MAPS_MAP_ID}
          styles={GOOGLE_MAPS_MAP_ID ? undefined : GOOGLE_MAPS_DARK_STYLE}
          disableDefaultUI
          zoomControl
          gestureHandling="greedy"
        >
          <MapController
            features={features}
            recenterTrigger={recenterCount}
            flyTarget={flyTarget}
            isFullscreen={isFullscreen}
          />

          {features.map((feat) =>
            supportsAdvancedMarkers ? (
              <AdvancedDriverMarker key={feat.properties.driverId} feature={feat} onSelectTrip={onSelectTrip} />
            ) : (
              <ClassicDriverMarker key={feat.properties.driverId} feature={feat} onSelectTrip={onSelectTrip} />
            )
          )}
        </Map>
      </GoogleMapsProvider>

      {/* Overlay Superior Izquierdo: Leyenda de estados */}
      <div className="absolute top-4 left-4 z-[400] bg-neutral-900/90 backdrop-blur-md border border-white/10 rounded-xl p-3 shadow-xl pointer-events-auto">
        <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-2">
          Estado del conductor
        </span>
        <div className="space-y-1.5 text-xs text-gray-200">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
            <span>En línea - disponible</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.8)]" />
            <span>En viaje</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-gray-400" />
            <span>Desconectado</span>
          </div>
        </div>
      </div>

      {/* Overlay Superior Derecho: Botón Ampliar Mapa */}
      {onToggleFullscreen && (
        <button
          type="button"
          onClick={onToggleFullscreen}
          className="absolute top-4 right-4 z-[400] flex items-center gap-1.5 bg-neutral-900/90 hover:bg-neutral-800 text-white text-xs font-semibold px-3 py-2 rounded-lg shadow-xl border border-white/10 backdrop-blur-md transition-all pointer-events-auto"
          title={isFullscreen ? 'Salir de pantalla completa (Esc)' : 'Modo TV / Pantalla completa'}
        >
          {isFullscreen ? (
            <>
              <Minimize2 className="w-3.5 h-3.5 text-champagne-gold" />
              <span>Salir (Esc)</span>
            </>
          ) : (
            <>
              <Maximize2 className="w-3.5 h-3.5 text-champagne-gold" />
              <span>Modo TV / Pantalla completa</span>
            </>
          )}
        </button>
      )}

      {/* Overlay Inferior Izquierdo: Filtros tipo pastilla (Pills) */}
      <div className="absolute bottom-4 left-4 z-[400] flex flex-wrap items-center gap-2 pointer-events-auto">
        {/* Todos los estados */}
        <button
          type="button"
          onClick={() => onFilterStatusChange('all')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold backdrop-blur-md transition-all shadow-md ${
            filterStatus === 'all'
              ? 'bg-champagne-gold text-neutral-950 font-bold shadow-[0_0_12px_rgba(212,175,55,0.4)]'
              : 'bg-neutral-900/90 text-gray-300 hover:text-white border border-white/10 hover:bg-neutral-800'
          }`}
        >
          Todos los estados
        </button>

        {/* Zona aeropuerto */}
        <button
          type="button"
          onClick={handleAirportClick}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold backdrop-blur-md bg-neutral-900/90 text-gray-300 hover:text-white border border-white/10 hover:bg-neutral-800 transition-all shadow-md"
        >
          <Compass className="w-3.5 h-3.5 text-champagne-gold" />
          <span>Zona aeropuerto</span>
        </button>
      </div>

      {/* Botón Flotante Inferior Derecho: Centrar Flota */}
      <button
        type="button"
        onClick={() => setRecenterCount((c) => c + 1)}
        className="absolute bottom-4 right-4 z-[400] flex items-center gap-1.5 bg-neutral-900/90 hover:bg-neutral-800 text-white text-xs font-semibold px-3 py-2 rounded-lg shadow-xl border border-white/10 backdrop-blur-md transition-all pointer-events-auto"
      >
        <Locate className="w-3.5 h-3.5 text-champagne-gold" />
        <span>Centrar</span>
      </button>
    </div>
  );
};
