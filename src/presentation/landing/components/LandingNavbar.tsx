import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Compass, Download, Lock, Menu, Moon, Sun, X } from 'lucide-react';
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

  return (
    <header className="sticky top-0 z-40 w-full bg-white/90 dark:bg-obsidian/90 backdrop-blur-md border-b border-gray-200/80 dark:border-white/10 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand */}
        <a href="#viajar" className="flex items-center gap-2.5 shrink-0">
          <img
            src={transferLogo}
            alt="Transfer Black"
            width={32}
            height={32}
            className="h-8 w-auto"
          />
          <span className="font-bold tracking-widest text-sm text-gray-900 dark:text-white">
            TRANSFER BLACK
          </span>
          <span className="hidden sm:inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-champagne-gold/15 text-champagne-gold border border-champagne-gold/30">
            Córdoba
          </span>
        </a>

        {/* Desktop Nav Links */}
        <nav aria-label="Navegación principal" className="hidden lg:flex items-center gap-6">
          {NAV_LINKS.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="text-xs font-semibold text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-champagne-gold transition-colors"
            >
              {item.label}
            </a>
          ))}
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          <button
            type="button"
            onClick={toggleTheme}
            className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors cursor-pointer"
            aria-label={theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
            title={theme === 'dark' ? 'Modo claro' : 'Modo oscuro'}
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-champagne-gold" /> : <Moon className="w-4 h-4" />}
          </button>

          <Link
            to="/track"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
          >
            <Compass className="w-3.5 h-3.5 text-champagne-gold" />
            <span>Seguir viaje</span>
          </Link>

          <Link
            to={isAuthenticated ? '/dashboard' : '/login'}
            className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white border border-gray-200 dark:border-white/10 transition-colors"
          >
            <Lock className="w-3 h-3 text-champagne-gold" />
            <span>{isAuthenticated ? 'Ir al panel' : 'Operaciones'}</span>
          </Link>

          <a
            href={APP_DOWNLOAD_LINKS.passengerAndroidUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-obsidian dark:bg-champagne-gold text-white dark:text-obsidian text-xs font-bold hover:brightness-110 transition-all shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Descargar App</span>
          </a>

          {/* Mobile menu button */}
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen((prev) => !prev)}
            className="lg:hidden p-2 rounded-lg text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/10 cursor-pointer"
            aria-label="Abrir menú de navegación"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown */}
      {isMobileMenuOpen && (
        <div className="lg:hidden border-t border-gray-200 dark:border-white/10 bg-white dark:bg-obsidian px-4 py-4 space-y-2">
          {NAV_LINKS.map((item) => (
            <a
              key={item.href}
              href={item.href}
              onClick={() => setIsMobileMenuOpen(false)}
              className="block py-2 text-sm font-semibold text-gray-800 dark:text-gray-200 hover:text-champagne-gold"
            >
              {item.label}
            </a>
          ))}
          <div className="pt-2 border-t border-gray-100 dark:border-white/10 flex flex-wrap gap-2">
            <Link
              to="/track"
              onClick={() => setIsMobileMenuOpen(false)}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-gray-100 dark:bg-white/10 text-gray-800 dark:text-white"
            >
              <Compass className="w-3.5 h-3.5 text-champagne-gold" />
              Seguir viaje en vivo
            </Link>
            <Link
              to={isAuthenticated ? '/dashboard' : '/login'}
              onClick={() => setIsMobileMenuOpen(false)}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-gray-100 dark:bg-white/10 text-gray-800 dark:text-white"
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
