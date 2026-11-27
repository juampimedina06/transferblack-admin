import React, { useState } from 'react';
import { Download, Minimize2, QrCode, Smartphone, Sparkles } from 'lucide-react';
import { APP_DOWNLOAD_LINKS } from '../constants/landingData';

/**
 * Código QR vectorial de alto contraste con monograma TB central.
 * Evita depender de imágenes externas o llamadas de red y siempre renderiza nítido.
 */
const PassengerQrSvg: React.FC = () => (
  <svg
    viewBox="0 0 120 120"
    className="w-28 h-28 text-obsidian"
    role="img"
    aria-label="Código QR para descargar Transfer Black Pasajero"
  >
    <rect width="120" height="120" rx="8" fill="#FFFFFF" />
    {/* Finder Pattern Top-Left */}
    <rect x="10" y="10" width="28" height="28" rx="3" fill="none" stroke="currentColor" strokeWidth="4" />
    <rect x="17" y="17" width="14" height="14" rx="1.5" fill="currentColor" />
    {/* Finder Pattern Top-Right */}
    <rect x="82" y="10" width="28" height="28" rx="3" fill="none" stroke="currentColor" strokeWidth="4" />
    <rect x="89" y="17" width="14" height="14" rx="1.5" fill="currentColor" />
    {/* Finder Pattern Bottom-Left */}
    <rect x="10" y="82" width="28" height="28" rx="3" fill="none" stroke="currentColor" strokeWidth="4" />
    <rect x="17" y="89" width="14" height="14" rx="1.5" fill="currentColor" />

    {/* Data modules matrix */}
    <g fill="currentColor">
      <rect x="46" y="10" width="6" height="6" rx="1" />
      <rect x="58" y="10" width="6" height="6" rx="1" />
      <rect x="70" y="10" width="6" height="6" rx="1" />
      <rect x="46" y="22" width="6" height="12" rx="1" />
      <rect x="58" y="22" width="12" height="6" rx="1" />
      <rect x="46" y="40" width="6" height="6" rx="1" />
      <rect x="70" y="34" width="6" height="12" rx="1" />

      <rect x="10" y="46" width="12" height="6" rx="1" />
      <rect x="28" y="46" width="6" height="12" rx="1" />
      <rect x="10" y="58" width="6" height="12" rx="1" />
      <rect x="20" y="64" width="12" height="6" rx="1" />

      <rect x="82" y="46" width="6" height="12" rx="1" />
      <rect x="94" y="46" width="16" height="6" rx="1" />
      <rect x="88" y="60" width="6" height="6" rx="1" />
      <rect x="102" y="58" width="8" height="14" rx="1" />

      <rect x="46" y="76" width="6" height="12" rx="1" />
      <rect x="58" y="82" width="14" height="6" rx="1" />
      <rect x="46" y="96" width="12" height="6" rx="1" />
      <rect x="64" y="94" width="6" height="16" rx="1" />

      <rect x="80" y="78" width="12" height="6" rx="1" />
      <rect x="98" y="78" width="12" height="6" rx="1" />
      <rect x="78" y="90" width="6" height="12" rx="1" />
      <rect x="90" y="90" width="12" height="12" rx="1.5" />
      <rect x="104" y="98" width="6" height="12" rx="1" />
    </g>

    {/* Center Brand Badge */}
    <rect x="45" y="45" width="30" height="30" rx="6" fill="#0A0A0C" stroke="#D4AF37" strokeWidth="2.5" />
    <text
      x="60"
      y="64"
      textAnchor="middle"
      fill="#D4AF37"
      fontSize="12"
      fontWeight="700"
      fontFamily="Montserrat, sans-serif"
    >
      TB
    </text>
  </svg>
);

export const PassengerAppFloatingDock: React.FC = () => {
  const [isMinimized, setIsMinimized] = useState(false);

  return (
    <aside
      aria-label="Descargar aplicación Transfer Black Pasajero"
      className="fixed bottom-5 right-5 z-50 select-none"
    >
      {isMinimized ? (
        <button
          type="button"
          onClick={() => setIsMinimized(false)}
          className="group flex items-center gap-3 px-4 py-3 rounded-full bg-obsidian text-white border border-champagne-gold/60 shadow-[0_12px_35px_rgba(0,0,0,0.55)] hover:border-champagne-gold hover:scale-[1.02] transition-all duration-200 cursor-pointer"
          aria-label="Mostrar código QR para descargar la app de pasajero"
        >
          <span className="relative flex h-8 w-8 items-center justify-center rounded-full bg-champagne-gold text-obsidian font-bold">
            <QrCode className="w-4 h-4" />
            <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-obsidian" />
          </span>
          <div className="text-left pr-1">
            <span className="block text-[10px] font-bold uppercase tracking-widest text-champagne-gold">
              App Pasajero
            </span>
            <span className="block text-xs font-semibold text-white">
              Descargar gratis
            </span>
          </div>
        </button>
      ) : (
        <div className="w-[290px] sm:w-[310px] rounded-2xl bg-obsidian/95 text-white backdrop-blur-xl border border-champagne-gold/40 shadow-[0_20px_50px_rgba(0,0,0,0.65)] overflow-hidden transition-all duration-300">
          {/* Top bar */}
          <div className="flex items-center justify-between px-4 py-2.5 bg-white/[0.04] border-b border-white/10">
            <div className="flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-champagne-gold" />
              <span className="text-[11px] font-bold uppercase tracking-wider text-champagne-gold">
                Transfer Black Pasajero
              </span>
            </div>
            <button
              type="button"
              onClick={() => setIsMinimized(true)}
              className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              aria-label="Minimizar tarjeta de descarga"
              title="Minimizar"
            >
              <Minimize2 className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Body: QR + Direct Store Actions */}
          <div className="p-4 flex items-center gap-3.5">
            <div className="shrink-0 p-1.5 rounded-xl bg-white shadow-inner border border-champagne-gold/30">
              <PassengerQrSvg />
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-white leading-snug">
                Viajá con prioridad desde tu celular
              </p>
              <p className="text-[11px] text-gray-400 mt-1 leading-relaxed">
                Escaneá el QR o descargala directo en tu tienda:
              </p>

              <div className="mt-2.5 flex flex-col gap-1.5">
                <a
                  href={APP_DOWNLOAD_LINKS.passengerAndroidUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-champagne-gold text-obsidian text-[11.5px] font-bold hover:brightness-110 transition-all"
                >
                  <Download className="w-3.5 h-3.5" />
                  Google Play
                </a>
                <a
                  href={APP_DOWNLOAD_LINKS.passengerIosUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-white border border-white/15 text-[11.5px] font-semibold transition-all"
                >
                  <Smartphone className="w-3.5 h-3.5 text-champagne-gold" />
                  App Store (iOS)
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};
