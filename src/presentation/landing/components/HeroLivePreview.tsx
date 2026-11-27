import React from 'react';
import { CheckCircle2, MapPin, Navigation, PhoneCall, ShieldCheck, Star } from 'lucide-react';
import { AnimatedNumber } from '../../components/common/AnimatedNumber';
import type { LandingStats } from '../../auth/hooks/useLandingStats';

interface HeroLivePreviewProps {
  stats: LandingStats | undefined;
}

export const HeroLivePreview: React.FC<HeroLivePreviewProps> = ({ stats }) => {
  const activeDrivers = stats?.activeDrivers ?? 318;
  const corporateCompanies = stats?.corporateCompanies ?? 24;

  return (
    <div className="relative w-full">
      {/* Glow background */}
      <div
        aria-hidden="true"
        className="absolute -inset-3 rounded-3xl bg-gradient-to-tr from-champagne-gold/20 via-champagne-gold/5 to-transparent blur-2xl pointer-events-none"
      />

      {/* Main Telemetry Card */}
      <div className="relative rounded-3xl bg-obsidian text-white border border-white/15 shadow-2xl overflow-hidden">
        {/* Top Status Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/10 bg-white/[0.03]">
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
            </span>
            <span className="text-xs font-semibold tracking-wide text-gray-200">
              DESPACHO EN VIVO · CÓRDOBA CAPITAL
            </span>
          </div>
          <span className="font-mono text-xs font-bold px-2.5 py-0.5 rounded-full bg-champagne-gold/15 text-champagne-gold border border-champagne-gold/30">
            TB-4821 · PRIORIDAD
          </span>
        </div>

        {/* Simulated Map Canvas */}
        <div className="relative h-64 sm:h-72 bg-[#0D0E12] overflow-hidden">
          {/* Subtle Street Grid SVG */}
          <svg
            viewBox="0 0 600 300"
            className="w-full h-full object-cover opacity-90"
            aria-label="Ilustración de seguimiento satelital en tiempo real en Córdoba"
          >
            <defs>
              <pattern id="tb-grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path
                  d="M 40 0 L 0 0 0 40"
                  fill="none"
                  stroke="rgba(255,255,255,0.04)"
                  strokeWidth="1"
                />
              </pattern>
              <linearGradient id="tb-route-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#D4AF37" stopOpacity="0.25" />
                <stop offset="50%" stopColor="#D4AF37" stopOpacity="1" />
                <stop offset="100%" stopColor="#10B981" stopOpacity="1" />
              </linearGradient>
            </defs>

            <rect width="600" height="300" fill="url(#tb-grid)" />

            {/* Stylized Río Suquía & Arterias */}
            <path
              d="M -20 210 Q 180 170 340 205 T 620 165"
              fill="none"
              stroke="rgba(56, 189, 248, 0.08)"
              strokeWidth="18"
            />
            <path
              d="M 60 -10 L 190 310 M 320 -10 L 280 310 M 470 -10 L 520 310 M -10 95 L 610 120"
              fill="none"
              stroke="rgba(255,255,255,0.06)"
              strokeWidth="4"
            />

            {/* Active Golden Trip Route */}
            <path
              d="M 105 225 C 190 220, 225 135, 315 130 C 400 125, 435 85, 505 78"
              fill="none"
              stroke="url(#tb-route-grad)"
              strokeWidth="4.5"
              strokeLinecap="round"
              strokeDasharray="8 4"
            />

            {/* Origin Pin */}
            <g transform="translate(105, 225)">
              <circle r="12" fill="rgba(212, 175, 55, 0.2)" />
              <circle r="5.5" fill="#D4AF37" stroke="#0A0A0C" strokeWidth="2" />
            </g>

            {/* Moving Vehicle Marker */}
            <g transform="translate(315, 130)">
              <circle r="22" fill="rgba(212, 175, 55, 0.16)" />
              <circle r="11" fill="#D4AF37" />
              <path d="M -4 3 L 0 -5 L 4 3 Z" fill="#0A0A0C" transform="rotate(65)" />
            </g>

            {/* Destination Pin */}
            <g transform="translate(505, 78)">
              <circle r="14" fill="rgba(16, 185, 129, 0.22)" />
              <circle r="6" fill="#10B981" stroke="#0A0A0C" strokeWidth="2" />
            </g>
          </svg>

          {/* Floating Route Pills over Map */}
          <div className="absolute top-3.5 left-4 right-4 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-obsidian/90 backdrop-blur-md border border-white/10 text-xs">
              <MapPin className="w-3.5 h-3.5 text-champagne-gold shrink-0" />
              <span className="text-gray-300">Nueva Córdoba</span>
              <span className="text-gray-500">→</span>
              <Navigation className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span className="text-white font-semibold">Aeropuerto Taravella</span>
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/20 backdrop-blur-md border border-emerald-400/30 text-emerald-300 text-xs font-bold">
              <span>Llega en 4 min</span>
            </div>
          </div>

          {/* Floating Verified Driver Card */}
          <div className="absolute bottom-3.5 left-4 right-4 rounded-2xl bg-obsidian/95 backdrop-blur-md border border-white/15 p-3.5 shadow-xl">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-11 h-11 rounded-xl bg-champagne-gold text-obsidian font-bold text-sm flex items-center justify-center shrink-0">
                  MG
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="text-sm font-bold text-white truncate">Martín Gómez</p>
                    <span className="inline-flex items-center gap-0.5 text-xs font-bold text-champagne-gold">
                      <Star className="w-3.5 h-3.5 fill-champagne-gold" /> 4.96
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 truncate">
                    Toyota Corolla Cross · <span className="font-mono text-white font-semibold">AF 842 KL</span>
                  </p>
                </div>
              </div>

              <div className="hidden sm:flex flex-col items-end shrink-0">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-[11px] font-semibold">
                  <CheckCircle2 className="w-3 h-3" /> Entrevista presencial OK
                </span>
                <span className="text-[10.5px] text-gray-400 mt-1 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-champagne-gold" /> 7 documentos al día
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Live Metrics Strip */}
        <div className="grid grid-cols-3 divide-x divide-white/10 bg-white/[0.02] border-t border-white/10">
          <div className="p-4 text-center">
            <div className="text-xl sm:text-2xl font-bold text-champagne-gold">
              <AnimatedNumber value={activeDrivers} />
            </div>
            <p className="text-[11px] text-gray-400 uppercase tracking-wider mt-0.5">
              Conductores activos
            </p>
          </div>

          <div className="p-4 text-center">
            <div className="text-xl sm:text-2xl font-bold text-white">
              <AnimatedNumber value={corporateCompanies} />
            </div>
            <p className="text-[11px] text-gray-400 uppercase tracking-wider mt-0.5">
              Cuentas empresas
            </p>
          </div>

          <div className="p-4 text-center">
            <div className="text-xl sm:text-2xl font-bold text-emerald-400 flex items-center justify-center gap-1">
              <PhoneCall className="w-4 h-4" />
              <span>24/7</span>
            </div>
            <p className="text-[11px] text-gray-400 uppercase tracking-wider mt-0.5">
              Mesa operativa Córdoba
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
