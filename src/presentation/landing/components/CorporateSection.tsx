import React, { useState } from 'react';
import {
  Briefcase,
  Building2,
  CheckCircle2,
  FileSpreadsheet,
  KeyRound,
  MessageCircle,
  Repeat,
  WalletCards,
} from 'lucide-react';
import { WHATSAPP_LINES, buildWhatsAppUrl } from '../constants/landingData';

export const CorporateSection: React.FC = () => {
  const [activeStep, setActiveStep] = useState<1 | 2>(1);
  const corporateLine = WHATSAPP_LINES[1].number;

  return (
    <section
      id="empresas"
      className="py-20 sm:py-24 bg-gray-100/70 dark:bg-[#0E0E12] border-y border-gray-200/80 dark:border-white/10 transition-colors"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          {/* Left Column: Value Proposition for Companies */}
          <div className="lg:col-span-7 space-y-6">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-widest bg-obsidian dark:bg-champagne-gold/15 text-champagne-gold border border-champagne-gold/30">
              <Building2 className="w-3.5 h-3.5" /> Transfer Black Empresas
            </span>

            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white tracking-tight leading-tight">
              Movilidad corporativa para tu equipo, sin rendiciones de tickets en papel.
            </h2>

            <p className="text-base text-gray-600 dark:text-gray-400 leading-relaxed">
              Centralizá los traslados de directivos, equipos comerciales y turnos operativos en una cuenta empresarial auditable en tiempo real, con centros de costo y traslados recurrentes.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-2xl bg-white dark:bg-dark-surface border border-gray-200/80 dark:border-white/10">
                <KeyRound className="w-5 h-5 text-champagne-gold mb-2" />
                <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                  Activación por PIN Corporativo
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
                  Tus colaboradores ingresan el PIN de tu empresa una sola vez en su app y viajan eligiendo "Modo Empresa".
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white dark:bg-dark-surface border border-gray-200/80 dark:border-white/10">
                <WalletCards className="w-5 h-5 text-champagne-gold mb-2" />
                <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                  Centros de Costo y Topes
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
                  Definí límites de gasto por colaborador o área, con saldo prepago o resumen de cuenta corriente mensual.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white dark:bg-dark-surface border border-gray-200/80 dark:border-white/10">
                <Repeat className="w-5 h-5 text-champagne-gold mb-2" />
                <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                  Traslados Recurrentes
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
                  Programá recorridos fijos semanales o diarios para tu personal con asignación prioritaria de flota.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white dark:bg-dark-surface border border-gray-200/80 dark:border-white/10">
                <FileSpreadsheet className="w-5 h-5 text-champagne-gold mb-2" />
                <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                  Reportes y Estados de Cuenta
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
                  Trazabilidad completa de cada viaje (pasajero, horario, ruta, centro de costo e importe exacto).
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <a
                href={buildWhatsAppUrl(
                  corporateLine,
                  'Hola, quiero registrar mi empresa en Transfer Black Empresas.',
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-obsidian dark:bg-champagne-gold text-white dark:text-obsidian text-sm font-bold hover:brightness-110 transition-all shadow-md"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Dar de alta mi empresa</span>
              </a>

              <span className="text-xs text-gray-500 dark:text-gray-400">
                Atención corporativa directa · Córdoba
              </span>
            </div>
          </div>

          {/* Right Column: Interactive 2-Step Employee PIN Experience */}
          <div className="lg:col-span-5">
            <div className="rounded-3xl bg-obsidian text-white border border-champagne-gold/35 p-6 sm:p-8 shadow-2xl">
              <div className="flex items-center justify-between gap-2 mb-5">
                <span className="text-xs font-bold uppercase tracking-wider text-champagne-gold">
                  Experiencia del Colaborador
                </span>
                <Briefcase className="w-4 h-4 text-champagne-gold" />
              </div>

              <h3 className="text-lg font-bold text-white mb-4">
                ¿Tu empresa ya opera con Transfer Black? Activalo en 2 pasos:
              </h3>

              {/* Step Selector */}
              <div className="grid grid-cols-2 gap-2 mb-5">
                <button
                  type="button"
                  onClick={() => setActiveStep(1)}
                  className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                    activeStep === 1
                      ? 'bg-champagne-gold text-obsidian border-champagne-gold'
                      : 'bg-white/5 text-gray-300 border-white/10 hover:bg-white/10'
                  }`}
                >
                  Paso 1 · Ingresar PIN
                </button>
                <button
                  type="button"
                  onClick={() => setActiveStep(2)}
                  className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                    activeStep === 2
                      ? 'bg-champagne-gold text-obsidian border-champagne-gold'
                      : 'bg-white/5 text-gray-300 border-white/10 hover:bg-white/10'
                  }`}
                >
                  Paso 2 · Modo Empresa
                </button>
              </div>

              {/* Simulated Mobile Screen Preview */}
              {activeStep === 1 ? (
                <div className="rounded-2xl bg-white/[0.04] border border-white/10 p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-gray-300">
                      Activar perfil empresa
                    </span>
                    <span className="text-[11px] text-champagne-gold font-mono">
                      Única vez
                    </span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-obsidian border border-champagne-gold/40 flex items-center justify-between">
                    <span className="font-mono text-base font-bold tracking-widest text-champagne-gold">
                      TB-CORP-2026
                    </span>
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-400">
                      <CheckCircle2 className="w-4 h-4" /> Vinculado
                    </span>
                  </div>

                  <p className="text-xs text-gray-300 leading-relaxed">
                    Pedí en tu trabajo tu <strong>PIN de identificación corporativa</strong>. Lo cargás una sola vez en la sección <em>Transfer Black Empresas</em> de la app y queda asociado a tu perfil.
                  </p>
                </div>
              ) : (
                <div className="rounded-2xl bg-white/[0.04] border border-white/10 p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-gray-300">
                      Medio de pago al viajar
                    </span>
                    <span className="text-[11px] text-emerald-400 font-semibold">
                      Sin efectivo
                    </span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-champagne-gold/15 border border-champagne-gold flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-white">Modo Empresa · Centro Operativo</p>
                      <p className="text-[11px] text-gray-300">Cargo directo a cuenta corporativa</p>
                    </div>
                    <CheckCircle2 className="w-5 h-5 text-champagne-gold shrink-0" />
                  </div>

                  <p className="text-xs text-gray-300 leading-relaxed">
                    Al solicitar o reservar tu viaje, elegís <strong>"Modo Empresa"</strong> como medio de pago antes de confirmar. El viaje se debita directamente del saldo o cuenta de tu organización.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
