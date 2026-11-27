import React from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowUpRight,
  Bus,
  CalendarClock,
  CreditCard,
  MapPinned,
  MessageCircle,
  Share2,
  Sparkles,
  Truck,
  Wrench,
} from 'lucide-react';
import { WHATSAPP_LINES, buildWhatsAppUrl } from '../constants/landingData';

export const ServicesBentoGrid: React.FC = () => {
  const primaryLine = WHATSAPP_LINES[0].number;

  return (
    <section id="servicios" className="py-20 sm:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Section Header */}
      <div className="max-w-3xl mb-12">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-widest bg-champagne-gold/15 text-champagne-gold border border-champagne-gold/30">
          <Sparkles className="w-3.5 h-3.5" /> Ecosistema de Movilidad
        </span>
        <h2 className="mt-3 text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white tracking-tight">
          Todo lo que mueve a Córdoba, resuelto sin fricción.
        </h2>
        <p className="mt-3 text-base text-gray-600 dark:text-gray-400 leading-relaxed">
          Desde un traslado ejecutivo inmediato con múltiples paradas hasta reservas programadas, seguimiento para invitados o logística especial coordinada con nuestra mesa operativa.
        </p>
      </div>

      {/* Asymmetric Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-6 lg:grid-cols-12 gap-5">
        {/* 1. Categoría Prioridad (Span 7 cols) */}
        <div className="md:col-span-6 lg:col-span-7 group relative rounded-3xl bg-obsidian text-white border border-gray-800 dark:border-white/10 p-7 sm:p-8 flex flex-col justify-between overflow-hidden shadow-xl">
          <div
            aria-hidden="true"
            className="absolute -right-12 -top-12 w-60 h-60 rounded-full bg-champagne-gold/10 blur-2xl group-hover:bg-champagne-gold/20 transition-all duration-500"
          />

          <div className="relative z-10">
            <div className="flex items-center justify-between gap-2 mb-4">
              <span className="px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-champagne-gold text-obsidian">
                Categoría Prioridad
              </span>
              <MapPinned className="w-5 h-5 text-champagne-gold" />
            </div>

            <h3 className="text-2xl font-bold text-white leading-snug">
              Viajes inmediatos con paradas múltiples y tarifa conocida antes de subir
            </h3>
            <p className="mt-2.5 text-sm text-gray-300 leading-relaxed max-w-xl">
              Cotizá tu recorrido punto a punto o sumá paradas intermedias en el mismo viaje. Seguimiento GPS real, chat integrado con el conductor y unidades seleccionadas en Córdoba Capital y Gran Córdoba.
            </p>
          </div>

          <div className="relative z-10 mt-8 pt-5 border-t border-white/10 grid grid-cols-3 gap-4 text-xs">
            <div>
              <span className="block text-champagne-gold font-bold">Paradas múltiples</span>
              <span className="text-gray-400">En una sola solicitud</span>
            </div>
            <div>
              <span className="block text-champagne-gold font-bold">Chat en vivo</span>
              <span className="text-gray-400">Directo en la app</span>
            </div>
            <div>
              <span className="block text-champagne-gold font-bold">Tarifa clara</span>
              <span className="text-gray-400">Fracción cada 110 m</span>
            </div>
          </div>
        </div>

        {/* 2. Viajes Reservados (Span 5 cols) */}
        <div className="md:col-span-6 lg:col-span-5 rounded-3xl bg-white dark:bg-dark-surface border border-gray-200/90 dark:border-white/10 p-7 sm:p-8 flex flex-col justify-between hover:border-champagne-gold/50 transition-all shadow-sm">
          <div>
            <div className="w-11 h-11 rounded-2xl bg-champagne-gold/15 text-champagne-gold flex items-center justify-center mb-5">
              <CalendarClock className="w-5 h-5" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              Viajes Reservados y Aeropuerto
            </h3>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
              Agendá tu traslado con fecha y hora exacta. Nuestra consola monitorea cada reserva con alertas previas y asignación anticipada de conductor para que nunca llegues tarde a un vuelo o reunión.
            </p>
          </div>

          <div className="mt-6 pt-4 border-t border-gray-100 dark:border-white/10 flex items-center justify-between text-xs">
            <span className="font-semibold text-gray-700 dark:text-gray-300">
              Pago anticipado o en efectivo
            </span>
            <a
              href={buildWhatsAppUrl(
                primaryLine,
                'Hola, quiero programar un viaje reservado con Transfer Black.',
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 font-bold text-champagne-gold hover:underline"
            >
              Reservar ahora <ArrowUpRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* 3. Viajes para Terceros / Modo Invitado (Span 4 cols) */}
        <div className="md:col-span-3 lg:col-span-4 rounded-3xl bg-white dark:bg-dark-surface border border-gray-200/90 dark:border-white/10 p-6 sm:p-7 flex flex-col justify-between hover:border-champagne-gold/50 transition-all shadow-sm">
          <div>
            <div className="w-11 h-11 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4">
              <Share2 className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              Viajes para Terceros (Modo Invitado)
            </h3>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
              Pedí un auto para un familiar, cliente o colaborador desde tu cuenta. El invitado recibe un link por WhatsApp y sigue el auto en vivo desde el navegador sin instalar la app.
            </p>
          </div>

          <div className="mt-6 pt-4 border-t border-gray-100 dark:border-white/10">
            <Link
              to="/track"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:underline"
            >
              Conocer visor de seguimiento (/track) <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* 4. Medios de Pago y Reembolso Automático (Span 4 cols) */}
        <div className="md:col-span-3 lg:col-span-4 rounded-3xl bg-white dark:bg-dark-surface border border-gray-200/90 dark:border-white/10 p-6 sm:p-7 flex flex-col justify-between hover:border-champagne-gold/50 transition-all shadow-sm">
          <div>
            <div className="w-11 h-11 rounded-2xl bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center mb-4">
              <CreditCard className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              Mercado Pago, Efectivo y Reembolso Rápido
            </h3>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
              Elegí cómo pagar antes de confirmar. Si abonás con Mercado Pago y cancelás dentro de los primeros 5 minutos, el reembolso se acredita automáticamente sin trámites.
            </p>
          </div>

          <div className="mt-6 pt-4 border-t border-gray-100 dark:border-white/10 flex flex-wrap gap-1.5">
            <span className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-gray-100 dark:bg-white/5 text-gray-700 dark:text-gray-300">
              Mercado Pago
            </span>
            <span className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-gray-100 dark:bg-white/5 text-gray-700 dark:text-gray-300">
              Efectivo
            </span>
            <span className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-champagne-gold/15 text-champagne-gold">
              Saldo Corporativo
            </span>
          </div>
        </div>

        {/* 5. Grúa, Colectivo y Flete por WhatsApp (Span 4 cols) */}
        <div className="md:col-span-6 lg:col-span-4 rounded-3xl bg-gradient-to-br from-obsidian to-[#17171C] text-white border border-champagne-gold/30 p-6 sm:p-7 flex flex-col justify-between shadow-lg">
          <div>
            <span className="text-[10.5px] font-bold uppercase tracking-widest text-champagne-gold">
              Logística & Auxilio Especial
            </span>
            <h3 className="mt-1.5 text-lg font-bold text-white">
              Grúa, Colectivos y Fletes en un toque
            </h3>
            <p className="mt-2 text-xs text-gray-300 leading-relaxed">
              Servicios especiales gestionados por nuestros operadores vía WhatsApp con cotización a medida:
            </p>

            <div className="mt-4 space-y-2">
              <a
                href={buildWhatsAppUrl(
                  primaryLine,
                  'Hola, quiero consultar por un servicio de Grúa desde Transfer Black.',
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs transition-colors"
              >
                <span className="flex items-center gap-2 font-semibold">
                  <Wrench className="w-3.5 h-3.5 text-champagne-gold" /> Auxilio y Grúa
                </span>
                <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
              </a>

              <a
                href={buildWhatsAppUrl(
                  primaryLine,
                  'Hola, quiero consultar por un servicio de Colectivo para grupo desde Transfer Black.',
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs transition-colors"
              >
                <span className="flex items-center gap-2 font-semibold">
                  <Bus className="w-3.5 h-3.5 text-champagne-gold" /> Colectivo / Eventos
                </span>
                <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
              </a>

              <a
                href={buildWhatsAppUrl(
                  primaryLine,
                  'Hola, quiero consultar por un servicio de Flete desde Transfer Black.',
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs transition-colors"
              >
                <span className="flex items-center gap-2 font-semibold">
                  <Truck className="w-3.5 h-3.5 text-champagne-gold" /> Fletes y Cargas
                </span>
                <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
