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
import {
  Locate,
  Star,
  Phone,
  Car,
  Compass,
  Clock,
  Maximize2,
  Minimize2,
  Flame,
  MapPin,
  MessageCircle,
  IdCard,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { HeatLayer, type HeatPoint } from './HeatLayer';
import { getDemandHeatmap } from '../../../core/map/actions/getDemandHeatmap.action';
import { GoogleMapsProvider } from '../../shared/googleMaps/GoogleMapsProvider';
import { GOOGLE_MAPS_MAP_ID, supportsAdvancedMarkers } from '../../shared/googleMaps/googleMapsConfig';
import { GOOGLE_MAPS_DARK_STYLE } from '../../shared/googleMaps/googleMapsDarkStyle';
import type { DriverLocationFeature, DriverAvailabilityStatus } from '../../../core/map/interfaces/live-map.interface';
import { TRIP_STATUS_LABELS } from '../../trips/tripStatusLabels';

// Coordenadas default de centro (Córdoba Capital)
const DEFAULT_CENTER = { lat: -31.4201, lng: -64.1834 };
const AIRPORT_COORDS = { lat: -31.3155, lng: -64.2084 };

/** Solo se dibujan choferes conectados: los desconectados no estan en el mapa. */
type VisibleStatus = Exclude<DriverAvailabilityStatus, 'offline'>;

const STATUS_STYLE: Record<VisibleStatus, { color: string; glow: string; label: string }> = {
  online: { color: '#10B981', glow: 'rgba(16,185,129,0.55)', label: 'Disponible' },
  in_trip: { color: '#F59E0B', glow: 'rgba(245,158,11,0.55)', label: 'En viaje' },
};

function resolveStatusStyle(status: DriverAvailabilityStatus) {
  return status === 'in_trip' ? STATUS_STYLE.in_trip : STATUS_STYLE.online;
}

const CAR_PATH =
  'M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.85 7h10.29l1.04 3H5.81l1.04-3zM19 17H5v-4.66l.12-.34h13.77l.11.34V17z';

/** Patente (o nombre) que se muestra pegada al marcador, para saber cual es cada uno sin abrirlo. */
function markerCaption(feature: DriverLocationFeature): string {
  const { vehicle, fullName } = feature.properties;
  return vehicle?.plate?.toUpperCase() || fullName.split(' ')[0] || '';
}

/**
 * Marcador con AdvancedMarker (Map ID presente): pin grande con halo que
 * late en el color del estado y la patente debajo.
 */
function CarMarkerContent({ status, caption }: { status: DriverAvailabilityStatus; caption: string }) {
  const { color, glow } = resolveStatusStyle(status);

  return (
    <div className="group relative flex cursor-pointer flex-col items-center" style={{ transform: 'translateY(50%)' }}>
      <span
        className="pointer-events-none absolute top-0 h-12 w-12 animate-ping rounded-full opacity-60"
        style={{ backgroundColor: glow }}
      />
      <div
        className="relative flex h-12 w-12 items-center justify-center rounded-full border-[3px] bg-neutral-950 transition-transform duration-200 group-hover:scale-110"
        style={{ borderColor: color, boxShadow: `0 0 0 4px ${glow}, 0 0 22px 6px ${glow}` }}
      >
        <svg className="h-6 w-6" viewBox="0 0 24 24" fill={color} xmlns="http://www.w3.org/2000/svg">
          <path d={CAR_PATH} />
          <circle cx="7.5" cy="14.5" r="1.5" fill="#ffffff" />
          <circle cx="16.5" cy="14.5" r="1.5" fill="#ffffff" />
        </svg>
      </div>
      {caption && (
        <span
          className="mt-1 rounded-md border px-1.5 py-0.5 font-mono text-[11px] font-bold tracking-wider text-white shadow-lg"
          style={{ backgroundColor: '#0a0a0a', borderColor: color }}
        >
          {caption}
        </span>
      )}
    </div>
  );
}

/**
 * Icono clasico (data URI) cuando no hay Map ID: el mismo pin grande, con el
 * halo animado en SVG (el marcador va con `optimized: false` para que la
 * animacion corra) y la patente como etiqueta del marcador.
 */
function buildClassicCarIcon(status: DriverAvailabilityStatus): google.maps.Icon {
  const { color } = resolveStatusStyle(status);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="72" height="72" viewBox="0 0 72 72">
    <circle cx="36" cy="36" r="22" fill="${color}" fill-opacity="0.35">
      <animate attributeName="r" values="22;34;22" dur="1.8s" repeatCount="indefinite" />
      <animate attributeName="fill-opacity" values="0.45;0;0.45" dur="1.8s" repeatCount="indefinite" />
    </circle>
    <circle cx="36" cy="36" r="24" fill="${color}" fill-opacity="0.25" />
    <circle cx="36" cy="36" r="19" fill="#0a0a0a" stroke="${color}" stroke-width="3.5" />
    <g transform="translate(22 22) scale(1.17)">
      <path d="${CAR_PATH}" fill="${color}" />
      <circle cx="7.5" cy="14.5" r="1.5" fill="#ffffff" />
      <circle cx="16.5" cy="14.5" r="1.5" fill="#ffffff" />
    </g>
  </svg>`;
  return {
    url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`,
    scaledSize: { width: 72, height: 72 } as google.maps.Size,
    anchor: { x: 36, y: 36 } as google.maps.Point,
    labelOrigin: { x: 36, y: 70 } as google.maps.Point,
  };
}

interface DriverPopupContentProps {
  feature: DriverLocationFeature;
  onSelectTrip?: (tripId: string) => void;
}

/** "hace 5 min", "hace 2 h", "hace 3 días". */
function timeAgo(iso: string): string {
  const minutes = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60000));
  if (minutes < 1) return 'recién';
  if (minutes < 60) return `hace ${minutes} min`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `hace ${hours} h`;
  return `hace ${Math.round(hours / 24)} días`;
}

function tripStatusLabel(status: string | null): string {
  if (!status) return 'En curso';
  return (TRIP_STATUS_LABELS as Record<string, string>)[status] ?? status;
}

function DriverPopupContent({ feature, onSelectTrip }: DriverPopupContentProps) {
  const navigate = useNavigate();
  const {
    driverId,
    avatarUrl,
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
  const { color, glow, label } = resolveStatusStyle(availabilityStatus);
  const initials = fullName
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('');
  const phoneDigits = phone?.replace(/\D/g, '') ?? '';

  return (
    <div className="w-[300px] overflow-hidden rounded-2xl font-montserrat border border-white/10 bg-neutral-950 text-white shadow-2xl">
      <div className="h-1.5 w-full" style={{ backgroundColor: color }} />

      <div className="flex items-center gap-3 p-4 pb-3">
        <div className="relative shrink-0">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={fullName}
              className="h-16 w-16 rounded-full border-[3px] object-cover"
              style={{ borderColor: color, boxShadow: `0 0 16px ${glow}` }}
            />
          ) : (
            <div
              className="flex h-16 w-16 items-center justify-center rounded-full border-[3px] bg-white/10 text-lg font-bold text-champagne-gold"
              style={{ borderColor: color, boxShadow: `0 0 16px ${glow}` }}
            >
              {initials}
            </div>
          )}
          <span
            className="absolute bottom-0.5 right-0.5 h-3.5 w-3.5 rounded-full border-2 border-neutral-950"
            style={{ backgroundColor: color }}
          />
        </div>

        <div className="min-w-0 flex-1">
          <h4 className="truncate text-base font-bold leading-tight text-white">{fullName}</h4>
          <div className="mt-1 flex items-center gap-1 text-xs text-amber-400">
            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
            {ratingCount > 0 ? (
              <>
                <span className="font-semibold">{ratingAverage.toFixed(1)}</span>
                <span className="text-[11px] text-gray-400">({ratingCount} viajes)</span>
              </>
            ) : (
              <span className="text-[11px] text-gray-400">Sin calificaciones</span>
            )}
          </div>
          <span
            className="mt-1.5 inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-semibold"
            style={{ backgroundColor: `${color}26`, color }}
          >
            <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: color }} />
            {label}
          </span>
        </div>
      </div>

      {vehicle && (
        <div className="mx-4 flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/5 px-3 py-2.5">
          <div className="flex min-w-0 items-center gap-2 text-sm text-gray-200">
            <Car className="h-4 w-4 shrink-0 text-gray-400" />
            <span className="truncate">
              {vehicle.brand} {vehicle.model}
            </span>
          </div>
          <span className="shrink-0 rounded-md border-2 border-neutral-300 bg-white px-2 py-0.5 font-mono text-sm font-bold tracking-widest text-neutral-900">
            {vehicle.plate.toUpperCase()}
          </span>
        </div>
      )}

      {currentTripId && (
        <div className="mx-4 mt-2 flex items-center justify-between gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-2">
          <div className="text-xs">
            <span className="block text-[10px] font-semibold uppercase tracking-wider text-amber-300/80">Viaje actual</span>
            <span className="font-semibold text-amber-200">{tripStatusLabel(currentTripStatus)}</span>
          </div>
          {onSelectTrip && (
            <button
              type="button"
              onClick={() => onSelectTrip(currentTripId)}
              className="rounded-lg bg-amber-500 px-3 py-1.5 text-xs font-bold text-neutral-950 transition-colors hover:bg-amber-400"
            >
              Ver viaje
            </button>
          )}
        </div>
      )}

      <div className="grid grid-cols-3 gap-2 p-4 pt-3">
        {phoneDigits ? (
          <>
            <a
              href={`https://wa.me/${phoneDigits}`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-center gap-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-2 py-2 text-xs font-semibold text-emerald-300 transition-colors hover:bg-emerald-500/20"
            >
              <MessageCircle className="h-3.5 w-3.5" /> WhatsApp
            </a>
            <a
              href={`tel:${phone}`}
              className="flex items-center justify-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-2 py-2 text-xs font-semibold text-gray-200 transition-colors hover:bg-white/10"
            >
              <Phone className="h-3.5 w-3.5" /> Llamar
            </a>
          </>
        ) : (
          <span className="col-span-2 flex items-center justify-center rounded-lg border border-white/10 px-2 py-2 text-xs text-gray-500">
            Sin teléfono
          </span>
        )}
        <button
          type="button"
          onClick={() => navigate(`/conductores/${driverId}`)}
          className="flex items-center justify-center gap-1.5 rounded-lg bg-champagne-gold px-2 py-2 text-xs font-bold text-neutral-950 transition-colors hover:brightness-110"
        >
          <IdCard className="h-3.5 w-3.5" /> Legajo
        </button>
      </div>

      <div className="flex items-center gap-1.5 border-t border-white/10 px-4 py-2 text-[11px] text-gray-500">
        <Clock className="h-3 w-3" />
        {lastLocationUpdateAt ? `Última ubicación ${timeAgo(lastLocationUpdateAt)}` : 'Sin ubicación reciente'}
      </div>
    </div>
  );
}

interface DriverMarkerProps {
  feature: DriverLocationFeature;
  onSelectTrip?: (tripId: string) => void;
}

/** Marcador con AdvancedMarker (Map ID presente). */
const AdvancedDriverMarker: React.FC<DriverMarkerProps> = React.memo(({ feature, onSelectTrip }) => {
  const [infoOpen, setInfoOpen] = useState(false);
  const [markerRef, marker] = useAdvancedMarkerRef();
  const [lng, lat] = feature.geometry.coordinates;

  return (
    <>
      <AdvancedMarker
        ref={markerRef}
        position={{ lat, lng }}
        zIndex={infoOpen ? 1000 : feature.properties.availabilityStatus === 'in_trip' ? 20 : 10}
        onClick={() => setInfoOpen((open) => !open)}
      >
        <CarMarkerContent status={feature.properties.availabilityStatus} caption={markerCaption(feature)} />
      </AdvancedMarker>
      {infoOpen && marker && (
        <InfoWindow anchor={marker} headerDisabled className="tb-driver-info" onCloseClick={() => setInfoOpen(false)}>
          <DriverPopupContent feature={feature} onSelectTrip={onSelectTrip} />
        </InfoWindow>
      )}
    </>
  );
});
AdvancedDriverMarker.displayName = 'AdvancedDriverMarker';

/** Marcador clasico (sin Map ID): icono svg horneado por estado y la patente como etiqueta. */
const ClassicDriverMarker: React.FC<DriverMarkerProps> = React.memo(({ feature, onSelectTrip }) => {
  const [infoOpen, setInfoOpen] = useState(false);
  const [markerRef, marker] = useMarkerRef();
  const [lng, lat] = feature.geometry.coordinates;
  const status = feature.properties.availabilityStatus;
  const caption = markerCaption(feature);
  const icon = useMemo(() => buildClassicCarIcon(status), [status]);
  const label = useMemo<google.maps.MarkerLabel | undefined>(
    () =>
      caption
        ? { text: caption, color: '#ffffff', fontSize: '11px', fontWeight: '700', className: 'tb-marker-label' }
        : undefined,
    [caption],
  );

  return (
    <>
      <Marker
        ref={markerRef}
        position={{ lat, lng }}
        icon={icon}
        label={label}
        optimized={false}
        zIndex={infoOpen ? 1000 : status === 'in_trip' ? 20 : 10}
        onClick={() => setInfoOpen((open) => !open)}
      />
      {infoOpen && marker && (
        <InfoWindow anchor={marker} headerDisabled className="tb-driver-info" onCloseClick={() => setInfoOpen(false)}>
          <DriverPopupContent feature={feature} onSelectTrip={onSelectTrip} />
        </InfoWindow>
      )}
    </>
  );
});
ClassicDriverMarker.displayName = 'ClassicDriverMarker';

/** Zoom maximo al encuadrar la flota: con uno o dos choferes juntos, fitBounds se iba al zoom de calle. */
const MAX_FLEET_ZOOM = 15;

/** Encuadra a todos los choferes sin pasar de `MAX_FLEET_ZOOM`. */
function fitFleet(map: google.maps.Map, features: DriverLocationFeature[]) {
  if (features.length === 1) {
    const [lng, lat] = features[0].geometry.coordinates;
    map.setCenter({ lat, lng });
    map.setZoom(MAX_FLEET_ZOOM);
    return;
  }
  const bounds = new google.maps.LatLngBounds();
  features.forEach((f) => bounds.extend({ lat: f.geometry.coordinates[1], lng: f.geometry.coordinates[0] }));
  map.fitBounds(bounds, 80);
  google.maps.event.addListenerOnce(map, 'idle', () => {
    if ((map.getZoom() ?? 0) > MAX_FLEET_ZOOM) map.setZoom(MAX_FLEET_ZOOM);
  });
}

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
    fitFleet(map, features);
    hasFittedRef.current = true;
  }, [map, features]);

  useEffect(() => {
    if (!map || recenterTrigger === 0) return;
    if (features.length === 0) {
      map.setCenter(DEFAULT_CENTER);
      map.setZoom(13);
      return;
    }
    fitFleet(map, features);
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

type MapMode = 'points' | 'supply' | 'demand';

const MAP_MODES: { value: MapMode; label: string }[] = [
  { value: 'points', label: 'Choferes' },
  { value: 'supply', label: 'Calor: choferes' },
  { value: 'demand', label: 'Calor: pedidos (30 días)' },
];

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
  const [mode, setMode] = useState<MapMode>('points');

  const { data: demand } = useQuery({
    queryKey: ['demand-heatmap', 30],
    queryFn: () => getDemandHeatmap(30),
    enabled: mode === 'demand',
    staleTime: 5 * 60_000,
  });

  // Oferta: los choferes conectados (en linea o en viaje), cada uno con peso 1.
  const supplyPoints = useMemo<HeatPoint[]>(
    () =>
      features.map((feat) => ({ lat: feat.geometry.coordinates[1], lng: feat.geometry.coordinates[0], weight: 1 })),
    [features],
  );

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

          {mode === 'supply' && <HeatLayer points={supplyPoints} color="#10B981" />}
          {mode === 'demand' && <HeatLayer points={demand?.points ?? []} color="#F59E0B" />}

          {mode === 'points' &&
            features.map((feat) =>
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
          Choferes conectados
        </span>
        <div className="space-y-1.5 text-xs text-gray-200">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
            <span>Disponible</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.8)]" />
            <span>En viaje</span>
          </div>
        </div>
        {features.length === 0 && (
          <p className="mt-2 max-w-[180px] text-[11px] text-gray-400">No hay choferes conectados ahora.</p>
        )}
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

        {/* Modo: puntos o mapa de calor */}
        <div className="flex items-center rounded-lg bg-neutral-900/90 border border-white/10 backdrop-blur-md shadow-md overflow-hidden">
          {MAP_MODES.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setMode(option.value)}
              className={`flex items-center gap-1 px-3 py-1.5 text-xs font-semibold transition-colors ${
                mode === option.value ? 'bg-champagne-gold text-neutral-950' : 'text-gray-300 hover:text-white'
              }`}
            >
              {option.value === 'points' ? <MapPin className="w-3.5 h-3.5" /> : <Flame className="w-3.5 h-3.5" />}
              {option.label}
            </button>
          ))}
        </div>
        {mode === 'demand' && demand && (
          <span className="px-2 py-1 rounded-lg text-[11px] bg-neutral-900/90 text-gray-300 border border-white/10">
            {demand.total} pedidos
          </span>
        )}

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
        className="absolute top-16 right-4 z-[400] flex items-center gap-1.5 bg-neutral-900/90 hover:bg-neutral-800 text-white text-xs font-semibold px-3 py-2 rounded-lg shadow-xl border border-white/10 backdrop-blur-md transition-all pointer-events-auto"
      >
        <Locate className="w-3.5 h-3.5 text-champagne-gold" />
        <span>Centrar</span>
      </button>
    </div>
  );
};
