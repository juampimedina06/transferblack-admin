import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { X } from 'lucide-react';

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
      // Ignore storage errors
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
      {/* Banner minimalista monocromático */}
      {!stored && !isModalOpen && (
        <div
          role="region"
          aria-label="Aviso de privacidad y cookies"
          className="fixed bottom-16 left-4 right-4 sm:bottom-5 sm:left-5 sm:right-auto sm:max-w-sm z-40 rounded-xl bg-white dark:bg-obsidian border border-gray-200 dark:border-white/15 shadow-xl p-4 transition-all"
        >
          <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
            Usamos cookies esenciales y opcionales conforme a la Ley 25.326.{' '}
            <Link
              to="/privacidad"
              className="text-gray-900 dark:text-white underline underline-offset-2 font-medium"
            >
              Privacidad
            </Link>
          </p>

          <div className="mt-3 flex items-center gap-2">
            <button
              type="button"
              onClick={() => saveConsent(true, true)}
              className="px-3.5 py-1.5 rounded-lg bg-obsidian dark:bg-white text-white dark:text-obsidian text-xs font-semibold hover:opacity-90 transition-opacity cursor-pointer"
            >
              Aceptar
            </button>
            <button
              type="button"
              onClick={() => saveConsent(false, false)}
              className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-white/15 text-gray-700 dark:text-gray-300 text-xs font-medium hover:bg-gray-100 dark:hover:bg-white/10 transition-colors cursor-pointer"
            >
              Esenciales
            </button>
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="ml-auto text-xs font-medium text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors cursor-pointer"
            >
              Configurar
            </button>
          </div>
        </div>
      )}

      {/* Modal minimalista de preferencias */}
      {isModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Preferencias de cookies"
          onClick={closeModal}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-xs p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-2xl bg-white dark:bg-obsidian border border-gray-200 dark:border-white/15 shadow-2xl overflow-hidden"
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-white/10">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                Preferencias de cookies
              </h3>
              <button
                type="button"
                onClick={closeModal}
                aria-label="Cerrar preferencias de cookies"
                className="p-1 rounded-md text-gray-400 hover:text-gray-900 dark:hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div className="flex items-start justify-between gap-4 pb-3.5 border-b border-gray-100 dark:border-white/10">
                <div>
                  <p className="text-xs font-semibold text-gray-900 dark:text-white">Esenciales</p>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                    Necesarias para seguridad y seguimiento de viajes.
                  </p>
                </div>
                <span className="text-[11px] font-medium text-gray-500 dark:text-gray-400 shrink-0">
                  Siempre activas
                </span>
              </div>

              <label className="flex items-start justify-between gap-4 pb-3.5 border-b border-gray-100 dark:border-white/10 cursor-pointer">
                <div>
                  <p className="text-xs font-semibold text-gray-900 dark:text-white">Preferencias</p>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                    Recuerdan tu tema visual (claro u oscuro).
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={preferencesEnabled}
                  onChange={(e) => setPreferencesEnabled(e.target.checked)}
                  className="mt-0.5 h-4 w-4 accent-obsidian dark:accent-white cursor-pointer"
                />
              </label>

              <label className="flex items-start justify-between gap-4 cursor-pointer">
                <div>
                  <p className="text-xs font-semibold text-gray-900 dark:text-white">Medición</p>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                    Ayudan a mejorar rendimiento y experiencia.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={analyticsEnabled}
                  onChange={(e) => setAnalyticsEnabled(e.target.checked)}
                  className="mt-0.5 h-4 w-4 accent-obsidian dark:accent-white cursor-pointer"
                />
              </label>
            </div>

            <div className="px-5 py-3.5 border-t border-gray-100 dark:border-white/10 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => saveConsent(false, false)}
                className="px-3.5 py-1.5 rounded-lg text-xs font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors cursor-pointer"
              >
                Solo esenciales
              </button>
              <button
                type="button"
                onClick={() => saveConsent(preferencesEnabled, analyticsEnabled)}
                className="px-4 py-1.5 rounded-lg bg-obsidian dark:bg-white text-white dark:text-obsidian text-xs font-semibold hover:opacity-90 transition-opacity cursor-pointer"
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
