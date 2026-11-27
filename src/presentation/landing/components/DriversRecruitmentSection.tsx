import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import driverCockpitImg from '../../../assets/landing/driver-cockpit.jpg';
import { APP_DOWNLOAD_LINKS } from '../constants/landingData';
import { RevealOnScroll, ShinyText } from './motion/ReactBitsPrimitives';

const DRIVER_PILLARS = [
  {
    step: '01',
    title: 'Comisiones siempre transparentes en cada viaje',
    desc: 'Al finalizar cada traslado ves con claridad la tarifa abonada por el pasajero, la comisión exacta que retiene la empresa y tu ganancia neta, sin descuentos sorpresa.',
  },
  {
    step: '02',
    title: 'Liquidación semanal o retiro inmediato a tu CBU / Alias',
    desc: 'Elegí cobrar automáticamente cada semana o solicitar tu saldo disponible cuando lo necesites directamente desde la billetera.',
  },
  {
    step: '03',
    title: 'Navegación giro a giro y viajes corporativos',
    desc: 'Accedé a pasajeros verificados, reservas al aeropuerto y traslados recurrentes con navegación integrada en la app.',
  },
  {
    step: '04',
    title: 'Política justa de cancelación y respaldo local',
    desc: 'Sin penalizaciones tras 5 minutos de cortesía en el punto de retiro, con oficina y mesa operativa real en Córdoba.',
  },
] as const;

export const DriversRecruitmentSection: React.FC = () => {
  return (
    <section
      id="conductores"
      className="relative bg-obsidian text-white border-t border-white/10 overflow-hidden"
    >
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 items-stretch">
        {/* Left Column: Open Editorial Driver Pitch */}
        <div className="lg:col-span-6 px-6 py-20 sm:px-12 lg:px-16 lg:py-24 flex flex-col justify-center order-2 lg:order-1">
          <RevealOnScroll className="space-y-6">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-champagne-gold">
              <ShinyText>Para Conductores Profesionales</ShinyText>
            </p>

            <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight leading-[1.15]">
              Manejá con reglas claras y comisiones siempre visibles.
            </h2>

            <p className="text-base text-gray-300 leading-relaxed">
              En Transfer Black cuidamos a quienes trabajan todos los días en la calle: transparencia total en cada liquidación, pasajeros verificados y soporte humano en Córdoba.
            </p>

            <ol className="divide-y divide-white/10 pt-2">
              {DRIVER_PILLARS.map((item) => (
                <li key={item.step} className="py-4 first:pt-2 last:pb-2 flex items-baseline gap-4">
                  <span className="font-mono text-xs font-bold text-champagne-gold shrink-0">
                    {item.step}
                  </span>
                  <div>
                    <h3 className="text-sm font-bold text-white">{item.title}</h3>
                    <p className="text-xs sm:text-sm text-gray-400 mt-1 leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                </li>
              ))}
            </ol>

            <div className="pt-4 flex flex-wrap items-center gap-5">
              <a
                href={APP_DOWNLOAD_LINKS.driverAndroidUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-champagne-gold text-obsidian text-sm font-bold hover:brightness-110 transition-all shadow-[0_0_28px_rgba(212,175,55,0.28)]"
              >
                <span>Postularme en App Conductor</span>
                <ArrowUpRight className="w-4 h-4" />
              </a>

              <Link
                to="/terminos-conductores"
                className="text-xs font-semibold text-gray-300 hover:text-champagne-gold underline underline-offset-4 transition-colors"
              >
                Requisitos y términos de conductores
              </Link>
            </div>
          </RevealOnScroll>
        </div>

        {/* Right Column: Clean Full-Bleed Cockpit Photography (no boxed overlay) */}
        <div className="lg:col-span-6 relative min-h-[380px] lg:min-h-[680px] overflow-hidden order-1 lg:order-2">
          <img
            src={driverCockpitImg}
            alt="Vista desde el interior de un vehículo ejecutivo Transfer Black conduciendo al atardecer"
            loading="lazy"
            width={1200}
            height={900}
            className="absolute inset-0 w-full h-full object-cover object-center scale-[1.01] transition-transform duration-700 hover:scale-105"
          />
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-t from-obsidian/80 via-transparent to-obsidian/15 lg:bg-gradient-to-r lg:from-obsidian/65 lg:via-transparent lg:to-transparent"
          />

          {/* Minimal Editorial Signature Caption */}
          <div className="absolute bottom-7 left-7 right-7 border-l-2 border-champagne-gold pl-4 text-white">
            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-champagne-gold">
              Transfer Black Conductor
            </p>
            <p className="text-sm text-gray-200 mt-1 max-w-sm">
              Desglose exacto de tarifa, comisión de la empresa y ganancia neta en cada viaje.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
