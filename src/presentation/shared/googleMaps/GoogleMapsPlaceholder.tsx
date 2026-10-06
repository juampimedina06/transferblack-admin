import React from 'react';
import { MapPinOff } from 'lucide-react';

interface Props {
  className?: string;
}

/** Se muestra en lugar del mapa cuando falta VITE_GOOGLE_MAPS_API_KEY, en vez de romper la pantalla. */
export const GoogleMapsPlaceholder: React.FC<Props> = ({ className }) => (
  <div
    className={`flex h-full w-full flex-col items-center justify-center gap-2 bg-neutral-900 text-center text-gray-400 ${
      className ?? ''
    }`}
  >
    <MapPinOff className="h-6 w-6 text-gray-500" />
    <p className="px-4 text-xs font-medium">
      Mapa no configurado (falta VITE_GOOGLE_MAPS_API_KEY)
    </p>
  </div>
);
