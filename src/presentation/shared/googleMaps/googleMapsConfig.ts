/**
 * Config centralizada de Google Maps JavaScript API para el panel.
 *
 * `VITE_GOOGLE_MAPS_API_KEY` es publica por naturaleza (va en el bundle del
 * navegador): se restringe por referente HTTP y a la Maps JavaScript API del
 * lado de Google Cloud Console, no ocultandola acá.
 *
 * `VITE_GOOGLE_MAPS_MAP_ID` es opcional: habilita el estilo oscuro vía Cloud
 * Styling y es requisito de Google para usar `AdvancedMarker`. Sin Map ID, los
 * mapas usan `Marker` clasico + estilos JSON locales (ver `googleMapsDarkStyle.ts`).
 */
export const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as
  | string
  | undefined;

export const GOOGLE_MAPS_MAP_ID = import.meta.env.VITE_GOOGLE_MAPS_MAP_ID as
  | string
  | undefined;

export const isGoogleMapsConfigured = Boolean(GOOGLE_MAPS_API_KEY);

/** true cuando se puede usar AdvancedMarker (requiere Map ID). */
export const supportsAdvancedMarkers = Boolean(GOOGLE_MAPS_MAP_ID);

/** Librerias de la Maps JS API que necesita el panel (marker = Advanced Markers + Pin). */
export const GOOGLE_MAPS_LIBRARIES = ['marker'] as const;
