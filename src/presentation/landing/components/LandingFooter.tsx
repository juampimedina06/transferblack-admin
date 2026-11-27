import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, MessageCircle, Phone } from 'lucide-react';
import transferLogo from '../../../assets/img/logo_transferblack_sinfodo.png';
import { LEGAL_ENTITY } from '../../legal/constants/legalEntity';
import { APP_DOWNLOAD_LINKS, WHATSAPP_LINES, buildWhatsAppUrl } from '../constants/landingData';

export const LandingFooter: React.FC = () => {
  return (
    <footer className="bg-obsidian text-gray-400 border-t border-white/10 pt-16 pb-24 sm:pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-white/10">
          {/* Col 1-2: Brand & Legal Entity */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <img
                src={transferLogo}
                alt="Transfer Black"
                width={36}
                height={36}
                className="h-9 w-auto"
              />
              <span className="font-bold tracking-widest text-base text-white">
                TRANSFER BLACK
              </span>
            </div>

            <p className="text-xs text-gray-400 leading-relaxed max-w-sm">
              Plataforma de movilidad ejecutiva, traslados corporativos y logística especial en Córdoba, operada por <strong className="text-white">{LEGAL_ENTITY.businessName}</strong> (CUIT {LEGAL_ENTITY.taxId}).
            </p>

            <div className="space-y-1.5 text-xs text-gray-300">
              <p className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-champagne-gold shrink-0" />
                <span>{LEGAL_ENTITY.address}</span>
              </p>
              <p className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-champagne-gold shrink-0" />
                <a
                  href={`tel:${LEGAL_ENTITY.supportPhone}`}
                  className="hover:text-champagne-gold transition-colors"
                >
                  Soporte: {LEGAL_ENTITY.supportPhone}
                </a>
              </p>
            </div>

            <div className="flex flex-wrap gap-2 pt-1">
              {WHATSAPP_LINES.map((line) => (
                <a
                  key={line.id}
                  href={buildWhatsAppUrl(
                    line.number,
                    'Hola, me comunico desde la web de Transfer Black.',
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-white transition-colors"
                >
                  <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{line.displayPhone}</span>
                </a>
              ))}
            </div>
          </div>

          {/* Col 3: Servicios */}
          <div className="space-y-3 text-xs">
            <h3 className="font-bold uppercase tracking-wider text-white">Movilidad</h3>
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
                  Seguimiento en Vivo (/track)
                </Link>
              </li>
              <li>
                <a href="#empresas" className="hover:text-champagne-gold transition-colors">
                  Transfer Black Empresas
                </a>
              </li>
              <li>
                <a href="#servicios" className="hover:text-champagne-gold transition-colors">
                  Grúa, Colectivos y Fletes
                </a>
              </li>
            </ul>
          </div>

          {/* Col 4: Aplicaciones */}
          <div className="space-y-3 text-xs">
            <h3 className="font-bold uppercase tracking-wider text-white">Aplicaciones</h3>
            <ul className="space-y-2.5">
              <li>
                <a
                  href={APP_DOWNLOAD_LINKS.passengerAndroidUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-champagne-gold transition-colors"
                >
                  App Pasajero · Android
                </a>
              </li>
              <li>
                <a
                  href={APP_DOWNLOAD_LINKS.passengerIosUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-champagne-gold transition-colors"
                >
                  App Pasajero · iOS
                </a>
              </li>
              <li>
                <a
                  href={APP_DOWNLOAD_LINKS.driverAndroidUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-champagne-gold transition-colors"
                >
                  App Conductor · Postularse
                </a>
              </li>
              <li>
                <Link to="/login" className="hover:text-champagne-gold transition-colors">
                  Consola de Operaciones
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 5: Legales y Privacidad */}
          <div className="space-y-3 text-xs">
            <h3 className="font-bold uppercase tracking-wider text-white">Legales</h3>
            <ul className="space-y-2.5">
              <li>
                <Link to="/terminos" className="hover:text-champagne-gold transition-colors">
                  Términos — Pasajeros
                </Link>
              </li>
              <li>
                <Link to="/privacidad" className="hover:text-champagne-gold transition-colors">
                  Privacidad — Pasajeros
                </Link>
              </li>
              <li>
                <Link
                  to="/terminos-conductores"
                  className="hover:text-champagne-gold transition-colors"
                >
                  Términos — Conductores
                </Link>
              </li>
              <li>
                <Link
                  to="/privacidad-conductores"
                  className="hover:text-champagne-gold transition-colors"
                >
                  Privacidad — Conductores
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
            </ul>
          </div>
        </div>

        {/* Bottom Copyright */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500">
          <p>
            © {new Date().getFullYear()} {LEGAL_ENTITY.businessName} · Todos los derechos reservados.
          </p>
          <p>{LEGAL_ENTITY.jurisdiction}</p>
        </div>
      </div>
    </footer>
  );
};
