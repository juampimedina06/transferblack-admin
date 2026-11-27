import React, { useEffect, useState } from 'react';
import { CheckCircle2, ShieldCheck } from 'lucide-react';
import heroSedanImg from '../../assets/landing/hero-sedan.jpg';
import { useLandingStats } from '../auth/hooks/useLandingStats';
import { AnimatedNumber } from '../components/common/AnimatedNumber';
import { LandingNavbar } from './components/LandingNavbar';
import { HeroActionWidget } from './components/HeroActionWidget';
import { ServicesBentoGrid } from './components/ServicesBentoGrid';
import { CorporateSection } from './components/CorporateSection';
import { SafetyVaultSection } from './components/SafetyVaultSection';
import { DriversRecruitmentSection } from './components/DriversRecruitmentSection';
import { FaqSection } from './components/FaqSection';
import { LandingFooter } from './components/LandingFooter';
import { PassengerAppFloatingDock } from './components/PassengerAppFloatingDock';
import { CookieConsentBanner } from './components/CookieConsentBanner';
import {
  BlurText,
  InfiniteMarquee,
  ShinyText,
} from './components/motion/ReactBitsPrimitives';

const MARQUEE_ITEMS = [
  'CATEGORÍA PRIORIDAD',
  'ENTREVISTA PRESENCIAL EN CÓRDOBA',
  'ORDENANZA 13.549',
  'MODO INVITADO /TRACK',
  'TRANSFER BLACK EMPRESAS',
  'GRÚA, COLECTIVO Y FLETE',
  'COMISIONES SIEMPRE TRANSPARENTES',
  'MESA OPERATIVA 24/7',
] as const;

export const LandingScreen: React.FC = () => {
  const { data: landingStats } = useLandingStats();
  const [cookiePreferencesOpen, setCookiePreferencesOpen] = useState(false);

  useEffect(() => {
    document.title = 'Transfer Black · Movilidad Ejecutiva y Corporativa en Córdoba';
  }, []);

  const activeDrivers = landingStats?.activeDrivers ?? 318;
  const corporateCompanies = landingStats?.corporateCompanies ?? 24;

  return (
    <div className="min-h-screen overflow-x-clip bg-[#FAFAFA] dark:bg-obsidian text-gray-900 dark:text-white font-montserrat transition-colors selection:bg-champagne-gold selection:text-obsidian">
      <LandingNavbar />

      <main>
        {/* FULL-BLEED CINEMATIC HERO WITH REAL EDITORIAL PHOTOGRAPHY */}
        <section
          id="viajar"
          className="relative min-h-[88vh] lg:min-h-[92vh] flex items-center bg-obsidian text-white overflow-hidden pt-20 pb-14 sm:pt-28 sm:pb-24"
        >
          {/* Background Photo + Cinematic Obsidian Gradient */}
          <img
            src={heroSedanImg}
            alt="Vehículo ejecutivo Transfer Black en avenida de noche"
            width={1920}
            height={1080}
            className="absolute inset-0 w-full h-full object-cover object-center scale-[1.02]"
          />
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-r from-obsidian via-obsidian/88 to-obsidian/55"
          />
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-t from-obsidian via-transparent to-obsidian/60"
          />

          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-10 items-center">
              {/* Left Column: Open Editorial Typography + Live KPIs (No boxed card) */}
              <div className="lg:col-span-6 space-y-5 sm:space-y-7">
                <p className="text-[11px] sm:text-xs font-bold uppercase tracking-[0.2em] sm:tracking-[0.24em]">
                  <ShinyText>Movilidad Ejecutiva y Corporativa · Córdoba</ShinyText>
                </p>

                <h1 className="text-3xl sm:text-5xl xl:text-6xl font-bold tracking-tight text-white leading-[1.1]">
                  <BlurText
                    text="Movete con prioridad. Viajá con estándar ejecutivo."
                    highlightWords={['prioridad', 'estándar', 'ejecutivo']}
                  />
                </h1>

                <p className="text-sm sm:text-lg text-gray-300 leading-relaxed max-w-xl">
                  Traslados inmediatos, reservas al aeropuerto, cuentas corporativas por PIN y logística especial con conductores entrevistados presencialmente en Córdoba.
                </p>

                {/* Open Hairline KPI Strip (No cards) */}
                <div className="pt-4 border-t border-white/15 grid grid-cols-3 gap-3 sm:gap-6 max-w-lg">
                  <div>
                    <div className="text-xl sm:text-3xl font-bold text-champagne-gold">
                      <AnimatedNumber value={activeDrivers} />
                    </div>
                    <p className="text-[10px] sm:text-[11px] text-gray-400 uppercase tracking-wider mt-1">
                      Conductores activos
                    </p>
                  </div>
                  <div className="border-l border-white/15 pl-3 sm:pl-5">
                    <div className="text-xl sm:text-3xl font-bold text-white">
                      <AnimatedNumber value={corporateCompanies} />
                    </div>
                    <p className="text-[10px] sm:text-[11px] text-gray-400 uppercase tracking-wider mt-1">
                      Cuentas empresas
                    </p>
                  </div>
                  <div className="border-l border-white/15 pl-3 sm:pl-5">
                    <div className="text-xl sm:text-3xl font-bold text-emerald-400">
                      <AnimatedNumber value={7} />/7
                    </div>
                    <p className="text-[10px] sm:text-[11px] text-gray-400 uppercase tracking-wider mt-1">
                      Controles + entrevista
                    </p>
                  </div>
                </div>

                {/* Trust micro-items */}
                <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-gray-300">
                  <span className="inline-flex items-center gap-1.5 font-medium">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    Sin altas automáticas: entrevista en persona
                  </span>
                  <span className="inline-flex items-center gap-1.5 font-medium">
                    <ShieldCheck className="w-4 h-4 text-champagne-gold" />
                    Auditoría Ordenanza 13.549
                  </span>
                </div>
              </div>

              {/* Right Column: Translucent Functional Utility Widget (Uber-style) */}
              <div className="lg:col-span-6">
                <HeroActionWidget />
              </div>
            </div>
          </div>
        </section>

        {/* REACT BITS INFINITE MARQUEE RIBBON */}
        <InfiniteMarquee items={MARQUEE_ITEMS} />

        {/* OPEN EDITORIAL SERVICES SECTION (NO BOXED CARDS) */}
        <ServicesBentoGrid />

        {/* FULL-BLEED 50/50 EDITORIAL CORPORATE SPLIT WITH PHOTO */}
        <CorporateSection />

        {/* EDITORIAL SAFETY SECTION WITH CHAUFFEUR PORTRAIT + 7-POINT ACCORDION */}
        <SafetyVaultSection />

        {/* FULL-BLEED 50/50 DRIVERS SECTION WITH COCKPIT PHOTO */}
        <DriversRecruitmentSection />

        {/* OPEN HAIRLINE FAQ ACCORDION */}
        <FaqSection />
      </main>

      {/* MONUMENTAL MEGA-FOOTER WITH COOKIE PREFERENCES TRIGGER */}
      <LandingFooter onOpenCookiePreferences={() => setCookiePreferencesOpen(true)} />

      {/* LEGAL COOKIE CONSENT BANNER & GRANULAR PREFERENCES MODAL (Bottom-Left) */}
      <CookieConsentBanner
        externalOpen={cookiePreferencesOpen}
        onExternalClose={() => setCookiePreferencesOpen(false)}
      />

      {/* PERSISTENT FLOATING PASSENGER APP QR & DOWNLOAD DOCK (Bottom-Right) */}
      <PassengerAppFloatingDock />
    </div>
  );
};

export default LandingScreen;
