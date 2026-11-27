import React, { useState } from 'react';
import { Minus, QrCode } from 'lucide-react';
import { APP_DOWNLOAD_LINKS } from '../constants/landingData';

/** Código QR vectorial monocromático de alto contraste. */
const PassengerQrSvg: React.FC = () => (
  <svg
    viewBox="0 0 120 120"
    className="w-20 h-20 text-obsidian"
    role="img"
    aria-label="Código QR para descargar Transfer Black Pasajero"
  >
    <rect width="120" height="120" rx="6" fill="#FFFFFF" />
    {/* Finder Patterns */}
    <rect x="10" y="10" width="28" height="28" rx="3" fill="none" stroke="currentColor" strokeWidth="4" />
    <rect x="17" y="17" width="14" height="14" rx="1.5" fill="currentColor" />
    <rect x="82" y="10" width="28" height="28" rx="3" fill="none" stroke="currentColor" strokeWidth="4" />
    <rect x="89" y="17" width="14" height="14" rx="1.5" fill="currentColor" />
    <rect x="10" y="82" width="28" height="28" rx="3" fill="none" stroke="currentColor" strokeWidth="4" />
    <rect x="17" y="89" width="14" height="14" rx="1.5" fill="currentColor" />

    {/* Data modules */}
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

    {/* Minimal Center Monogram */}
    <rect x="46" y="46" width="28" height="28" rx="5" fill="#0A0A0C" />
    <text
      x="60"
      y="64"
      textAnchor="middle"
      fill="#FFFFFF"
      fontSize="11"
      fontWeight="700"
      fontFamily="Montserrat, sans-serif"
    >
      TB
    </text>
  </svg>
);

export const PassengerAppFloatingDock: React.FC = () => {
  const [isMinimized, setIsMinimized] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth < 1024 : true,
  );

  return (
    <aside
      aria-label="Descargar aplicación Transfer Black Pasajero"
      className="fixed bottom-4 right-4 sm:bottom-5 sm:right-5 z-50 select-none"
    >
      {isMinimized ? (
        <button
          type="button"
          onClick={() => setIsMinimized(false)}
          className="flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-obsidian text-white border border-white/15 shadow-xl hover:border-white/35 transition-colors cursor-pointer"
          aria-label="Mostrar descarga de la app de pasajero"
        >
          <QrCode className="w-4 h-4 text-white/85" />
          <span className="text-xs font-semibold tracking-wide">Descargar app</span>
        </button>
      ) : (
        <div className="w-64 rounded-2xl bg-obsidian text-white border border-white/15 shadow-2xl p-3.5 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-semibold text-gray-300 tracking-wide">
              App Pasajero
            </span>
            <button
              type="button"
              onClick={() => setIsMinimized(true)}
              className="p-1 rounded-md text-gray-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              aria-label="Minimizar descarga"
              title="Minimizar"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex items-center gap-3">
            <div className="shrink-0 p-1 rounded-lg bg-white">
              <PassengerQrSvg />
            </div>

            <div className="flex-1 min-w-0 space-y-2">
              <p className="text-[11px] text-gray-300 leading-snug">
                Escaneá el QR o descargá en tu tienda.
              </p>
              <div className="flex flex-col gap-1.5">
                <a
                  href={APP_DOWNLOAD_LINKS.passengerAndroidUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-center py-1.5 px-2.5 rounded-lg bg-white text-obsidian text-[11px] font-semibold hover:bg-gray-200 transition-colors"
                >
                  Google Play
                </a>
                <a
                  href={APP_DOWNLOAD_LINKS.passengerIosUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-center py-1.5 px-2.5 rounded-lg bg-white/10 text-white text-[11px] font-medium hover:bg-white/20 transition-colors"
                >
                  App Store
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};
