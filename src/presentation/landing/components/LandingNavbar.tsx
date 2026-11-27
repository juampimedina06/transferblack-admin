import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, Compass, Lock, Menu, Moon, Sun, X } from 'lucide-react';
import transferLogo from '../../../assets/img/logo_transferblack_sinfodo.png';
import { useUIStore } from '../../store/useUIStore';
import { useAuthStore } from '../../auth/store/useAuthStore';
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
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-6">
        {/* Brand + Live Operational Pill */}
        <div className="flex items-center gap-4 shrink-0">
          <a href="#viajar" className="flex items-center gap-3 group">
            <img
              src={transferLogo}
              alt="Transfer Black"
              width={38}
              height={38}
              className="h-9 w-auto transition-transform duration-300 group-hover:scale-105"
            />
            <div className="flex flex-col">
              <span className="font-bold tracking-[0.22em] text-sm text-white leading-none">
                TRANSFER BLACK
              </span>
              <span className="text-[10px] font-medium tracking-[0.18em] text-champagne-gold uppercase mt-1 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
                Córdoba · 24/7
              </span>
            </div>
          </a>
        </div>

        {/* Center Editorial Navigation with Animated Gold Underline */}
        <nav aria-label="Navegación principal" className="hidden lg:flex items-center gap-7">
          {NAV_LINKS.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="relative py-1 text-xs font-semibold uppercase tracking-[0.12em] text-gray-200 hover:text-white transition-colors after:content-[''] after:absolute after:left-0 after:bottom-0 after:h-[2px] after:w-0 after:bg-champagne-gold hover:after:w-full after:transition-all after:duration-300"
            >
              {item.label}
            </a>
          ))}
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={toggleTheme}
            className="p-2 rounded-full text-gray-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
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
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-semibold text-gray-200 hover:text-white hover:bg-white/10 transition-colors"
          >
            <Compass className="w-3.5 h-3.5 text-champagne-gold" />
            <span>Seguir viaje</span>
          </Link>

          <Link
            to={isAuthenticated ? '/dashboard' : '/login'}
            className="hidden md:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-semibold text-gray-200 hover:text-white border border-white/15 hover:border-champagne-gold/50 transition-all"
          >
            <Lock className="w-3 h-3 text-champagne-gold" />
            <span>{isAuthenticated ? 'Panel' : 'Operaciones'}</span>
          </Link>

          <a
            href={APP_DOWNLOAD_LINKS.passengerAndroidUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-4 sm:px-5 py-2.5 rounded-full bg-champagne-gold text-obsidian text-xs font-bold tracking-wide hover:brightness-110 transition-all shadow-[0_0_24px_rgba(212,175,55,0.28)]"
          >
            <span>Descargar App</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </a>

          <button
            type="button"
            onClick={() => setIsMobileMenuOpen((prev) => !prev)}
            className="lg:hidden p-2 rounded-full text-gray-200 hover:bg-white/10 cursor-pointer"
            aria-label="Abrir menú de navegación"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-obsidian/98 backdrop-blur-xl border-t border-white/10 px-6 py-6 space-y-4">
          <div className="flex flex-col divide-y divide-white/10">
            {NAV_LINKS.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className="py-3 text-sm font-semibold text-gray-200 hover:text-champagne-gold transition-colors"
              >
                {item.label}
              </a>
            ))}
          </div>
          <div className="pt-2 flex flex-wrap gap-2.5">
            <Link
              to="/track"
              onClick={() => setIsMobileMenuOpen(false)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold bg-white/10 text-white"
            >
              <Compass className="w-3.5 h-3.5 text-champagne-gold" />
              Seguir viaje en vivo
            </Link>
            <Link
              to={isAuthenticated ? '/dashboard' : '/login'}
              onClick={() => setIsMobileMenuOpen(false)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold border border-white/20 text-white"
            >
              <Lock className="w-3.5 h-3.5 text-champagne-gold" />
              {isAuthenticated ? 'Ir al panel' : 'Acceso Operaciones'}
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
