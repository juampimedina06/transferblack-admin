import React from 'react';
import { ArrowUpRight, MessageCircle } from 'lucide-react';
import corporateBackseatImg from '../../../assets/landing/corporate-backseat.jpg';
import { WHATSAPP_LINES, buildWhatsAppUrl } from '../constants/landingData';
import { RevealOnScroll, ShinyText } from './motion/ReactBitsPrimitives';

const CORPORATE_CAPABILITIES = [
  {
    step: '01',
    title: 'Activación única con PIN Corporativo',
    desc: 'Cada colaborador carga el PIN de tu organización una sola vez en su app y queda vinculado automáticamente.',
  },
  {
    step: '02',
    title: 'Viajá eligiendo "Modo Empresa"',
    desc: 'Al pedir o reservar un traslado, se imputa directo al centro de costo asignado sin adelantar dinero.',
  },
  {
    step: '03',
    title: 'Traslados recurrentes y topes por área',
    desc: 'Programá rutas fijas diarias o semanales para tu equipo y controlá límites de consumo en tiempo real.',
  },
  {
    step: '04',
    title: 'Estados de cuenta auditables',
    desc: 'Trazabilidad completa de cada viaje (pasajero, fecha, ruta, centro de costo e importe) sin tickets en papel.',
  },
] as const;

export const CorporateSection: React.FC = () => {
  const corporateLine = WHATSAPP_LINES[1].number;

  return (
    <section
      id="empresas"
      className="relative bg-gray-100/70 dark:bg-[#0D0D11] border-y border-gray-200 dark:border-white/10 overflow-hidden transition-colors"
    >
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 items-stretch">
        {/* Left Column: Clean Full-Bleed Editorial Photography (no boxed overlays) */}
        <div className="lg:col-span-6 relative min-h-[380px] lg:min-h-[680px] overflow-hidden bg-obsidian">
          <img
            src={corporateBackseatImg}
            alt="Ejecutivo trabajando en el asiento trasero de un vehículo Transfer Black Empresas"
            loading="lazy"
            width={1200}
            height={900}
            className="absolute inset-0 w-full h-full object-cover object-center scale-[1.01] transition-transform duration-700 hover:scale-105"
          />
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-t from-obsidian/80 via-transparent to-obsidian/15"
          />

          {/* Minimal Editorial Signature Caption */}
          <div className="absolute bottom-7 left-7 right-7 border-l-2 border-champagne-gold pl-4 text-white">
            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-champagne-gold">
              Transfer Black Empresas
            </p>
            <p className="text-sm text-gray-200 mt-1 max-w-sm">
              Traslados corporativos con trazabilidad completa y cero rendiciones manuales.
            </p>
          </div>
        </div>

        {/* Right Column: Open Editorial Flow */}
        <div className="lg:col-span-6 px-6 py-16 sm:px-12 lg:px-16 lg:py-24 flex flex-col justify-center">
          <RevealOnScroll className="space-y-6">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-champagne-gold">
              <ShinyText>Transfer Black Empresas</ShinyText>
            </p>

            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white tracking-tight leading-[1.15]">
              Movilidad corporativa con control total para finanzas y RRHH.
            </h2>

            <p className="text-base text-gray-600 dark:text-gray-400 leading-relaxed">
              Reemplazá tickets sueltos y reintegros manuales por una cuenta empresarial pensada para equipos de Córdoba.
            </p>

            <ol className="divide-y divide-gray-200 dark:divide-white/10 pt-2">
              {CORPORATE_CAPABILITIES.map((cap) => (
                <li key={cap.step} className="py-4 first:pt-2 last:pb-2 flex items-baseline gap-4">
                  <span className="font-mono text-xs font-bold text-champagne-gold shrink-0">
                    {cap.step}
                  </span>
                  <div>
                    <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                      {cap.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1 leading-relaxed">
                      {cap.desc}
                    </p>
                  </div>
                </li>
              ))}
            </ol>

            <div className="pt-4 flex flex-wrap items-center gap-4">
              <a
                href={buildWhatsAppUrl(
                  corporateLine,
                  'Hola, quiero registrar mi empresa en Transfer Black Empresas.',
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-obsidian dark:bg-champagne-gold text-white dark:text-obsidian text-sm font-bold hover:brightness-110 transition-all shadow-lg"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Registrar mi empresa</span>
                <ArrowUpRight className="w-4 h-4" />
              </a>

              <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                Alta asistida en el día · Línea {WHATSAPP_LINES[1].displayPhone}
              </span>
            </div>
          </RevealOnScroll>
        </div>
      </div>
    </section>
  );
};
