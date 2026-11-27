import React from 'react';

interface PhoneLiveMapPreviewProps {
  corridorId: string;
  routeLabel: string;
  estimatedMinutes: number;
}

interface CorridorMapGeometry {
  path: string;
  origin: { x: number; y: number; label: string };
  destination: { x: number; y: number; label: string };
}

const CORRIDOR_GEOMETRY: Record<string, CorridorMapGeometry> = {
  aeropuerto: {
    path: 'M 56 122 L 108 116 L 136 86 L 204 78 L 244 48 L 296 42',
    origin: { x: 56, y: 122, label: 'Centro' },
    destination: { x: 296, y: 42, label: 'Aeropuerto' },
  },
  'ciudad-empresaria': {
    path: 'M 72 132 L 118 106 L 166 96 L 204 62 L 274 52',
    origin: { x: 72, y: 132, label: 'Nva. Córdoba' },
    destination: { x: 274, y: 52, label: 'C. Empresaria' },
  },
  cerro: {
    path: 'M 52 54 L 118 58 L 164 82 L 222 92 L 284 114',
    origin: { x: 52, y: 54, label: 'Cerro' },
    destination: { x: 284, y: 114, label: 'Patio Olmos' },
  },
  terminal: {
    path: 'M 48 64 L 104 72 L 154 102 L 228 110 L 292 126',
    origin: { x: 48, y: 64, label: 'V. Belgrano' },
    destination: { x: 292, y: 126, label: 'Terminal' },
  },
};

export const PhoneLiveMapPreview: React.FC<PhoneLiveMapPreviewProps> = ({
  corridorId,
  routeLabel,
  estimatedMinutes,
}) => {
  const geom = CORRIDOR_GEOMETRY[corridorId] ?? CORRIDOR_GEOMETRY.aeropuerto;
  const routePathId = `tb-phone-route-${corridorId}`;

  return (
    <div className="relative h-36 rounded-2xl bg-[#0F1218] border border-white/10 overflow-hidden shadow-inner">
      <svg
        viewBox="0 0 360 156"
        className="w-full h-full object-cover"
        role="img"
        aria-label={`Mapa simulado de ruta ${routeLabel}`}
      >
        <defs>
          <filter id="tb-gold-glow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="2.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <linearGradient id="tb-map-route" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#D4AF37" />
            <stop offset="70%" stopColor="#F5D77A" />
            <stop offset="100%" stopColor="#10B981" />
          </linearGradient>
        </defs>

        {/* Base Dark Map Landmass */}
        <rect width="360" height="156" fill="#12161F" />

        {/* Urban Parks (Parque Sarmiento / Espacios Verdes) */}
        <path d="M 16 12 L 66 8 L 74 36 L 22 44 Z" fill="#14231E" opacity="0.9" />
        <path d="M 248 92 L 318 86 L 326 124 L 258 130 Z" fill="#14231E" opacity="0.85" />
        <path d="M 134 114 L 182 110 L 188 142 L 138 146 Z" fill="#14231E" opacity="0.7" />

        {/* City Blocks (Subtle dark-mode Google Maps parcels) */}
        <g fill="#171C27">
          <rect x="82" y="14" width="38" height="24" rx="2" />
          <rect x="128" y="12" width="46" height="22" rx="2" />
          <rect x="184" y="14" width="42" height="26" rx="2" />
          <rect x="236" y="10" width="52" height="22" rx="2" />
          <rect x="24" y="54" width="42" height="28" rx="2" />
          <rect x="76" y="52" width="36" height="32" rx="2" />
          <rect x="124" y="48" width="48" height="26" rx="2" />
          <rect x="184" y="50" width="44" height="24" rx="2" />
          <rect x="30" y="96" width="44" height="34" rx="2" />
          <rect x="84" y="96" width="38" height="32" rx="2" />
          <rect x="196" y="92" width="42" height="36" rx="2" />
          <rect x="304" y="20" width="42" height="44" rx="2" />
        </g>

        {/* Río Suquía */}
        <path
          d="M -10 88 Q 74 72 146 88 T 274 76 T 372 64"
          fill="none"
          stroke="#182B42"
          strokeWidth="10"
          strokeLinecap="round"
        />

        {/* Secondary Streets Network */}
        <g stroke="#202736" strokeWidth="1.6" fill="none">
          <path d="M 0 38 L 360 32" />
          <path d="M 0 66 L 360 58" />
          <path d="M 0 106 L 360 98" />
          <path d="M 0 136 L 360 128" />
          <path d="M 46 0 L 62 156" />
          <path d="M 116 0 L 106 156" />
          <path d="M 176 0 L 188 156" />
          <path d="M 244 0 L 234 156" />
          <path d="M 304 0 L 316 156" />
        </g>

        {/* Major Avenues (Av. Colón, La Voz del Interior, Circunvalación) */}
        <g stroke="#2E374A" strokeWidth="3.5" fill="none" strokeLinecap="round">
          <path d="M -10 126 L 142 114 L 246 46 L 370 36" />
          <path d="M 24 -8 L 138 88 L 222 108 L 366 138" />
          <path d="M 196 -8 L 206 164" />
        </g>

        {/* Subtle Dark-Mode Street Labels */}
        <g fill="#5B6780" fontSize="6.5" fontFamily="Montserrat, sans-serif" fontWeight="600">
          <text x="150" y="26">AV. LA VOZ DEL INTERIOR</text>
          <text x="20" y="92" transform="rotate(-8 20 92)">RÍO SUQUÍA</text>
          <text x="198" y="144">AV. COLÓN</text>
        </g>

        {/* Nearby Available Fleet Vehicles (Subtle) */}
        <g opacity="0.65">
          <circle cx="96" cy="48" r="2.5" fill="#D4AF37" />
          <circle cx="218" cy="122" r="2.5" fill="#D4AF37" />
          <circle cx="326" cy="78" r="2.5" fill="#D4AF37" />
        </g>

        {/* Route Dark Casing + Glowing Golden Polyline */}
        <path
          d={geom.path}
          fill="none"
          stroke="#0A0A0C"
          strokeWidth="6.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          id={routePathId}
          d={geom.path}
          fill="none"
          stroke="url(#tb-map-route)"
          strokeWidth="3.4"
          strokeLinecap="round"
          strokeLinejoin="round"
          filter="url(#tb-gold-glow)"
        />

        {/* Origin Pin */}
        <g transform={`translate(${geom.origin.x}, ${geom.origin.y})`}>
          <circle r="8.5" fill="rgba(212, 175, 55, 0.22)" />
          <circle r="4.5" fill="#D4AF37" stroke="#0A0A0C" strokeWidth="1.8" />
        </g>

        {/* Destination Pin */}
        <g transform={`translate(${geom.destination.x}, ${geom.destination.y})`}>
          <circle r="9" fill="rgba(16, 185, 129, 0.22)" />
          <circle r="4.8" fill="#10B981" stroke="#0A0A0C" strokeWidth="1.8" />
        </g>

        {/* Animated Moving Driver Car Gliding Along Route */}
        <g>
          <circle r="9" fill="rgba(212, 175, 55, 0.24)" />
          <rect
            x="-6"
            y="-3.5"
            width="12"
            height="7"
            rx="2.5"
            fill="#FFFFFF"
            stroke="#0A0A0C"
            strokeWidth="1.2"
          />
          <rect x="-2.5" y="-2.2" width="5" height="4.4" rx="1" fill="#0A0A0C" />
          <animateMotion dur="7s" repeatCount="indefinite" rotate="auto">
            <mpath href={`#${routePathId}`} />
          </animateMotion>
        </g>
      </svg>

      {/* Top HUD Overlay (Clean, never collides with route pins) */}
      <div className="absolute top-2 left-2.5 right-2.5 flex items-center justify-between gap-2 pointer-events-none">
        <span className="px-2.5 py-1 rounded-full bg-obsidian/90 backdrop-blur-md border border-white/15 text-[10px] font-bold text-white truncate max-w-[66%] shadow">
          {routeLabel}
        </span>
        <span className="px-2.5 py-1 rounded-full bg-obsidian/90 backdrop-blur-md border border-champagne-gold/40 text-[10px] font-bold text-champagne-gold shrink-0 shadow">
          ~{estimatedMinutes} min
        </span>
      </div>

      {/* Bottom-left Live GPS Indicator */}
      <div className="absolute bottom-2 left-2.5 pointer-events-none">
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-obsidian/85 backdrop-blur-md border border-white/10 text-[9px] font-semibold text-gray-300">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          GPS Córdoba en vivo
        </span>
      </div>
    </div>
  );
};
