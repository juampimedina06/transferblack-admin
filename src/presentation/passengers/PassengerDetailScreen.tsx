import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { format, differenceInYears } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  AlertTriangle,
  ArrowLeft,
  Car,
  CheckCircle2,
  Clock,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  XCircle,
} from 'lucide-react';
import { usePassengerDetail } from './hooks/usePassengerDetail';
import { PassengerStatusBadge } from './components/PassengerStatusBadge';
import { AnimatedNumber } from '../components/common/AnimatedNumber';
import { Badge, Card, CardHeader, CardTitle } from '../components/common';

const formatCurrency = (amount?: number | null) => {
  if (amount == null) return '-';
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0,
  }).format(amount);
};

const getInitials = (fullName?: string, email?: string) => {
  const source = (fullName || email || 'US').trim();
  const parts = source.split(/\s+/);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return source.substring(0, 2).toUpperCase();
};

export const PassengerDetailScreen: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data, isLoading, isError } = usePassengerDetail(id || '');

  if (isLoading) {
    return (
      <div className="w-full px-4 py-6 flex flex-col gap-4 animate-pulse">
        <div className="h-5 w-40 bg-gray-200 dark:bg-white/10 rounded" />
        <div className="h-44 w-full bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border rounded-xl" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="h-24 bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border rounded-xl" />
          <div className="h-24 bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border rounded-xl" />
          <div className="h-24 bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border rounded-xl" />
        </div>
        <div className="h-60 w-full bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border rounded-xl" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="w-full flex flex-col items-center justify-center min-h-[400px] px-4 text-center">
        <AlertTriangle className="w-12 h-12 text-red-500 mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Error al cargar el detalle del pasajero
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 max-w-md">
          No pudimos obtener la información del usuario. Verificá que el backend tenga disponible el endpoint <code>/admin/passengers/:id</code>.
        </p>
        <button
          type="button"
          onClick={() => navigate('/pasajeros')}
          className="mt-4 text-sm font-semibold text-champagne-gold hover:underline cursor-pointer"
        >
          Volver al listado de pasajeros
        </button>
      </div>
    );
  }

  const { profile, stats, recentTrips = [] } = data;
  const displayName = profile?.fullName || data.email;

  return (
    <div className="w-full px-4 py-6 flex flex-col gap-5">
      <button
        type="button"
        onClick={() => navigate('/pasajeros')}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 dark:text-white/70 dark:hover:text-white transition-colors w-max cursor-pointer"
      >
        <ArrowLeft size={16} /> Volver a pasajeros
      </button>

      {/* Profile Header */}
      <div className="bg-white dark:bg-obsidian border border-gray-200 dark:border-white/10 rounded-xl p-6 flex flex-col md:flex-row items-start md:items-center gap-6 shadow-sm dark:shadow-none transition-colors">
        {profile?.avatarUrl ? (
          <img
            src={profile.avatarUrl}
            alt={displayName}
            loading="lazy"
            width={80}
            height={80}
            className="w-20 h-20 rounded-xl object-cover border border-gray-200 dark:border-white/10 shrink-0"
          />
        ) : (
          <div className="w-20 h-20 bg-[#F3E8C1] dark:bg-champagne-gold rounded-xl flex items-center justify-center text-[#9A7D3A] dark:text-obsidian text-2xl font-bold uppercase shrink-0">
            {getInitials(profile?.fullName, data.email)}
          </div>
        )}

        <div className="flex-1 min-w-0 w-full">
          <div className="flex flex-wrap items-center gap-2.5 mb-3">
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white truncate">
              {displayName}
            </h1>
            <PassengerStatusBadge status={data.status} />
            {data.emailVerifiedAt ? (
              <Badge variant="success">
                <CheckCircle2 className="w-3 h-3" /> Email verificado
              </Badge>
            ) : (
              <Badge variant="warning">
                <Clock className="w-3 h-3" /> Email sin verificar
              </Badge>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-4 gap-x-6 mt-2">
            <div>
              <p className="text-gray-400 dark:text-white/40 text-[10px] font-semibold uppercase tracking-wider mb-0.5 flex items-center gap-1">
                <Mail className="w-3 h-3" /> Correo electrónico
              </p>
              <p className="text-gray-800 dark:text-white/90 text-[13px] break-all">
                {data.email}
              </p>
            </div>

            <div>
              <p className="text-gray-400 dark:text-white/40 text-[10px] font-semibold uppercase tracking-wider mb-0.5 flex items-center gap-1">
                <Phone className="w-3 h-3" /> Teléfono
              </p>
              <p className="text-gray-800 dark:text-white/90 text-[13px]">
                {profile?.phoneE164 || '-'}
              </p>
            </div>

            <div>
              <p className="text-gray-400 dark:text-white/40 text-[10px] font-semibold uppercase tracking-wider mb-0.5">
                Documento
              </p>
              <p className="text-gray-800 dark:text-white/90 text-[13px]">
                {profile?.documentNumber
                  ? `${profile.documentType ? `${profile.documentType} ` : ''}${profile.documentNumber}`
                  : '-'}
              </p>
            </div>

            <div>
              <p className="text-gray-400 dark:text-white/40 text-[10px] font-semibold uppercase tracking-wider mb-0.5">
                Fecha de nacimiento
              </p>
              <p className="text-gray-800 dark:text-white/90 text-[13px]">
                {profile?.birthDate
                  ? `${format(new Date(profile.birthDate), 'dd/MM/yyyy')} (${differenceInYears(
                      new Date(),
                      new Date(profile.birthDate),
                    )} años)`
                  : '-'}
              </p>
            </div>

            <div>
              <p className="text-gray-400 dark:text-white/40 text-[10px] font-semibold uppercase tracking-wider mb-0.5 flex items-center gap-1">
                <MapPin className="w-3 h-3" /> Domicilio
              </p>
              <p className="text-gray-800 dark:text-white/90 text-[13px]">
                {profile?.addressText || '-'}
              </p>
            </div>

            <div>
              <p className="text-gray-400 dark:text-white/40 text-[10px] font-semibold uppercase tracking-wider mb-0.5 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" /> Registro / Último acceso
              </p>
              <p className="text-gray-800 dark:text-white/90 text-[13px]">
                {format(new Date(data.createdAt), 'dd/MM/yyyy', { locale: es })}
                {' • '}
                {data.lastLoginAt
                  ? format(new Date(data.lastLoginAt), 'dd/MM/yyyy HH:mm', { locale: es })
                  : 'Sin acceso'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Viajes totales</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                <AnimatedNumber value={stats?.totalTrips ?? 0} />
              </p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-champagne-gold flex items-center justify-center">
              <Car className="w-5 h-5" />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                Viajes completados
              </p>
              <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                <AnimatedNumber value={stats?.completedTrips ?? 0} />
              </p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                Viajes cancelados
              </p>
              <p className="text-2xl font-bold text-red-600 dark:text-red-400 mt-1">
                <AnimatedNumber value={stats?.cancelledTrips ?? 0} />
              </p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 flex items-center justify-center">
              <XCircle className="w-5 h-5" />
            </div>
          </div>
        </Card>
      </div>

      {/* Recent Trips */}
      <Card>
        <CardHeader>
          <CardTitle>Viajes recientes</CardTitle>
          <Badge variant="default">
            <AnimatedNumber value={recentTrips.length} /> mostrados
          </Badge>
        </CardHeader>

        {recentTrips.length === 0 ? (
          <div className="py-10 text-center text-sm text-gray-500 dark:text-gray-400">
            Este pasajero todavía no registra viajes.
          </div>
        ) : (
          <div className="overflow-x-auto -mx-5 px-5">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 dark:border-dark-border text-[10.5px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  <th className="py-2.5 pr-4">Fecha</th>
                  <th className="py-2.5 px-4">Origen</th>
                  <th className="py-2.5 px-4">Destino</th>
                  <th className="py-2.5 px-4">Estado</th>
                  <th className="py-2.5 pl-4 text-right">Monto</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-dark-border text-[12.5px]">
                {recentTrips.map((trip) => (
                  <tr
                    key={trip.id}
                    className="hover:bg-gray-50/50 dark:hover:bg-white/5 transition-colors"
                  >
                    <td className="py-3 pr-4 whitespace-nowrap text-gray-600 dark:text-gray-300">
                      {format(new Date(trip.createdAt), 'dd/MM/yyyy HH:mm', { locale: es })}
                    </td>
                    <td className="py-3 px-4 text-gray-900 dark:text-white max-w-xs truncate">
                      {trip.originAddress || '-'}
                    </td>
                    <td className="py-3 px-4 text-gray-900 dark:text-white max-w-xs truncate">
                      {trip.destinationAddress || '-'}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <Badge variant="default">{trip.status}</Badge>
                    </td>
                    <td className="py-3 pl-4 whitespace-nowrap text-right font-medium text-gray-900 dark:text-white">
                      {formatCurrency(trip.totalAmount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};

export default PassengerDetailScreen;
