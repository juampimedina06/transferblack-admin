import React from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Banknote,
  CalendarCheck2,
  Eye,
  Navigation,
  ShieldCheck,
  Wallet,
} from 'lucide-react';
import { APP_DOWNLOAD_LINKS } from '../constants/landingData';

export const DriversRecruitmentSection: React.FC = () => {
  return (
    <section
      id="conductores"
      className="py-20 sm:py-24 bg-obsidian text-white border-t border-white/10 relative overflow-hidden"
    >
      {/* Subtle Ambient Gold Gradient */}
      <div
        aria-hidden="true"
        className="absolute right-0 top-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-champagne-gold/10 blur-3xl pointer-events-none"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          {/* Left Column: Earnings Transparency Mockup Card */}
          <div className="lg:col-span-5 order-2 lg:order-1">
            <div className="rounded-3xl bg-[#141418] border border-white/15 p-6 sm:p-7 shadow-2xl space-y-5">
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <div>
                  <span className="text-[10.5px] font-bold uppercase tracking-widest text-champagne-gold">
                    Transfer Black Conductor
                  </span>
                  <h3 className="text-base font-bold text-white mt-0.5">
                    Resumen transparente por viaje
                  </h3>
                </div>
                <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                  100% Claro
                </span>
              </div>

              {/* Transparent Trip Breakdown Visual */}
              <div className="rounded-2xl bg-obsidian border border-white/10 p-4 space-y-3 text-xs">
                <div className="flex items-center justify-between text-gray-300">
                  <span>Tarifa total abonada por el pasajero</span>
                  <span className="font-mono font-semibold text-white">Visible al instante</span>
                </div>
                <div className="flex items-center justify-between text-gray-300">
                  <span>Comisión retenida por la empresa</span>
                  <span className="font-mono font-semibold text-champagne-gold">
                    Desglosada en cada viaje
                  </span>
                </div>
                <div className="pt-2.5 border-t border-white/10 flex items-center justify-between text-sm">
                  <span className="font-bold text-white">Tu ganancia neta acreditada</span>
                  <span className="font-bold text-emerald-400">Sin costos ocultos</span>
                </div>
              </div>

              {/* Payout Modes */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10">
                  <CalendarCheck2 className="w-4 h-4 text-champagne-gold mb-1.5" />
                  <p className="font-bold text-white">Liquidación Semanal</p>
                  <p className="text-[11px] text-gray-400 mt-0.5">
                    Acreditación automática en tu CBU, CVU o Alias registrado.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10">
                  <Banknote className="w-4 h-4 text-emerald-400 mb-1.5" />
                  <p className="font-bold text-white">Retiro Inmediato</p>
                  <p className="text-[11px] text-gray-400 mt-0.5">
                    Solicitá tu saldo disponible cuando lo necesites desde la billetera.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Driver Pitch & Benefits */}
          <div className="lg:col-span-7 order-1 lg:order-2 space-y-6">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-widest bg-champagne-gold/15 text-champagne-gold border border-champagne-gold/30">
              Para Conductores Profesionales
            </span>

            <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight leading-tight">
              Manejá con reglas claras, viajes corporativos y comisiones siempre visibles.
            </h2>

            <p className="text-base text-gray-300 leading-relaxed">
              En Transfer Black valoramos tu trabajo y tu vehículo. Sabés cuánto ganás en cada trayecto, accedés a pasajeros verificados y contás con una oficina real en Córdoba que te respalda.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-champagne-gold/15 text-champagne-gold flex items-center justify-center shrink-0 mt-0.5">
                  <Eye className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">
                    Comisiones siempre transparentes
                  </h4>
                  <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                    En cada viaje ves exactamente qué comisión lleva la empresa y cuál es tu ganancia neta, sin descuentos sorpresa.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-champagne-gold/15 text-champagne-gold flex items-center justify-center shrink-0 mt-0.5">
                  <Wallet className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">
                    Billetera clara y retiros a tu banco
                  </h4>
                  <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                    Seguí tus ganancias del día, viajes en efectivo y transferencias directas a tu CBU, CVU o Alias.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-champagne-gold/15 text-champagne-gold flex items-center justify-center shrink-0 mt-0.5">
                  <Navigation className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">
                    Navegación giro a giro integrada
                  </h4>
                  <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                    Recibí ofertas de viaje, reservas de aeropuerto y traslados corporativos sin salir de la aplicación.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-champagne-gold/15 text-champagne-gold flex items-center justify-center shrink-0 mt-0.5">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">
                    Política justa de cancelación
                  </h4>
                  <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                    Sin penalizaciones tras 5 minutos de cortesía en el punto de retiro o ante exceso de pasajeros/equipaje.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4 pt-3">
              <a
                href={APP_DOWNLOAD_LINKS.driverAndroidUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-champagne-gold text-obsidian text-sm font-bold hover:brightness-110 transition-all shadow-lg"
              >
                <span>Postularme en App Conductor</span>
                <ArrowRight className="w-4 h-4" />
              </a>

              <Link
                to="/terminos-conductores"
                className="text-xs font-semibold text-gray-300 hover:text-champagne-gold underline underline-offset-4 transition-colors"
              >
                Ver requisitos y términos para conductores
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
