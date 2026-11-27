import React from 'react';

interface PhoneLiveMapPreviewProps {
  corridorId: string;
  routeLabel: string;
  estimatedMinutes: number;
}

interface CorridorMapGeometry {
  path: string;
  origin: { x: number; y: number };
  destination: { x: number; y: number };
}

const CORRIDOR_GEOMETRY: Record<string, CorridorMapGeometry> = {
  aeropuerto: {
    path: 'M 54 166 L 114 156 L 146 118 L 214 108 L 254 74 L 308 66',
    origin: { x: 54, y: 166 },
    destination: { x: 308, y: 66 },
  },
  'ciudad-empresaria': {
    path: 'M 70 174 L 122 142 L 172 132 L 212 92 L 286 78',
    origin: { x: 70, y: 174 },
    destination: { x: 286, y: 78 },
  },
  cerro: {
    path: 'M 52 84 L 120 90 L 168 118 L 228 130 L 292 156',
    origin: { x: 52, y: 84 },
    destination: { x: 292, y: 156 },
  },
  terminal: {
    path: 'M 48 94 L 106 106 L 158 140 L 234 150 L 298 168',
    origin: { x: 48, y: 94 },
    destination: { x: 298, y: 168 },
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
    <div className="relative w-full h-56 bg-[#11151E] overflow-hidden">
      <svg
        viewBox="0 0 360 210"
        className="w-full h-full object-cover"
        role="img"
        aria-label={`Mapa de ruta ${routeLabel}`}
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
        <rect width="360" height="210" fill="#12161F" />

        {/* Urban Parks */}
        <path d="M 12 36 L 68 30 L 76 62 L 20 70 Z" fill="#14231E" opacity="0.92" />
        <path d="M 252 126 L 326 118 L 334 160 L 262 168 Z" fill="#14231E" opacity="0.88" />
        <path d="M 134 152 L 188 148 L 194 186 L 140 190 Z" fill="#14231E" opacity="0.72" />

        {/* City Blocks */}
        <g fill="#171C27">
          <rect x="84" y="40" width="38" height="26" rx="2" />
          <rect x="130" y="38" width="46" height="24" rx="2" />
          <rect x="186" y="42" width="42" height="28" rx="2" />
          <rect x="238" y="36" width="54" height="24" rx="2" />
          <rect x="22" y="84" width="44" height="30" rx="2" />
          <rect x="76" y="82" width="38" height="34" rx="2" />
          <rect x="124" y="78" width="48" height="28" rx="2" />
          <rect x="184" y="80" width="44" height="26" rx="2" />
          <rect x="28" y="132" width="46" height="36" rx="2" />
          <rect x="84" y="132" width="38" height="34" rx="2" />
          <rect x="198" y="128" width="44" height="38" rx="2" />
          <rect x="304" y="48" width="44" height="48" rx="2" />
        </g>

        {/* Río Suquía */}
        <path
          d="M -10 122 Q 78 104 152 122 T 280 108 T 374 94"
          fill="none"
          stroke="#182B42"
          strokeWidth="12"
          strokeLinecap="round"
        />

        {/* Secondary Streets */}
        <g stroke="#202736" strokeWidth="1.6" fill="none">
          <path d="M 0 64 L 360 58" />
          <path d="M 0 98 L 360 90" />
          <path d="M 0 144 L 360 136" />
          <path d="M 0 180 L 360 172" />
          <path d="M 46 0 L 64 210" />
          <path d="M 118 0 L 106 210" />
          <path d="M 178 0 L 190 210" />
          <path d="M 246 0 L 236 210" />
          <path d="M 306 0 L 318 210" />
        </g>

        {/* Major Avenues */}
        <g stroke="#2E374A" strokeWidth="3.6" fill="none" strokeLinecap="round">
          <path d="M -10 172 L 146 154 L 252 72 L 372 60" />
          <path d="M 22 10 L 142 124 L 228 148 L 368 182" />
          <path d="M 198 0 L 208 210" />
        </g>

        {/* Subtle Street Labels */}
        <g fill="#5B6780" fontSize="6.5" fontFamily="Montserrat, sans-serif" fontWeight="600">
          <text x="150" y="52">AV. LA VOZ DEL INTERIOR</text>
          <text x="18" y="126" transform="rotate(-7 18 126)">RÍO SUQUÍA</text>
          <text x="200" y="190">AV. COLÓN</text>
        </g>

        {/* Nearby Fleet Dots */}
        <g opacity="0.7">
          <circle cx="96" cy="76" r="2.6" fill="#D4AF37" />
          <circle cx="222" cy="162" r="2.6" fill="#D4AF37" />
          <circle cx="326" cy="108" r="2.6" fill="#D4AF37" />
        </g>

        {/* Route Casing + Glowing Gold Polyline */}
        <path
          d={geom.path}
          fill="none"
          stroke="#0A0A0C"
          strokeWidth="6.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          id={routePathId}
          d={geom.path}
          fill="none"
          stroke="url(#tb-map-route)"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          filter="url(#tb-gold-glow)"
        />

        {/* Origin Pin */}
        <g transform={`translate(${geom.origin.x}, ${geom.origin.y})`}>
          <circle r="9" fill="rgba(212, 175, 55, 0.22)" />
          <circle r="4.5" fill="#D4AF37" stroke="#0A0A0C" strokeWidth="1.8" />
        </g>

        {/* Destination Pin */}
        <g transform={`translate(${geom.destination.x}, ${geom.destination.y})`}>
          <circle r="9.5" fill="rgba(16, 185, 129, 0.22)" />
          <circle r="4.8" fill="#10B981" stroke="#0A0A0C" strokeWidth="1.8" />
        </g>

        {/* Animated Top-Down Car */}
        <g>
          <circle r="9.5" fill="rgba(212, 175, 55, 0.24)" />
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

      {/* Top gradient so Status Bar & Dynamic Island stay crisp over map */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-black/80 via-black/35 to-transparent"
      />
      {/* Soft bottom fade into the native Bottom Sheet */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-[#0D0D11] to-transparent"
      />

      {/* Minimal Floating ETA Chip on Map */}
      <div className="absolute top-12 right-4 pointer-events-none">
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-obsidian/88 backdrop-blur-md border border-white/15 text-[10.5px] font-bold text-white shadow-lg">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          ~{estimatedMinutes} min
        </span>
      </div>
    </div>
  );
};
