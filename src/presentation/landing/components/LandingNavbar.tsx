import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, Compass, Menu, Moon, Sun, X } from 'lucide-react';
import transferLogo from '../../../assets/img/logo_transferblack_sinfodo.png';
import { useUIStore } from '../../store/useUIStore';
import { APP_DOWNLOAD_LINKS } from '../constants/landingData';

const NAV_LINKS = [
  { href: '#viajar', label: 'Viajar' },
  { href: '#servicios', label: 'Servicios' },
  { href: '#empresas', label: 'Empresas' },
  { href: '#seguridad', label: 'Seguridad' },
  { href: '#conductores', label: 'Conductores' },
  { href: '#preguntas', label: 'Preguntas' },
] as const;

export const LandingNavbar: React.FC = () => {
  const { theme, toggleTheme } = useUIStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 24);
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 inset-x-0 z-40 transition-all duration-300 ${
        isScrolled
          ? 'bg-obsidian/92 backdrop-blur-xl border-b border-white/10 shadow-[0_12px_40px_rgba(0,0,0,0.45)]'
          : 'bg-gradient-to-b from-obsidian/85 via-obsidian/45 to-transparent border-b border-white/5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between gap-3 sm:gap-4">
        {/* Brand + Live Operational Pill */}
        <div className="flex items-center shrink-0 min-w-0">
          <a href="#viajar" className="flex items-center gap-2.5 sm:gap-3 group">
            <img
              src={transferLogo}
              alt="Transfer Black"
              width={38}
              height={38}
              className="h-8 sm:h-9 w-auto transition-transform duration-300 group-hover:scale-105 shrink-0"
            />
            <div className="flex flex-col">
              <span className="font-bold tracking-[0.14em] sm:tracking-[0.2em] text-xs sm:text-sm text-white leading-none whitespace-nowrap">
                TRANSFER BLACK
              </span>
              <span className="text-[9.5px] sm:text-[10px] font-medium tracking-[0.14em] sm:tracking-[0.16em] text-champagne-gold uppercase mt-1 flex items-center gap-1.5 whitespace-nowrap">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block shrink-0" />
                Córdoba · 24/7
              </span>
            </div>
          </a>
        </div>

        {/* Center Editorial Navigation with Animated Gold Underline */}
        <nav
          aria-label="Navegación principal"
          className="hidden lg:flex items-center justify-center flex-1 gap-5 xl:gap-7 px-2"
        >
          {NAV_LINKS.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="relative py-1 whitespace-nowrap text-[11px] xl:text-xs font-semibold uppercase tracking-[0.1em] xl:tracking-[0.12em] text-gray-200 hover:text-white transition-colors after:content-[''] after:absolute after:left-0 after:bottom-0 after:h-[2px] after:w-0 after:bg-champagne-gold hover:after:w-full after:transition-all after:duration-300"
            >
              {item.label}
            </a>
          ))}
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          <button
            type="button"
            onClick={toggleTheme}
            className="p-2 rounded-full text-gray-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer shrink-0"
            aria-label={theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
            title={theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-champagne-gold" />
            ) : (
              <Moon className="w-4 h-4 text-champagne-gold" />
            )}
          </button>

          <Link
            to="/track"
            className="hidden md:inline-flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-semibold text-gray-200 hover:text-white hover:bg-white/10 transition-colors whitespace-nowrap shrink-0"
          >
            <Compass className="w-3.5 h-3.5 text-champagne-gold shrink-0" />
            <span>Seguir viaje</span>
          </Link>

          <a
            href={APP_DOWNLOAD_LINKS.passengerAndroidUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-champagne-gold text-obsidian text-xs font-bold tracking-wide hover:brightness-110 transition-all shadow-[0_0_24px_rgba(212,175,55,0.28)] whitespace-nowrap shrink-0"
          >
            <span>Descargar App</span>
            <ArrowUpRight className="w-3.5 h-3.5 shrink-0" />
          </a>

          {/* Visible Hamburger Button on Mobile & Tablet */}
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen((prev) => !prev)}
            aria-expanded={isMobileMenuOpen}
            aria-label={isMobileMenuOpen ? 'Cerrar menú de navegación' : 'Abrir menú de navegación'}
            className="lg:hidden inline-flex items-center justify-center w-10 h-10 rounded-full bg-white/10 border border-white/15 text-white hover:border-champagne-gold/60 hover:text-champagne-gold transition-colors cursor-pointer shrink-0"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-obsidian/98 backdrop-blur-xl border-t border-white/10 px-5 py-5 space-y-4 shadow-2xl">
          <div className="flex flex-col divide-y divide-white/10">
            {NAV_LINKS.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className="py-3.5 text-sm font-semibold text-gray-100 hover:text-champagne-gold transition-colors flex items-center justify-between"
              >
                <span>{item.label}</span>
                <ArrowUpRight className="w-4 h-4 text-champagne-gold/70" />
              </a>
            ))}
          </div>
          <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
            <Link
              to="/track"
              onClick={() => setIsMobileMenuOpen(false)}
              className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-full text-xs font-semibold bg-white/10 border border-white/15 text-white"
            >
              <Compass className="w-4 h-4 text-champagne-gold" />
              Seguir viaje en vivo
            </Link>
            <a
              href={APP_DOWNLOAD_LINKS.passengerAndroidUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setIsMobileMenuOpen(false)}
              className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-full text-xs font-bold bg-champagne-gold text-obsidian"
            >
              <span>Descargar App Pasajero</span>
              <ArrowUpRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      )}
    </header>
  );
};
