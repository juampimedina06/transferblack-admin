import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  MapPin,
  Map as MapIcon,
  Users,
  Wallet,
  Building,
  UserCircle,
  Settings,
  X,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useAuthStore } from '../../auth/store/useAuthStore';
import { useUIStore } from '../../store/useUIStore';
import { useDrivers } from '../../drivers/hooks/useDrivers';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

interface NavItemProps {
  to: string;
  icon: React.ElementType;
  label: string;
  disabled?: boolean;
  badge?: number | string;
  isCollapsed?: boolean;
}

const NavItem = ({ to, icon: Icon, label, disabled = false, badge, isCollapsed = false }: NavItemProps) => {
  return (
    <NavLink
      to={to}
      title={isCollapsed ? label : undefined}
      onClick={(e) => {
        if (disabled) e.preventDefault();
      }}
      className={({ isActive }) => twMerge(
        clsx(
          "flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 relative group",
          isCollapsed ? "justify-center px-2" : "justify-start",
          disabled
            ? "opacity-50 cursor-not-allowed text-gray-500"
            : isActive
              ? "text-champagne-gold bg-white/5 font-semibold"
              : "text-gray-300 hover:text-white hover:bg-white/5"
        )
      )}
    >
      <div className="relative flex items-center justify-center">
        <Icon className="w-5 h-5 flex-shrink-0" />
        {isCollapsed && badge && (
          <span className="absolute -top-1.5 -right-1.5 w-2 h-2 rounded-full bg-champagne-gold" />
        )}
      </div>

      {!isCollapsed && (
        <>
          <span className="truncate">{label}</span>
          {badge && (
            <span className="ml-auto text-xs font-semibold px-2 py-0.5 rounded-full bg-champagne-gold/20 text-champagne-gold border border-champagne-gold/30">
              {badge}
            </span>
          )}
          {disabled && !badge && (
            <span className="ml-auto text-[10px] uppercase tracking-wider text-gray-500">
              Próximamente
            </span>
          )}
        </>
      )}
    </NavLink>
  );
};

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const user = useAuthStore((state) => state.user);
  const { isSidebarCollapsed, toggleSidebarCollapsed } = useUIStore();

  const fullName = user?.first_name ? `${user.first_name} ${user.last_name || ''}`.trim() : 'Micaela Ferreyra';
  const initials = user?.first_name ? `${user.first_name[0]}${user.last_name ? user.last_name[0] : ''}` : 'MF';

  const { data: driversData } = useDrivers({ page: 1, limit: 1, status: 'pending' });
  const pendingCount = driversData?.pendingCount || 0;

  return (
    <>
      {/* Overlay mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside className={twMerge(
        clsx(
          "fixed lg:static inset-y-0 left-0 z-50 bg-obsidian text-white flex flex-col border-r border-white/5 dark:border-dark-border transform transition-all duration-300 ease-in-out select-none",
          isSidebarCollapsed ? "lg:w-[72px]" : "lg:w-64",
          "w-64",
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )
      )}>
        {/* Logo area */}
        <div className={twMerge(
          clsx(
            "h-16 flex items-center border-b border-white/10 transition-all duration-300 px-4",
            isSidebarCollapsed ? "justify-center" : "justify-between"
          )
        )}>
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="bg-champagne-gold text-obsidian font-bold text-xs p-1.5 rounded flex items-center justify-center flex-shrink-0">
              TB
            </div>
            {!isSidebarCollapsed && (
              <span className="font-bold tracking-widest text-sm whitespace-nowrap">
                TRANSFER BLACK
              </span>
            )}
          </div>

          <div className="flex items-center">
            {/* Desktop collapse toggle */}
            <button
              onClick={toggleSidebarCollapsed}
              className="hidden lg:flex p-1.5 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
              title={isSidebarCollapsed ? "Expandir menú" : "Minimizar menú"}
              aria-label={isSidebarCollapsed ? "Expandir menú" : "Minimizar menú"}
            >
              {isSidebarCollapsed ? (
                <ChevronRight className="w-4 h-4" />
              ) : (
                <ChevronLeft className="w-4 h-4" />
              )}
            </button>

            {/* Mobile close */}
            <button onClick={onClose} className="lg:hidden text-gray-400 hover:text-white p-1">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto py-5 px-3 space-y-6 scrollbar-none">
          <div>
            {!isSidebarCollapsed && (
              <h3 className="px-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-2.5">
                Operación
              </h3>
            )}
            <nav className="space-y-1">
              <NavItem to="/dashboard" icon={LayoutDashboard} label="Dashboard" isCollapsed={isSidebarCollapsed} />
              <NavItem to="/mapa" icon={MapPin} label="Mapa en vivo" disabled isCollapsed={isSidebarCollapsed} />
              <NavItem to="/viajes" icon={MapIcon} label="Viajes" disabled isCollapsed={isSidebarCollapsed} />
              <NavItem to="/conductores" icon={Users} label="Conductores" badge={pendingCount > 0 ? pendingCount : undefined} isCollapsed={isSidebarCollapsed} />
            </nav>
          </div>

          <div>
            {!isSidebarCollapsed && (
              <h3 className="px-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-2.5">
                Administración
              </h3>
            )}
            <nav className="space-y-1">
              <NavItem to="/retiros" icon={Wallet} label="Retiros y billeteras" disabled isCollapsed={isSidebarCollapsed} />
              <NavItem to="/empresas" icon={Building} label="Empresas" disabled isCollapsed={isSidebarCollapsed} />
              <NavItem to="/pasajeros" icon={UserCircle} label="Pasajeros" disabled isCollapsed={isSidebarCollapsed} />
              <NavItem to="/configuracion" icon={Settings} label="Configuración" disabled isCollapsed={isSidebarCollapsed} />
            </nav>
          </div>
        </div>

        {/* Profile */}
        <div className="p-3 border-t border-white/10">
          <div className={twMerge(
            clsx(
              "flex items-center gap-3 p-1.5 rounded-lg hover:bg-white/5 transition-colors",
              isSidebarCollapsed ? "justify-center" : "justify-start"
            )
          )}>
            <div className="w-8 h-8 rounded-full bg-white/10 text-champagne-gold flex items-center justify-center text-xs font-semibold flex-shrink-0">
              {initials}
            </div>
            {!isSidebarCollapsed && (
              <div className="overflow-hidden">
                <p className="text-sm font-medium text-white truncate">{fullName}</p>
                <p className="text-xs text-gray-400 truncate">Operaciones - admin</p>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};
