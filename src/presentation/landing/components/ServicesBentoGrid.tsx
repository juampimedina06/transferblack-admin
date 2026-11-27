import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, MessageCircle } from 'lucide-react';
import serviceTowImg from '../../../assets/landing/service-tow.jpg';
import serviceBusImg from '../../../assets/landing/service-bus.jpg';
import serviceFreightImg from '../../../assets/landing/service-freight.jpg';
import { WHATSAPP_LINES, buildWhatsAppUrl } from '../constants/landingData';
import { RevealOnScroll, ShinyText, SpotlightSurface } from './motion/ReactBitsPrimitives';

const EDITORIAL_PILLARS = [
  {
    number: '01',
    tag: 'Categoría Prioridad',
    title: 'Viajes inmediatos con paradas múltiples y tarifa conocida antes de subir',
    description:
      'Cotizá tu recorrido punto a punto o agregá paradas intermedias en la misma solicitud. Seguimiento satelital real, chat en vivo con el conductor y tarifa transparente por fracción cada 110 m.',
    meta: ['Paradas múltiples', 'Chat en vivo', 'Diurna y nocturna clara'],
  },
  {
    number: '02',
    tag: 'Reservas Programadas',
    title: 'Aeropuerto, congresos y agenda crítica sin margen de demora',
    description:
      'Agendá con fecha y hora exacta. Nuestra central monitorea cada reserva con alertas previas y chofer pre-asignado, con opción de pago anticipado o en efectivo.',
    meta: ['Asignación anticipada', 'Alertas en central', 'Aeropuerto Taravella'],
  },
  {
    number: '03',
    tag: 'Modo Invitado (/track)',
    title: 'Pedí un auto para un familiar o cliente y compartile el mapa en vivo',
    description:
      'Solicitá el traslado desde tu cuenta para un tercero. El invitado recibe un enlace por WhatsApp y sigue el vehículo en tiempo real desde cualquier navegador sin instalar la app.',
    meta: ['Sin bajar la app', 'Patente y chofer visibles', 'Link compartible'],
    linkTo: '/track',
    linkLabel: 'Abrir visor de seguimiento',
  },
  {
    number: '04',
    tag: 'Pagos & Reembolso Automático',
    title: 'Mercado Pago, Efectivo o Saldo Corporativo con cancelación justa',
    description:
      'Elegí cómo pagar antes de confirmar. Si abonás con Mercado Pago y cancelás dentro de los primeros 5 minutos antes del arribo, el reembolso se acredita automáticamente.',
    meta: ['Mercado Pago', 'Efectivo', 'Modo Empresa'],
  },
] as const;

export const ServicesBentoGrid: React.FC = () => {
  const primaryLine = WHATSAPP_LINES[0].number;

  return (
    <section id="servicios" className="py-24 sm:py-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Editorial Section Intro (Open layout, no card wrapper) */}
      <RevealOnScroll className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end pb-14 border-b border-gray-200 dark:border-white/10">
        <div className="lg:col-span-7">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-champagne-gold mb-3">
            <ShinyText>Ecosistema de Movilidad</ShinyText>
          </p>
          <h2 className="text-3xl sm:text-5xl font-bold text-gray-900 dark:text-white tracking-tight leading-[1.1]">
            Todo lo que mueve a Córdoba, sin fricción.
          </h2>
        </div>
        <div className="lg:col-span-5">
          <p className="text-base text-gray-600 dark:text-gray-400 leading-relaxed">
            Combinamos la inmediatez de una aplicación moderna con el respaldo real de una mesa operativa local en Córdoba. Sin bots infinitos ni tarifas opacas.
          </p>
        </div>
      </RevealOnScroll>

      {/* Open Hairline Editorial Rows (NOT boxed cards) */}
      <div className="divide-y divide-gray-200 dark:divide-white/10">
        {EDITORIAL_PILLARS.map((pillar, index) => (
          <RevealOnScroll key={pillar.number} delayMs={index * 60}>
            <SpotlightSurface className="py-10 sm:py-12 px-2 sm:px-4 transition-colors hover:bg-gray-100/50 dark:hover:bg-white/[0.02]">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                <div className="lg:col-span-2 flex items-center lg:flex-col lg:items-start gap-3">
                  <span className="font-mono text-2xl sm:text-3xl font-bold text-champagne-gold">
                    {pillar.number}
                  </span>
                  <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-gray-500 dark:text-gray-400">
                    {pillar.tag}
                  </span>
                </div>

                <div className="lg:col-span-5">
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white leading-snug">
                    {pillar.title}
                  </h3>
                </div>

                <div className="lg:col-span-5 space-y-4">
                  <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 leading-relaxed">
                    {pillar.description}
                  </p>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-semibold text-gray-700 dark:text-gray-300">
                    {pillar.meta.map((tag) => (
                      <span key={tag} className="inline-flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-champagne-gold" />
                        {tag}
                      </span>
                    ))}
                  </div>

                  {'linkTo' in pillar && pillar.linkTo && (
                    <Link
                      to={pillar.linkTo}
                      className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-champagne-gold hover:underline pt-1"
                    >
                      {pillar.linkLabel} <ArrowUpRight className="w-3.5 h-3.5" />
                    </Link>
                  )}
                </div>
              </div>
            </SpotlightSurface>
          </RevealOnScroll>
        ))}
      </div>

      {/* 3 Clickable Photographic Special Logistics Tiles (Grúa, Colectivo, Flete) */}
      <RevealOnScroll className="mt-16 pt-14 border-t border-gray-200 dark:border-white/10 space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="max-w-2xl">
            <span className="text-[11px] font-bold uppercase tracking-[0.22em] text-champagne-gold">
              Logística & Auxilio Especial por WhatsApp
            </span>
            <h3 className="mt-2 text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
              ¿Necesitás Grúa, Colectivo para eventos o Flete?
            </h3>
            <p className="mt-1.5 text-sm text-gray-600 dark:text-gray-400">
              Elegí el servicio para iniciar la coordinación directa por WhatsApp con nuestra mesa operativa en Córdoba.
            </p>
          </div>
          <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 shrink-0">
            Tocá cualquier servicio para cotizar
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {[
            {
              id: 'tow',
              tag: 'Auxilio 24/7',
              title: 'Grúa y Traslado Vehicular',
              subtitle: 'Asistencia rápida en Córdoba Capital y rutas cercanas.',
              image: serviceTowImg,
              alt: 'Camión grúa de auxilio vehicular de Transfer Black al atardecer',
              waText: 'Hola, quiero consultar por un servicio de Grúa desde Transfer Black.',
            },
            {
              id: 'bus',
              tag: 'Grupos y Eventos',
              title: 'Colectivos y Contingentes',
              subtitle: 'Unidades ejecutivas para congresos, eventos y traslados grupales.',
              image: serviceBusImg,
              alt: 'Colectivo ejecutivo de Transfer Black para traslado de grupos y eventos',
              waText: 'Hola, quiero consultar por un servicio de Colectivo para grupo desde Transfer Black.',
            },
            {
              id: 'freight',
              tag: 'Logística Urbana',
              title: 'Fletes y Cargas',
              subtitle: 'Transporte cuidado de equipamiento empresarial y mudanzas puntuales.',
              image: serviceFreightImg,
              alt: 'Vehículo utilitario para fletes y logística urbana de Transfer Black',
              waText: 'Hola, quiero consultar por un servicio de Flete desde Transfer Black.',
            },
          ].map((item) => (
            <a
              key={item.id}
              href={buildWhatsAppUrl(primaryLine, item.waText)}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative block aspect-[16/11] rounded-2xl overflow-hidden bg-obsidian focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-champagne-gold shadow-lg"
            >
              <img
                src={item.image}
                alt={item.alt}
                loading="lazy"
                width={960}
                height={660}
                className="absolute inset-0 w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
              />
              <div
                aria-hidden="true"
                className="absolute inset-0 bg-gradient-to-t from-obsidian/92 via-obsidian/35 to-obsidian/10 transition-opacity duration-300 group-hover:from-obsidian/95"
              />

              {/* Top-right subtle WhatsApp/Action cue */}
              <div className="absolute top-4 right-4 w-9 h-9 rounded-full bg-obsidian/70 backdrop-blur-md border border-white/15 text-white flex items-center justify-center transition-all duration-300 group-hover:bg-champagne-gold group-hover:text-obsidian group-hover:border-champagne-gold">
                <ArrowUpRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </div>

              {/* Bottom editorial caption */}
              <div className="absolute bottom-5 left-5 right-5 border-l-2 border-champagne-gold pl-3.5 text-white">
                <span className="block text-[10px] font-bold uppercase tracking-[0.2em] text-champagne-gold">
                  {item.tag}
                </span>
                <h4 className="text-lg font-bold text-white leading-snug mt-0.5">
                  {item.title}
                </h4>
                <p className="text-xs text-gray-300 mt-1 line-clamp-2 leading-relaxed">
                  {item.subtitle}
                </p>
                <span className="mt-2.5 inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-400">
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>Cotizar por WhatsApp</span>
                </span>
              </div>
            </a>
          ))}
        </div>
      </RevealOnScroll>
    </section>
  );
};
