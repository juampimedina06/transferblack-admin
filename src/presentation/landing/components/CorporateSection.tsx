import React, { useState } from 'react';
import { ArrowUpRight, CheckCircle2, MessageCircle } from 'lucide-react';
import corporateBackseatImg from '../../../assets/landing/corporate-backseat.jpg';
import { WHATSAPP_LINES, buildWhatsAppUrl } from '../constants/landingData';
import { RevealOnScroll, ShinyText } from './motion/ReactBitsPrimitives';

const CORPORATE_CAPABILITIES = [
  {
    title: 'Activación en 1 paso con PIN Corporativo',
    desc: 'Cada colaborador ingresa el PIN de tu empresa una sola vez en su app y selecciona "Modo Empresa" al viajar.',
  },
  {
    title: 'Centros de Costo y Topes por Área',
    desc: 'Definí límites por usuario o equipo con saldo prepago o cuenta corriente auditable en tiempo real.',
  },
  {
    title: 'Traslados Recurrentes Programados',
    desc: 'Rutas fijas diarias o semanales para turnos de personal y directivos con flota asignada.',
  },
  {
    title: 'Estados de Cuenta sin Rendiciones en Papel',
    desc: 'Detalle completo de cada traslado (pasajero, fecha, origen, destino, centro de costo e importe).',
  },
] as const;

export const CorporateSection: React.FC = () => {
  const [activeStep, setActiveStep] = useState<1 | 2>(1);
  const corporateLine = WHATSAPP_LINES[1].number;

  return (
    <section
      id="empresas"
      className="relative bg-gray-100/70 dark:bg-[#0D0D11] border-y border-gray-200 dark:border-white/10 overflow-hidden transition-colors"
    >
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 items-stretch">
        {/* Left Column: Full-Height Editorial Photography + Floating PIN Switcher */}
        <div className="lg:col-span-6 relative min-h-[420px] lg:min-h-[680px] overflow-hidden bg-obsidian">
          <img
            src={corporateBackseatImg}
            alt="Ejecutivo trabajando en el asiento trasero de un vehículo Transfer Black Empresas"
            loading="lazy"
            width={1200}
            height={900}
            className="absolute inset-0 w-full h-full object-cover object-center scale-[1.01] transition-transform duration-700 hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-obsidian via-obsidian/45 to-obsidian/15" />

          {/* Floating Interactive 2-Step PIN Experience over Photo */}
          <div className="absolute bottom-6 left-6 right-6 sm:bottom-8 sm:left-8 sm:right-8 backdrop-blur-xl bg-obsidian/80 border border-white/15 rounded-2xl p-5 text-white shadow-2xl">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
              <span className="text-[10.5px] font-bold uppercase tracking-[0.2em] text-champagne-gold">
                Experiencia del Colaborador
              </span>
              <div className="inline-flex rounded-full bg-white/10 p-0.5 text-[11px] font-bold">
                <button
                  type="button"
                  onClick={() => setActiveStep(1)}
                  className={`px-3 py-1 rounded-full transition-colors cursor-pointer ${
                    activeStep === 1 ? 'bg-champagne-gold text-obsidian' : 'text-gray-300'
                  }`}
                >
                  1. Ingresar PIN
                </button>
                <button
                  type="button"
                  onClick={() => setActiveStep(2)}
                  className={`px-3 py-1 rounded-full transition-colors cursor-pointer ${
                    activeStep === 2 ? 'bg-champagne-gold text-obsidian' : 'text-gray-300'
                  }`}
                >
                  2. Modo Empresa
                </button>
              </div>
            </div>

            {activeStep === 1 ? (
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-bold text-white">Vinculación única con PIN corporativo</p>
                  <p className="text-xs text-gray-300 mt-1">
                    Ingresá el código de tu organización una sola vez y queda guardado en tu cuenta.
                  </p>
                </div>
                <span className="hidden sm:inline-flex items-center gap-1.5 font-mono text-xs font-bold px-3 py-1.5 rounded-lg bg-champagne-gold/15 text-champagne-gold border border-champagne-gold/40 shrink-0">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  PIN ACTIVO
                </span>
              </div>
            ) : (
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-bold text-white">Viajá sin adelantar dinero</p>
                  <p className="text-xs text-gray-300 mt-1">
                    Al pedir o reservar tu traslado, elegís "Modo Empresa" y se imputa directo a tu centro de costo.
                  </p>
                </div>
                <span className="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shrink-0">
                  Cargo a empresa
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Open Editorial Copy & Hairline List */}
        <div className="lg:col-span-6 px-6 py-16 sm:px-12 lg:px-16 lg:py-24 flex flex-col justify-center">
          <RevealOnScroll className="space-y-6">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-champagne-gold">
              <ShinyText>Transfer Black Empresas</ShinyText>
            </p>

            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white tracking-tight leading-[1.15]">
              Movilidad corporativa con control total para finanzas y RRHH.
            </h2>

            <p className="text-base text-gray-600 dark:text-gray-400 leading-relaxed">
              Reemplazá tickets sueltos y reintegros manuales por una plataforma pensada para empresas de Córdoba.
            </p>

            <ul className="divide-y divide-gray-200 dark:divide-white/10 pt-2">
              {CORPORATE_CAPABILITIES.map((cap) => (
                <li key={cap.title} className="py-4 first:pt-2 last:pb-2">
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-champagne-gold shrink-0" />
                    {cap.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1 pl-3.5 leading-relaxed">
                    {cap.desc}
                  </p>
                </li>
              ))}
            </ul>

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
