import React from 'react';
import { Menu, Search, Bell, LogOut, Sun, Moon, PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { useAuthStore } from '../../auth/store/useAuthStore';
import { useUIStore } from '../../store/useUIStore';
import { useNavigate } from 'react-router-dom';

interface HeaderProps {
  onMenuClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const navigate = useNavigate();
  const logout = useAuthStore((state) => state.logout);
  const user = useAuthStore((state) => state.user);
  const { theme, toggleTheme, isSidebarCollapsed, toggleSidebarCollapsed } = useUIStore();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <header className="h-16 bg-white dark:bg-dark-surface border-b border-gray-200 dark:border-dark-border flex items-center justify-between px-4 lg:px-8 z-10 sticky top-0 transition-colors duration-200">
      <div className="flex items-center gap-3">
        {/* Mobile menu trigger */}
        <button 
          onClick={onMenuClick}
          className="lg:hidden p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg"
          aria-label="Abrir menú"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Desktop collapse sidebar toggle button */}
        <button
          onClick={toggleSidebarCollapsed}
          className="hidden lg:flex p-2 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg transition-colors"
          title={isSidebarCollapsed ? "Expandir barra lateral" : "Minimizar barra lateral"}
          aria-label={isSidebarCollapsed ? "Expandir barra lateral" : "Minimizar barra lateral"}
        >
          {isSidebarCollapsed ? (
            <PanelLeftOpen className="w-5 h-5" />
          ) : (
            <PanelLeftClose className="w-5 h-5" />
          )}
        </button>

        <h1 className="text-lg font-semibold text-gray-900 dark:text-white hidden sm:block">
          Dashboard <span className="text-gray-400 dark:text-gray-500 font-normal text-sm ml-2">agosto 2026</span>
        </h1>
      </div>

      <div className="flex items-center gap-3 lg:gap-5">
        {/* Search */}
        <div className="hidden md:flex relative group">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input 
            type="text" 
            placeholder="Buscar viaje, conductor o pasajero" 
            className="pl-10 pr-4 py-2 bg-gray-100 dark:bg-dark-card border border-transparent dark:border-dark-border rounded-lg text-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-500 focus:bg-white dark:focus:bg-dark-card focus:border-champagne-gold focus:ring-1 focus:ring-champagne-gold outline-none w-64 transition-all"
            disabled
          />
        </div>

        {/* Theme Toggle (Dark / Light) */}
        <button
          onClick={toggleTheme}
          className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg transition-all flex items-center justify-center"
          title={theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
          aria-label="Cambiar tema"
        >
          {theme === 'dark' ? (
            <Sun className="w-5 h-5 text-champagne-gold hover:rotate-45 transition-transform duration-300" />
          ) : (
            <Moon className="w-5 h-5 text-gray-600 hover:-rotate-12 transition-transform duration-300" />
          )}
        </button>

        {/* Notifications */}
        <button 
          className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg relative transition-colors"
          aria-label="Notificaciones"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-champagne-gold rounded-full ring-2 ring-white dark:ring-dark-surface" />
        </button>

        {/* User & Logout */}
        <div className="flex items-center gap-3 border-l pl-3 lg:pl-5 border-gray-200 dark:border-dark-border">
          <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-white/10 text-gray-700 dark:text-champagne-gold flex items-center justify-center text-xs font-semibold uppercase">
            {user?.first_name ? `${user.first_name[0]}${user.last_name ? user.last_name[0] : ''}` : 'MF'}
          </div>
          <button 
            onClick={handleLogout}
            className="p-2 text-gray-400 hover:text-red-500 hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg transition-colors group"
            title="Cerrar sesión"
            aria-label="Cerrar sesión"
          >
            <LogOut className="w-4 h-4 group-hover:scale-110 transition-transform" />
          </button>
        </div>
      </div>
    </header>
  );
};
