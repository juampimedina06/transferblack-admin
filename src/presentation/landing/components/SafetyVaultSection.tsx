import React, { useState } from 'react';
import { ChevronRight, Clock, Radio, ShieldAlert } from 'lucide-react';
import safetyChauffeurImg from '../../../assets/landing/safety-chauffeur.jpg';
import { SAFETY_SEVEN_POINTS } from '../constants/landingData';
import { RevealOnScroll, ShinyText } from './motion/ReactBitsPrimitives';

export const SafetyVaultSection: React.FC = () => {
  const [selectedId, setSelectedId] = useState<string>(
    SAFETY_SEVEN_POINTS[SAFETY_SEVEN_POINTS.length - 1].id,
  );

  return (
    <section id="seguridad" className="py-24 sm:py-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
        {/* Left Column: Editorial Headline + Chauffeur Portrait Photography */}
        <RevealOnScroll className="lg:col-span-5 lg:sticky lg:top-28 space-y-6">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-champagne-gold">
            <ShinyText>Estándar de Seguridad Córdoba</ShinyText>
          </p>

          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white tracking-tight leading-[1.15]">
            Ningún conductor se activa sin aprobar 7 validaciones y una entrevista presencial.
          </h2>

          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 leading-relaxed">
            No delegamos la seguridad a un formulario automático. Auditamos cada documento y conocemos en persona a cada conductor en nuestra oficina de Córdoba.
          </p>

          {/* Clean Editorial Portrait with Minimal Signature */}
          <div className="relative rounded-2xl overflow-hidden aspect-[4/3] bg-obsidian shadow-2xl">
            <img
              src={safetyChauffeurImg}
              alt="Conductor profesional habilitado de Transfer Black junto a su vehículo"
              loading="lazy"
              width={1200}
              height={900}
              className="w-full h-full object-cover object-center"
            />
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-gradient-to-t from-obsidian/80 via-transparent to-transparent"
            />
            <div className="absolute bottom-5 left-5 right-5 border-l-2 border-champagne-gold pl-3.5 text-white">
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-champagne-gold">
                Entrevista Presencial · Oficina Córdoba
              </p>
              <p className="text-xs text-gray-200 mt-0.5">
                Validación personal y documental antes de habilitar cada unidad.
              </p>
            </div>
          </div>

          {/* 3 In-Route Operational Safeguards (Open hairline strip, no cards) */}
          <div className="pt-2 space-y-3 border-t border-gray-200 dark:border-white/10 text-xs">
            <div className="flex items-start gap-3 pt-2">
              <Clock className="w-4 h-4 text-champagne-gold shrink-0 mt-0.5" />
              <p className="text-gray-600 dark:text-gray-300">
                <strong className="text-gray-900 dark:text-white">Ordenanza 13.549:</strong> control automático de horas máximas de conducción continua para prevenir fatiga.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <ShieldAlert className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <p className="text-gray-600 dark:text-gray-300">
                <strong className="text-gray-900 dark:text-white">Botón SOS y Red de Alerta:</strong> enlace directo al 911, alerta a flota cercana y monitoreo en vivo.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <Radio className="w-4 h-4 text-sky-500 shrink-0 mt-0.5" />
              <p className="text-gray-600 dark:text-gray-300">
                <strong className="text-gray-900 dark:text-white">Control diario de vencimientos:</strong> pausa automática del despacho si vence una póliza o licencia.
              </p>
            </div>
          </div>
        </RevealOnScroll>

        {/* Right Column: Clean Interactive 7-Point Editorial Accordion List (NOT boxed cards) */}
        <div className="lg:col-span-7 divide-y divide-gray-200 dark:divide-white/10 border-y border-gray-200 dark:border-white/10">
          {SAFETY_SEVEN_POINTS.map((item) => {
            const isSelected = item.id === selectedId;
            return (
              <div key={item.id} className="transition-colors">
                <button
                  type="button"
                  aria-expanded={isSelected}
                  onClick={() => setSelectedId(item.id)}
                  className="w-full py-6 px-2 flex items-center justify-between gap-4 text-left cursor-pointer group"
                >
                  <div className="flex items-baseline gap-4 sm:gap-6 min-w-0">
                    <span
                      className={`font-mono text-sm font-bold shrink-0 transition-colors ${
                        isSelected
                          ? 'text-champagne-gold'
                          : 'text-gray-400 dark:text-gray-500 group-hover:text-champagne-gold'
                      }`}
                    >
                      {item.number}
                    </span>
                    <div className="min-w-0">
                      <h3
                        className={`text-base sm:text-lg font-bold transition-colors ${
                          isSelected
                            ? 'text-gray-900 dark:text-champagne-gold'
                            : 'text-gray-900 dark:text-white group-hover:text-champagne-gold'
                        }`}
                      >
                        {item.title}
                      </h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        {item.subtitle}
                      </p>
                    </div>
                  </div>

                  <ChevronRight
                    className={`w-5 h-5 shrink-0 transition-transform duration-200 ${
                      isSelected
                        ? 'rotate-90 text-champagne-gold'
                        : 'text-gray-400 group-hover:text-champagne-gold'
                    }`}
                  />
                </button>

                {isSelected && (
                  <div className="pb-6 pl-10 sm:pl-14 pr-4 text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                    <p>{item.detail}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
