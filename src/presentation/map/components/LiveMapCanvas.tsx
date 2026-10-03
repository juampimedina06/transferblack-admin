import React, { useMemo, useRef, useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L, { type LatLngBoundsExpression, type LatLngExpression } from 'leaflet';
import { Locate, Star, Phone, Car, Compass, Clock } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import type { DriverLocationFeature, DriverAvailabilityStatus } from '../../../core/map/interfaces/live-map.interface';

const TILES_URL =
  import.meta.env.VITE_MAP_TILES_URL ||
  'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';

const TILES_ATTRIBUTION = '&copy; OpenStreetMap contributors &copy; CARTO';

// Coordenadas default de centro (Córdoba Capital)
const DEFAULT_CENTER: LatLngExpression = [-31.4201, -64.1834];
const AIRPORT_COORDS: LatLngExpression = [-31.3155, -64.2084];

function createCarMarkerIcon(status: DriverAvailabilityStatus): L.DivIcon {
  let ringClasses = 'border-emerald-500 shadow-[0_0_14px_rgba(16,185,129,0.7)]';
  let dotColor = 'bg-emerald-500';
  let carColor = '#10B981';

  if (status === 'in_trip') {
    ringClasses = 'border-amber-500 shadow-[0_0_14px_rgba(245,158,11,0.7)]';
    dotColor = 'bg-amber-500';
    carColor = '#F59E0B';
  } else if (status === 'offline') {
    ringClasses = 'border-gray-500/80 shadow-none opacity-75';
    dotColor = 'bg-gray-400';
    carColor = '#9CA3AF';
  }

  const svgCar = `
    <svg class="w-4 h-4" viewBox="0 0 24 24" fill="${carColor}" xmlns="http://www.w3.org/2000/svg">
      <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.85 7h10.29l1.04 3H5.81l1.04-3zM19 17H5v-4.66l.12-.34h13.77l.11.34V17z"/>
      <circle cx="7.5" cy="14.5" r="1.5" fill="#ffffff"/>
      <circle cx="16.5" cy="14.5" r="1.5" fill="#ffffff"/>
    </svg>
  `;

  return L.divIcon({
    className: 'custom-car-marker-container',
    html: `
      <div class="relative flex items-center justify-center w-8 h-8 rounded-full bg-neutral-900 border-2 ${ringClasses} transition-all duration-300 hover:scale-125 cursor-pointer">
        ${svgCar}
        <span class="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full border-2 border-neutral-900 ${dotColor}"></span>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -18],
  });
}

// Iconos cacheados por status para máximo rendimiento
const carIcons: Record<DriverAvailabilityStatus, L.DivIcon> = {
  online: createCarMarkerIcon('online'),
  in_trip: createCarMarkerIcon('in_trip'),
  offline: createCarMarkerIcon('offline'),
};

function MapAutoBounds({
  features,
  recenterTrigger,
}: {
  features: DriverLocationFeature[];
  recenterTrigger: number;
}) {
  const map = useMap();
  const hasFittedRef = useRef(false);

  useEffect(() => {
    if (features.length === 0 || hasFittedRef.current) return;

    const boundsPoints: LatLngExpression[] = features.map((f) => [
      f.geometry.coordinates[1],
      f.geometry.coordinates[0],
    ]);

    map.fitBounds(boundsPoints as LatLngBoundsExpression, { padding: [40, 40], maxZoom: 14 });
    hasFittedRef.current = true;
  }, [features, map]);

  useEffect(() => {
    if (recenterTrigger === 0) return;
    if (features.length === 0) {
      map.setView(DEFAULT_CENTER, 13);
      return;
    }

    const boundsPoints: LatLngExpression[] = features.map((f) => [
      f.geometry.coordinates[1],
      f.geometry.coordinates[0],
    ]);

    map.fitBounds(boundsPoints as LatLngBoundsExpression, { padding: [40, 40], maxZoom: 14 });
  }, [recenterTrigger, features, map]);

  return null;
}

function FlyToPosition({ target }: { target: LatLngExpression | null }) {
  const map = useMap();
  useEffect(() => {
    if (!target) return;
    map.flyTo(target, 14, { duration: 1.5 });
  }, [target, map]);
  return null;
}

interface Props {
  features: DriverLocationFeature[];
  filterStatus: 'all' | 'online' | 'in_trip' | 'offline';
  onFilterStatusChange: (status: 'all' | 'online' | 'in_trip' | 'offline') => void;
  filterCategory: string | null;
  onFilterCategoryToggle: (cat: string) => void;
  onSelectTrip?: (tripId: string) => void;
}

export const LiveMapCanvas: React.FC<Props> = ({
  features,
  filterStatus,
  onFilterStatusChange,
  filterCategory,
  onFilterCategoryToggle,
  onSelectTrip,
}) => {
  const [recenterCount, setRecenterCount] = useState(0);
  const [flyTarget, setFlyTarget] = useState<LatLngExpression | null>(null);

  const initialCenter = useMemo<LatLngExpression>(() => {
    if (features.length > 0) {
      return [features[0].geometry.coordinates[1], features[0].geometry.coordinates[0]];
    }
    return DEFAULT_CENTER;
  }, [features]);

  const handleAirportClick = () => {
    setFlyTarget(AIRPORT_COORDS);
  };

  return (
    <div className="relative w-full h-full min-h-[520px] rounded-xl overflow-hidden border border-gray-200 dark:border-white/10 shadow-inner bg-neutral-900">
      <MapContainer
        center={initialCenter}
        zoom={13}
        scrollWheelZoom
        className="w-full h-full z-0"
        attributionControl={false}
      >
        <TileLayer url={TILES_URL} attribution={TILES_ATTRIBUTION} />
        <MapAutoBounds features={features} recenterTrigger={recenterCount} />
        <FlyToPosition target={flyTarget} />

        {features.map((feat) => {
          const [lng, lat] = feat.geometry.coordinates;
          const {
            driverId,
            fullName,
            phone,
            ratingAverage,
            ratingCount,
            availabilityStatus,
            currentTripId,
            currentTripStatus,
            vehicle,
            lastLocationUpdateAt,
          } = feat.properties;

          const icon = carIcons[availabilityStatus] || carIcons.online;

          return (
            <Marker key={driverId} position={[lat, lng]} icon={icon}>
              <Popup className="custom-driver-popup" closeButton={false}>
                <div className="p-3 bg-neutral-950 text-white rounded-xl shadow-2xl border border-white/10 min-w-[240px]">
                  {/* Header popup */}
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
                      {availabilityStatus === 'online'
                        ? 'Disponible'
                        : availabilityStatus === 'in_trip'
                        ? 'En viaje'
                        : 'Desconectado'}
                    </span>
                  </div>

                  {/* Vehículo */}
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

                  {/* Teléfono */}
                  {phone && (
                    <div className="flex items-center gap-2 text-xs text-gray-400 py-0.5">
                      <Phone className="w-3.5 h-3.5" />
                      <span>{phone}</span>
                    </div>
                  )}

                  {/* Viaje actual */}
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

                  {/* Timestamp */}
                  <div className="mt-2 text-[10px] text-gray-500 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>
                      {lastLocationUpdateAt
                        ? `Ubicación: ${new Date(lastLocationUpdateAt).toLocaleTimeString()}`
                        : 'Ubicación en tiempo real'}
                    </span>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

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

        {/* Solo Comfort */}
        <button
          type="button"
          onClick={() => onFilterCategoryToggle('comfort')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold backdrop-blur-md transition-all shadow-md ${
            filterCategory?.toLowerCase() === 'comfort'
              ? 'bg-champagne-gold text-neutral-950 font-bold shadow-[0_0_12px_rgba(212,175,55,0.4)]'
              : 'bg-neutral-900/90 text-gray-300 hover:text-white border border-white/10 hover:bg-neutral-800'
          }`}
        >
          Solo Comfort
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
