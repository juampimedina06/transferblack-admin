import React from 'react';
import { APIProvider } from '@vis.gl/react-google-maps';
import { GOOGLE_MAPS_API_KEY, GOOGLE_MAPS_LIBRARIES } from './googleMapsConfig';
import { GoogleMapsPlaceholder } from './GoogleMapsPlaceholder';

interface Props {
  children: React.ReactNode;
  /** Clases para el placeholder cuando falta la key (debe calzar con el tamaño del mapa real). */
  placeholderClassName?: string;
}

/**
 * Carga perezosa de la Maps JavaScript API: solo se monta dentro de los
 * componentes de mapa (LiveMapCanvas, TripTrackingMap), nunca en App.tsx, asi
 * que el script no se pide en pantallas sin mapa. `APIProvider` deduplica la
 * carga del script por si hay varias instancias montadas a la vez (por
 * ejemplo /mapa con un drawer de viaje abierto encima).
 */
export const GoogleMapsProvider: React.FC<Props> = ({ children, placeholderClassName }) => {
  if (!GOOGLE_MAPS_API_KEY) {
    return <GoogleMapsPlaceholder className={placeholderClassName} />;
  }

  return (
    <APIProvider apiKey={GOOGLE_MAPS_API_KEY} libraries={[...GOOGLE_MAPS_LIBRARIES]}>
      {children}
    </APIProvider>
  );
};
