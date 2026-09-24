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
  X
} from 'lucide-react';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useAuthStore } from '../../auth/store/useAuthStore';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const NavItem = ({ to, icon: Icon, label, disabled = false }: { to: string, icon: React.ElementType, label: string, disabled?: boolean }) => {
  return (
    <NavLink
      to={to}
      onClick={(e) => {
        if (disabled) e.preventDefault();
      }}
      className={({ isActive }) => twMerge(
        clsx(
          "flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors duration-200",
          disabled 
            ? "opacity-50 cursor-not-allowed text-gray-500" 
            : isActive 
              ? "text-champagne-gold bg-white/5" 
              : "text-gray-300 hover:text-white hover:bg-white/5"
        )
      )}
    >
      <Icon className="w-5 h-5" />
      <span>{label}</span>
      {disabled && <span className="ml-auto text-[10px] uppercase tracking-wider text-gray-500">Próximamente</span>}
    </NavLink>
  );
};

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const user = useAuthStore((state) => state.user);
  const fullName = user?.first_name ? `${user.first_name} ${user.last_name || ''}`.trim() : 'Micaela Ferreyra';
  const initials = user?.first_name ? `${user.first_name[0]}${user.last_name ? user.last_name[0] : ''}` : 'MF';

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
          "fixed lg:static inset-y-0 left-0 z-50 w-64 bg-obsidian text-white flex flex-col transform transition-transform duration-300 ease-in-out",
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )
      )}>
        {/* Logo area */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-white/10">
          <div className="flex items-center gap-2">
            <div className="bg-champagne-gold text-obsidian font-bold text-xs p-1 rounded">TB</div>
            <span className="font-bold tracking-widest text-sm">TRANSFER BLACK</span>
          </div>
          <button onClick={onClose} className="lg:hidden text-gray-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto py-6 px-4 space-y-8">
          <div>
            <h3 className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Operación
            </h3>
            <nav className="space-y-1">
              <NavItem to="/dashboard" icon={LayoutDashboard} label="Dashboard" />
              <NavItem to="/mapa" icon={MapPin} label="Mapa en vivo" disabled />
              <NavItem to="/viajes" icon={MapIcon} label="Viajes" disabled />
              <NavItem to="/conductores" icon={Users} label="Conductores" disabled />
            </nav>
          </div>

          <div>
            <h3 className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Administración
            </h3>
            <nav className="space-y-1">
              <NavItem to="/retiros" icon={Wallet} label="Retiros y billeteras" disabled />
              <NavItem to="/empresas" icon={Building} label="Empresas" disabled />
              <NavItem to="/pasajeros" icon={UserCircle} label="Pasajeros" disabled />
              <NavItem to="/configuracion" icon={Settings} label="Configuración" disabled />
            </nav>
          </div>
        </div>

        {/* Profile */}
        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-3 px-2">
            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-sm font-medium">
              {initials}
            </div>
            <div>
              <p className="text-sm font-medium">{fullName}</p>
              <p className="text-xs text-gray-400">Operaciones - admin</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
