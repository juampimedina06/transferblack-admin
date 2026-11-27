import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, Cookie, MapPin, MessageCircle, Phone } from 'lucide-react';
import transferLogo from '../../../assets/img/logo_transferblack_sinfodo.png';
import { LEGAL_ENTITY } from '../../legal/constants/legalEntity';
import { APP_DOWNLOAD_LINKS, WHATSAPP_LINES, buildWhatsAppUrl } from '../constants/landingData';
import { ShinyText } from './motion/ReactBitsPrimitives';

interface LandingFooterProps {
  onOpenCookiePreferences: () => void;
}

export const LandingFooter: React.FC<LandingFooterProps> = ({ onOpenCookiePreferences }) => {
  return (
    <footer className="relative bg-obsidian text-gray-400 border-t border-white/10 overflow-hidden">
      {/* Pre-Footer Monumental Editorial CTA Band */}
      <div className="border-b border-white/10 relative">
        <div
          aria-hidden="true"
          className="pointer-events-none select-none absolute -right-10 -bottom-12 text-[120px] sm:text-[180px] font-bold tracking-widest text-white/[0.025] leading-none whitespace-nowrap"
        >
          TRANSFER BLACK
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 relative z-10 flex flex-col lg:flex-row lg:items-end justify-between gap-8">
          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.22em] mb-3">
              <ShinyText>Movilidad Ejecutiva en Córdoba</ShinyText>
            </p>
            <h2 className="text-3xl sm:text-5xl font-bold text-white tracking-tight leading-[1.1]">
              Tu próximo traslado empieza hoy.
            </h2>
            <p className="mt-3 text-sm sm:text-base text-gray-400">
              Descargá Transfer Black Pasajero o coordiná una cuenta corporativa directo con nuestro equipo local.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <a
              href={APP_DOWNLOAD_LINKS.passengerAndroidUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-champagne-gold text-obsidian text-sm font-bold hover:brightness-110 transition-all shadow-[0_0_28px_rgba(212,175,55,0.28)]"
            >
              <span>Descargar App Pasajero</span>
              <ArrowUpRight className="w-4 h-4" />
            </a>
            <a
              href={buildWhatsAppUrl(
                WHATSAPP_LINES[1].number,
                'Hola, quiero consultar por Transfer Black Empresas.',
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full border border-white/20 text-white hover:border-champagne-gold hover:text-champagne-gold text-sm font-semibold transition-all"
            >
              <MessageCircle className="w-4 h-4 text-emerald-400" />
              <span>Hablar con Empresas</span>
            </a>
          </div>
        </div>
      </div>

      {/* Main Directory Columns */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-28 sm:pb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 pb-14 border-b border-white/10">
          {/* Brand & Legal Entity */}
          <div className="lg:col-span-5 space-y-5">
            <div className="flex items-center gap-3">
              <img
                src={transferLogo}
                alt="Transfer Black"
                width={40}
                height={40}
                className="h-10 w-auto"
              />
              <div>
                <span className="block font-bold tracking-[0.22em] text-base text-white">
                  TRANSFER BLACK
                </span>
                <span className="block text-[10.5px] uppercase tracking-[0.18em] text-champagne-gold">
                  {LEGAL_ENTITY.businessName} · CUIT {LEGAL_ENTITY.taxId}
                </span>
              </div>
            </div>

            <p className="text-xs text-gray-400 leading-relaxed max-w-md">
              Plataforma tecnológica de intermediación para traslados ejecutivos, reservas programadas, cuentas corporativas y logística especial en Córdoba Capital y Gran Córdoba.
            </p>

            <div className="space-y-2 text-xs text-gray-300">
              <p className="flex items-center gap-2.5">
                <MapPin className="w-4 h-4 text-champagne-gold shrink-0" />
                <span>{LEGAL_ENTITY.address}</span>
              </p>
              <p className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-champagne-gold shrink-0" />
                <a
                  href={`tel:${LEGAL_ENTITY.supportPhone}`}
                  className="hover:text-champagne-gold transition-colors"
                >
                  Teléfono de soporte: {LEGAL_ENTITY.supportPhone}
                </a>
              </p>
            </div>

            <div className="flex flex-wrap gap-2.5 pt-1">
              {WHATSAPP_LINES.map((line) => (
                <a
                  key={line.id}
                  href={buildWhatsAppUrl(
                    line.number,
                    'Hola, me comunico desde la web de Transfer Black.',
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-3.5 py-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-white transition-colors"
                >
                  <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{line.displayPhone}</span>
                </a>
              ))}
            </div>
          </div>

          {/* Col: Movilidad */}
          <div className="lg:col-span-2 space-y-3.5 text-xs">
            <h3 className="font-bold uppercase tracking-[0.16em] text-white">Movilidad</h3>
            <ul className="space-y-2.5">
              <li>
                <a href="#viajar" className="hover:text-champagne-gold transition-colors">
                  Categoría Prioridad
                </a>
              </li>
              <li>
                <a href="#servicios" className="hover:text-champagne-gold transition-colors">
                  Viajes Reservados
                </a>
              </li>
              <li>
                <Link to="/track" className="hover:text-champagne-gold transition-colors">
                  Seguimiento (/track)
                </Link>
              </li>
              <li>
                <a href="#empresas" className="hover:text-champagne-gold transition-colors">
                  Transfer Black Empresas
                </a>
              </li>
              <li>
                <a href="#servicios" className="hover:text-champagne-gold transition-colors">
                  Grúa, Colectivo y Flete
                </a>
              </li>
            </ul>
          </div>

          {/* Col: Aplicaciones */}
          <div className="lg:col-span-2 space-y-3.5 text-xs">
            <h3 className="font-bold uppercase tracking-[0.16em] text-white">Aplicaciones</h3>
            <ul className="space-y-2.5">
              <li>
                <a
                  href={APP_DOWNLOAD_LINKS.passengerAndroidUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-champagne-gold transition-colors"
                >
                  Pasajero · Android
                </a>
              </li>
              <li>
                <a
                  href={APP_DOWNLOAD_LINKS.passengerIosUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-champagne-gold transition-colors"
                >
                  Pasajero · iOS
                </a>
              </li>
              <li>
                <a
                  href={APP_DOWNLOAD_LINKS.driverAndroidUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-champagne-gold transition-colors"
                >
                  Conductor · Postularse
                </a>
              </li>
              <li>
                <Link to="/login" className="hover:text-champagne-gold transition-colors">
                  Consola Operaciones
                </Link>
              </li>
            </ul>
          </div>

          {/* Col: Legales y Privacidad */}
          <div className="lg:col-span-3 space-y-3.5 text-xs">
            <h3 className="font-bold uppercase tracking-[0.16em] text-white">
              Legales y Privacidad
            </h3>
            <ul className="space-y-2.5">
              <li>
                <Link to="/terminos" className="hover:text-champagne-gold transition-colors">
                  Términos y Condiciones — Pasajeros
                </Link>
              </li>
              <li>
                <Link to="/privacidad" className="hover:text-champagne-gold transition-colors">
                  Política de Privacidad — Pasajeros
                </Link>
              </li>
              <li>
                <Link
                  to="/terminos-conductores"
                  className="hover:text-champagne-gold transition-colors"
                >
                  Términos y Condiciones — Conductores
                </Link>
              </li>
              <li>
                <Link
                  to="/privacidad-conductores"
                  className="hover:text-champagne-gold transition-colors"
                >
                  Política de Privacidad — Conductores
                </Link>
              </li>
              <li>
                <Link
                  to="/eliminar-cuenta"
                  className="hover:text-champagne-gold transition-colors"
                >
                  Eliminación de Cuenta y Datos
                </Link>
              </li>
              <li>
                <button
                  type="button"
                  onClick={onOpenCookiePreferences}
                  className="inline-flex items-center gap-1.5 text-champagne-gold hover:underline cursor-pointer"
                >
                  <Cookie className="w-3.5 h-3.5" />
                  <span>Preferencias de cookies</span>
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Legal Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500">
          <p>
            © {new Date().getFullYear()} {LEGAL_ENTITY.businessName}. Todos los derechos reservados.
          </p>
          <p>{LEGAL_ENTITY.jurisdiction} · Ley 25.326 de Protección de Datos Personales</p>
        </div>
      </div>
    </footer>
  );
};
