import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, Cookie, ShieldCheck, SlidersHorizontal, X } from 'lucide-react';

const COOKIE_STORAGE_KEY = 'tb_cookie_consent_v1';

export interface CookiePreferences {
  essential: true;
  preferences: boolean;
  analytics: boolean;
  updatedAt: string;
  version: '1.0';
}

function readStoredConsent(): CookiePreferences | null {
  try {
    const raw = localStorage.getItem(COOKIE_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<CookiePreferences>;
    if (typeof parsed.analytics === 'boolean' && typeof parsed.preferences === 'boolean') {
      return {
        essential: true,
        preferences: parsed.preferences,
        analytics: parsed.analytics,
        updatedAt: parsed.updatedAt || new Date().toISOString(),
        version: '1.0',
      };
    }
    return null;
  } catch {
    return null;
  }
}

interface CookieConsentBannerProps {
  externalOpen?: boolean;
  onExternalClose?: () => void;
}

export const CookieConsentBanner: React.FC<CookieConsentBannerProps> = ({
  externalOpen = false,
  onExternalClose,
}) => {
  const [stored, setStored] = useState<CookiePreferences | null>(() => readStoredConsent());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [preferencesEnabled, setPreferencesEnabled] = useState<boolean>(
    stored?.preferences ?? true,
  );
  const [analyticsEnabled, setAnalyticsEnabled] = useState<boolean>(stored?.analytics ?? false);

  useEffect(() => {
    if (externalOpen) {
      const current = readStoredConsent();
      setPreferencesEnabled(current?.preferences ?? true);
      setAnalyticsEnabled(current?.analytics ?? false);
      setIsModalOpen(true);
    }
  }, [externalOpen]);

  const saveConsent = (preferences: boolean, analytics: boolean) => {
    const payload: CookiePreferences = {
      essential: true,
      preferences,
      analytics,
      updatedAt: new Date().toISOString(),
      version: '1.0',
    };
    try {
      localStorage.setItem(COOKIE_STORAGE_KEY, JSON.stringify(payload));
    } catch {
      // Ignore storage quota / private mode errors
    }
    setStored(payload);
    setPreferencesEnabled(preferences);
    setAnalyticsEnabled(analytics);
    setIsModalOpen(false);
    onExternalClose?.();
  };

  const closeModal = () => {
    setIsModalOpen(false);
    onExternalClose?.();
  };

  return (
    <>
      {/* Banner inicial (esquina inferior izquierda para no chocar con el QR de abajo a la derecha) */}
      {!stored && !isModalOpen && (
        <div
          role="region"
          aria-label="Aviso de privacidad y cookies"
          className="fixed bottom-5 left-5 right-5 sm:right-auto sm:max-w-md z-40 rounded-2xl bg-white/95 dark:bg-obsidian/95 backdrop-blur-xl border border-gray-200 dark:border-white/15 shadow-2xl p-5 transition-all"
        >
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-champagne-gold/15 text-champagne-gold flex items-center justify-center shrink-0 mt-0.5">
              <Cookie className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-900 dark:text-white">
                Privacidad y uso de cookies
              </h3>
              <p className="text-xs text-gray-600 dark:text-gray-300 mt-1.5 leading-relaxed">
                Utilizamos cookies esenciales para el funcionamiento seguro del sitio y cookies opcionales de preferencias y medición conforme a la Ley 25.326. Consultá nuestra{' '}
                <Link
                  to="/privacidad"
                  className="font-semibold text-champagne-gold underline underline-offset-2"
                >
                  Política de Privacidad
                </Link>
                .
              </p>

              <div className="mt-4 flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => saveConsent(true, true)}
                  className="px-3.5 py-2 rounded-lg bg-obsidian dark:bg-champagne-gold text-white dark:text-obsidian text-xs font-bold hover:brightness-110 transition-all cursor-pointer"
                >
                  Aceptar todas
                </button>
                <button
                  type="button"
                  onClick={() => saveConsent(false, false)}
                  className="px-3.5 py-2 rounded-lg bg-gray-100 dark:bg-white/10 text-gray-800 dark:text-gray-200 text-xs font-semibold hover:bg-gray-200 dark:hover:bg-white/15 transition-colors cursor-pointer"
                >
                  Solo esenciales
                </button>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-2.5 py-2 rounded-lg text-xs font-semibold text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors cursor-pointer"
                >
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                  Configurar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de preferencias granulares */}
      {isModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Preferencias de cookies"
          onClick={closeModal}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg rounded-2xl bg-white dark:bg-obsidian border border-gray-200 dark:border-white/15 shadow-2xl overflow-hidden"
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-white/10">
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-5 h-5 text-champagne-gold" />
                <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                  Centro de Preferencias de Cookies
                </h3>
              </div>
              <button
                type="button"
                onClick={closeModal}
                aria-label="Cerrar preferencias de cookies"
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-800 dark:hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
                Podés gestionar qué categorías de almacenamiento local y cookies permitís en Transfer Black. Tu elección queda registrada y podés modificarla en cualquier momento desde el pie de página.
              </p>

              {/* Categoría 1: Esenciales */}
              <div className="flex items-start justify-between gap-4 pb-4 border-b border-gray-100 dark:border-white/10">
                <div>
                  <p className="text-xs font-bold text-gray-900 dark:text-white">
                    Estrictamente necesarias
                  </p>
                  <p className="text-[11.5px] text-gray-500 dark:text-gray-400 mt-1">
                    Imprescindibles para seguridad, sesión autenticada y seguimiento público de viajes (`/track`). No pueden desactivarse.
                  </p>
                </div>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10.5px] font-bold bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 shrink-0">
                  <Check className="w-3 h-3" /> Activas
                </span>
              </div>

              {/* Categoría 2: Preferencias */}
              <label className="flex items-start justify-between gap-4 pb-4 border-b border-gray-100 dark:border-white/10 cursor-pointer">
                <div>
                  <p className="text-xs font-bold text-gray-900 dark:text-white">
                    Preferencias de interfaz
                  </p>
                  <p className="text-[11.5px] text-gray-500 dark:text-gray-400 mt-1">
                    Recuerdan tu tema visual (modo claro/oscuro) y ajustes de visualización en próximas visitas.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={preferencesEnabled}
                  onChange={(e) => setPreferencesEnabled(e.target.checked)}
                  className="mt-1 h-4 w-4 accent-champagne-gold cursor-pointer"
                />
              </label>

              {/* Categoría 3: Analítica */}
              <label className="flex items-start justify-between gap-4 cursor-pointer">
                <div>
                  <p className="text-xs font-bold text-gray-900 dark:text-white">
                    Medición y rendimiento
                  </p>
                  <p className="text-[11.5px] text-gray-500 dark:text-gray-400 mt-1">
                    Nos ayudan a entender qué secciones resultan más útiles y mejorar los tiempos de carga. Nunca vendemos tus datos.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={analyticsEnabled}
                  onChange={(e) => setAnalyticsEnabled(e.target.checked)}
                  className="mt-1 h-4 w-4 accent-champagne-gold cursor-pointer"
                />
              </label>
            </div>

            <div className="px-6 py-4 bg-gray-50 dark:bg-white/[0.03] border-t border-gray-100 dark:border-white/10 flex flex-wrap items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => saveConsent(false, false)}
                className="px-4 py-2 rounded-lg text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-200/70 dark:hover:bg-white/10 transition-colors cursor-pointer"
              >
                Rechazar opcionales
              </button>
              <button
                type="button"
                onClick={() => saveConsent(preferencesEnabled, analyticsEnabled)}
                className="px-4 py-2 rounded-lg bg-obsidian dark:bg-champagne-gold text-white dark:text-obsidian text-xs font-bold hover:brightness-110 transition-all cursor-pointer"
              >
                Guardar preferencias
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
