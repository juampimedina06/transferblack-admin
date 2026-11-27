import React, { useEffect } from 'react';
import { CheckCircle2, ShieldCheck, Sparkles } from 'lucide-react';
import { useLandingStats } from '../auth/hooks/useLandingStats';
import { LandingNavbar } from './components/LandingNavbar';
import { HeroActionWidget } from './components/HeroActionWidget';
import { HeroLivePreview } from './components/HeroLivePreview';
import { ServicesBentoGrid } from './components/ServicesBentoGrid';
import { CorporateSection } from './components/CorporateSection';
import { SafetyVaultSection } from './components/SafetyVaultSection';
import { DriversRecruitmentSection } from './components/DriversRecruitmentSection';
import { FaqSection } from './components/FaqSection';
import { LandingFooter } from './components/LandingFooter';
import { PassengerAppFloatingDock } from './components/PassengerAppFloatingDock';

export const LandingScreen: React.FC = () => {
  const { data: landingStats } = useLandingStats();

  useEffect(() => {
    document.title = 'Transfer Black · Movilidad Ejecutiva y Corporativa en Córdoba';
  }, []);

  return (
    <div className="min-h-screen bg-[#FAFAFA] dark:bg-obsidian text-gray-900 dark:text-white font-montserrat transition-colors selection:bg-champagne-gold selection:text-obsidian">
      <LandingNavbar />

      <main>
        {/* HERO SECTION (Uber-Inspired Functional Utility + Live Telemetry) */}
        <section
          id="viajar"
          className="relative pt-10 pb-20 sm:pt-16 sm:pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto"
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            {/* Left Column: Headline + Action Widget */}
            <div className="lg:col-span-6 space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-obsidian dark:bg-white/5 text-champagne-gold border border-champagne-gold/30 text-xs font-bold tracking-wider uppercase">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Movilidad Ejecutiva y Corporativa · Córdoba</span>
              </div>

              <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-gray-900 dark:text-white leading-[1.12]">
                Movete con prioridad.{' '}
                <span className="text-champagne-gold">Viajá con estándar ejecutivo.</span>
              </h1>

              <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
                Traslados inmediatos, reservas al aeropuerto, cuentas corporativas por PIN y logística especial con conductores entrevistados presencialmente en Córdoba.
              </p>

              {/* Functional Hero Widget */}
              <HeroActionWidget />

              {/* Trust Micro-bar */}
              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 pt-1 text-xs text-gray-600 dark:text-gray-400">
                <span className="inline-flex items-center gap-1.5 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  Conductores entrevistados en persona
                </span>
                <span className="inline-flex items-center gap-1.5 font-medium">
                  <ShieldCheck className="w-4 h-4 text-champagne-gold" />
                  Cumplimiento Ordenanza 13.549
                </span>
              </div>
            </div>

            {/* Right Column: Live Cordoba Telemetry Preview + Animated KPIs */}
            <div className="lg:col-span-6">
              <HeroLivePreview stats={landingStats} />
            </div>
          </div>
        </section>

        {/* BENTO GRID: Ecosystem of Services */}
        <ServicesBentoGrid />

        {/* CORPORATE SECTION: Transfer Black Empresas */}
        <CorporateSection />

        {/* SAFETY VAULT: 7-Point Verification & In-Person Interview */}
        <SafetyVaultSection />

        {/* DRIVERS RECRUITMENT: Transparent Commissions & Payouts */}
        <DriversRecruitmentSection />

        {/* FAQ ACCORDION */}
        <FaqSection />
      </main>

      {/* MEGA FOOTER */}
      <LandingFooter />

      {/* PERSISTENT FLOATING QR & DOWNLOAD DOCK (Bottom-Right) */}
      <PassengerAppFloatingDock />
    </div>
  );
};

export default LandingScreen;
