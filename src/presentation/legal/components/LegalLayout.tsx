import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import transferLogo from '../../../assets/img/logo_transferblack_sinfodo.png';

/**
 * Las paginas legales todavia no pasaron revision del equipo legal.
 * Para sacar el banner de borrador alcanza con poner esta constante en false.
 */
export const SHOW_LEGAL_DRAFT_BANNER = true;

interface LegalLayoutProps {
  title: string;
  updatedAt: string;
  children: ReactNode;
}

/**
 * Layout compartido por las paginas publicas legales (`/terminos`, `/privacidad`).
 * Sigue el mismo patron que `TrackTrip`: no depende de `ProtectedRoute` ni del
 * store de auth del panel, y usa la identidad visual oscura con acento dorado.
 */
export function LegalLayout({ title, updatedAt, children }: LegalLayoutProps) {
  return (
    <div className="min-h-screen bg-obsidian font-montserrat text-gray-300">
      <header className="border-b border-dark-border bg-obsidian px-4 py-4">
        <div className="mx-auto flex max-w-3xl items-center gap-3">
          <img src={transferLogo} alt="Transfer Black" className="h-7 w-auto" />
          <span className="ml-auto text-xs font-semibold uppercase tracking-widest text-gray-500">
            {title}
          </span>
        </div>
      </header>

      {SHOW_LEGAL_DRAFT_BANNER && (
        <div className="bg-amber-950/40 px-4 py-2 text-center text-xs font-semibold text-amber-300">
          Borrador — pendiente de revisión legal
        </div>
      )}

      <main className="mx-auto max-w-3xl px-4 py-10">
        <h1 className="mb-1 text-2xl font-bold text-white sm:text-3xl">{title}</h1>
        <p className="mb-8 text-xs text-gray-500">Última actualización: {updatedAt}</p>

        <div className="space-y-8 text-sm leading-relaxed text-gray-300">{children}</div>

        <div className="mt-12 border-t border-dark-border pt-6 text-center">
          <Link to="/track" className="text-xs font-medium text-champagne-gold hover:underline">
            Volver a Transfer Black
          </Link>
        </div>
      </main>
    </div>
  );
}

interface LegalSectionProps {
  title: string;
  children: ReactNode;
}

/** Sección numerada dentro de una página legal: título dorado + cuerpo. */
export function LegalSection({ title, children }: LegalSectionProps) {
  return (
    <section>
      <h2 className="mb-2 text-base font-bold text-champagne-gold">{title}</h2>
      <div className="space-y-2">{children}</div>
    </section>
  );
}
