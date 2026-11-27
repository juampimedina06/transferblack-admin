import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  BatteryFull,
  CalendarClock,
  Car,
  Compass,
  MapPin,
  MessageCircle,
  Moon,
  Navigation,
  ShieldCheck,
  Signal,
  Sun,
  Wifi,
} from 'lucide-react';
import { AnimatedNumber } from '../../components/common/AnimatedNumber';
import { PhoneLiveMapPreview } from './PhoneLiveMapPreview';
import {
  APP_DOWNLOAD_LINKS,
  CORDOBA_PRESET_CORRIDORS,
  SPECIAL_SERVICES,
  TARIFF_REFERENCE,
  WHATSAPP_LINES,
  buildWhatsAppUrl,
  type SpecialServiceId,
} from '../constants/landingData';

type WidgetTab = 'ride' | 'reserve' | 'track';

const CHIP_LABELS: Record<string, string> = {
  aeropuerto: 'Aeropuerto',
  'ciudad-empresaria': 'C. Empresaria',
  cerro: 'Patio Olmos',
  terminal: 'Terminal',
};

export const HeroActionWidget: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<WidgetTab>('ride');

  // Tab 1: Simulador de tarifa transparente
  const [selectedCorridorId, setSelectedCorridorId] = useState<string>(
    CORDOBA_PRESET_CORRIDORS[0].id,
  );
  const [customKm, setCustomKm] = useState<number>(CORDOBA_PRESET_CORRIDORS[0].km);
  const [isNightTariff, setIsNightTariff] = useState<boolean>(false);

  // Tab 2: Reserva / Servicios especiales por WhatsApp
  const [selectedServiceId, setSelectedServiceId] = useState<SpecialServiceId>('reservation');
  const [originText, setOriginText] = useState('');
  const [destinationText, setDestinationText] = useState('');
  const [scheduleNotes, setScheduleNotes] = useState('');

  // Tab 3: Seguimiento en vivo (/track)
  const [trackingInput, setTrackingInput] = useState('');

  const activeCorridor =
    CORDOBA_PRESET_CORRIDORS.find((c) => c.id === selectedCorridorId) ??
    CORDOBA_PRESET_CORRIDORS[0];

  const fractionFare = isNightTariff
    ? TARIFF_REFERENCE.nighttimeFractionFare
    : TARIFF_REFERENCE.daytimeFractionFare;
  const fractionsCount = Math.ceil((customKm * 1000) / TARIFF_REFERENCE.distanceFractionMeters);
  const estimatedFare = fractionsCount * fractionFare;
  const estimatedMinutes = Math.max(6, Math.round(customKm * 1.9));

  const handleSelectCorridor = (corridorId: string) => {
    setSelectedCorridorId(corridorId);
    const found = CORDOBA_PRESET_CORRIDORS.find((c) => c.id === corridorId);
    if (found) {
      setCustomKm(found.km);
    }
  };

  const handleOpenWhatsAppService = (lineNumber: string) => {
    const service =
      SPECIAL_SERVICES.find((s) => s.id === selectedServiceId) ?? SPECIAL_SERVICES[0];
    const lines = [
      `Hola, quiero solicitar/consultar por *${service.name}* desde la web de Transfer Black.`,
    ];
    if (originText.trim()) lines.push(`Origen: ${originText.trim()}`);
    if (destinationText.trim()) lines.push(`Destino: ${destinationText.trim()}`);
    if (scheduleNotes.trim()) lines.push(`Fecha/Notas: ${scheduleNotes.trim()}`);

    window.open(buildWhatsAppUrl(lineNumber, lines.join('\n')), '_blank', 'noopener,noreferrer');
  };

  const handleTrackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const raw = trackingInput.trim();
    if (!raw) {
      navigate('/track');
      return;
    }
    try {
      if (raw.startsWith('http')) {
        const parsed = new URL(raw);
        navigate(`${parsed.pathname}${parsed.search}`);
        return;
      }
    } catch {
      // Fallback to token query
    }
    const cleanParam = raw.startsWith('?') ? raw : `?token=${encodeURIComponent(raw)}`;
    navigate(`/track${cleanParam}`);
  };

  return (
    <div className="relative mx-auto w-full max-w-[388px] select-none">
      {/* Subtle Ambient Gold Aura */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -inset-6 rounded-[64px] bg-gradient-to-tr from-champagne-gold/20 via-champagne-gold/5 to-transparent blur-3xl"
      />

      {/* Side Hardware Buttons */}
      <div aria-hidden="true" className="hidden sm:block absolute -left-[3px] top-28 h-8 w-[3px] rounded-l bg-white/20" />
      <div aria-hidden="true" className="hidden sm:block absolute -left-[3px] top-40 h-12 w-[3px] rounded-l bg-white/20" />
      <div aria-hidden="true" className="hidden sm:block absolute -left-[3px] top-56 h-12 w-[3px] rounded-l bg-white/20" />
      <div aria-hidden="true" className="hidden sm:block absolute -right-[3px] top-44 h-16 w-[3px] rounded-r bg-white/20" />

      {/* Flagship Phone Bezel */}
      <div className="relative rounded-[48px] p-[10px] bg-gradient-to-b from-[#34343D] via-[#19191F] to-[#0D0D11] shadow-[0_32px_90px_rgba(0,0,0,0.85),0_0_0_1px_rgba(255,255,255,0.14)]">
        {/* Inner OLED Screen */}
        <div className="relative rounded-[39px] bg-[#0D0D11] text-white overflow-hidden border border-white/10 flex flex-col min-h-[630px]">
          {/* Floating iOS Status Bar + Dynamic Island (overlaps edge-to-edge map!) */}
          <div className="absolute top-0 inset-x-0 z-20 px-6 pt-3 pb-2 flex items-center justify-between text-[11px] font-semibold text-white">
            <span className="tracking-tight drop-shadow">9:41</span>

            <div
              aria-hidden="true"
              className="absolute left-1/2 -translate-x-1/2 top-2.5 w-24 h-6 rounded-full bg-black border border-white/10 flex items-center justify-end pr-2.5"
            >
              <span className="w-2 h-2 rounded-full bg-[#1C2333] ring-1 ring-white/10" />
            </div>

            <div className="flex items-center gap-1.5 text-white/90 drop-shadow">
              <Signal className="w-3 h-3" />
              <Wifi className="w-3 h-3" />
              <BatteryFull className="w-3.5 h-3.5" />
            </div>
          </div>

          {activeTab === 'ride' && (
            <>
              {/* Full-Bleed Edge-to-Edge Live Map */}
              <PhoneLiveMapPreview
                corridorId={activeCorridor.id}
                routeLabel={activeCorridor.label}
                estimatedMinutes={estimatedMinutes}
              />

              {/* Native Rising Bottom Sheet (NO nested boxed cards inside) */}
              <div className="relative z-10 -mt-5 flex-1 rounded-t-[26px] bg-[#0D0D11] border-t border-white/10 px-5 pt-2.5 pb-4 flex flex-col justify-between gap-3.5 shadow-[0_-16px_40px_rgba(0,0,0,0.7)]">
                {/* Drag Handle */}
                <div className="w-9 h-1 rounded-full bg-white/20 mx-auto" />

                {/* Clean Uber-style Origin -> Destination Route Lines (No card wrapper) */}
                <div className="flex items-stretch gap-3">
                  <div className="flex flex-col items-center py-1 shrink-0">
                    <span className="w-2 h-2 rounded-full bg-champagne-gold" />
                    <span className="w-px flex-1 bg-white/20 my-1" />
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  </div>
                  <div className="flex-1 min-w-0 divide-y divide-white/10">
                    <p className="pb-1.5 text-xs font-medium text-gray-300 truncate">
                      {activeCorridor.origin}
                    </p>
                    <p className="pt-1.5 text-xs font-bold text-white truncate">
                      {activeCorridor.destination}
                    </p>
                  </div>
                </div>

                {/* Quick Destination Pills + Compact Day/Night Toggle */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                    {CORDOBA_PRESET_CORRIDORS.map((corridor) => {
                      const isSelected =
                        selectedCorridorId === corridor.id && customKm === corridor.km;
                      return (
                        <button
                          key={corridor.id}
                          type="button"
                          onClick={() => handleSelectCorridor(corridor.id)}
                          className={`px-2.5 py-1 rounded-full text-[10.5px] font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                            isSelected
                              ? 'bg-champagne-gold text-obsidian'
                              : 'bg-white/[0.07] text-gray-300 hover:bg-white/15'
                          }`}
                        >
                          {CHIP_LABELS[corridor.id] ?? corridor.label}
                        </button>
                      );
                    })}
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsNightTariff((prev) => !prev)}
                    title={isNightTariff ? 'Tarifa nocturna (22–06h)' : 'Tarifa diurna (06–22h)'}
                    aria-label="Cambiar tarifa diurna o nocturna"
                    className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-white/[0.07] hover:bg-white/15 text-[10px] font-bold text-champagne-gold whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    {isNightTariff ? <Moon className="w-3 h-3" /> : <Sun className="w-3 h-3" />}
                    <span>{isNightTariff ? 'Noche' : 'Día'}</span>
                  </button>
                </div>

                {/* Open Borderless Distance Slider */}
                <div className="space-y-1 pt-0.5">
                  <div className="flex items-center justify-between text-[11px]">
                    <label htmlFor="phone-km-slider" className="text-gray-400">
                      Distancia · Ficha c/{TARIFF_REFERENCE.distanceFractionMeters}m (${fractionFare})
                    </label>
                    <span className="font-mono font-bold text-champagne-gold">
                      {customKm.toFixed(1)} km
                    </span>
                  </div>
                  <input
                    id="phone-km-slider"
                    type="range"
                    min={2}
                    max={35}
                    step={0.5}
                    value={customKm}
                    onChange={(e) => setCustomKm(Number(e.target.value))}
                    className="w-full accent-champagne-gold cursor-pointer"
                  />
                </div>

                {/* Native Ride Option Row + Primary CTA */}
                <div className="pt-3 border-t border-white/10 space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-full bg-champagne-gold/15 text-champagne-gold flex items-center justify-center shrink-0">
                        <Car className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-white leading-none">
                          Transfer Prioridad
                        </p>
                        <p className="text-[10px] text-gray-400 mt-1">
                          MP · Efectivo · Modo Empresa
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="text-xl font-bold text-white leading-none">
                        $<AnimatedNumber value={estimatedFare} />
                      </p>
                      <span className="text-[10px] text-gray-400">ARS estimado</span>
                    </div>
                  </div>

                  <a
                    href={APP_DOWNLOAD_LINKS.passengerAndroidUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-full bg-champagne-gold text-obsidian text-xs font-extrabold tracking-wide hover:brightness-110 transition-all shadow-lg"
                  >
                    <span>Pedir en la App</span>
                    <ArrowRight className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </>
          )}

          {activeTab === 'reserve' && (
            <div className="flex-1 pt-14 px-5 pb-4 flex flex-col justify-between gap-4">
              <div className="space-y-4">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-champagne-gold">
                    Reservas & Logística
                  </p>
                  <h3 className="text-base font-bold text-white mt-0.5">
                    Coordiná directo por WhatsApp
                  </h3>
                </div>

                {/* Flat Service Pills (no boxed grid) */}
                <div className="flex flex-wrap gap-1.5">
                  {SPECIAL_SERVICES.map((service) => (
                    <button
                      key={service.id}
                      type="button"
                      onClick={() => setSelectedServiceId(service.id)}
                      className={`px-3 py-1.5 rounded-full text-[11px] font-bold transition-colors cursor-pointer ${
                        selectedServiceId === service.id
                          ? 'bg-champagne-gold text-obsidian'
                          : 'bg-white/[0.07] text-gray-300 hover:bg-white/15'
                      }`}
                    >
                      {service.name}
                    </button>
                  ))}
                </div>

                {/* Clean Underline/Minimal Native Inputs */}
                <div className="space-y-2.5 pt-1">
                  <div className="relative">
                    <MapPin className="w-3.5 h-3.5 text-gray-400 absolute left-0 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={originText}
                      onChange={(e) => setOriginText(e.target.value)}
                      placeholder="Origen (dirección o barrio)"
                      aria-label="Origen"
                      className="w-full pl-6 pr-2 py-2.5 text-xs bg-transparent border-b border-white/15 text-white placeholder-gray-500 focus:outline-none focus:border-champagne-gold"
                    />
                  </div>
                  <div className="relative">
                    <Navigation className="w-3.5 h-3.5 text-champagne-gold absolute left-0 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={destinationText}
                      onChange={(e) => setDestinationText(e.target.value)}
                      placeholder="Destino"
                      aria-label="Destino"
                      className="w-full pl-6 pr-2 py-2.5 text-xs bg-transparent border-b border-white/15 text-white placeholder-gray-500 focus:outline-none focus:border-champagne-gold"
                    />
                  </div>
                  <input
                    type="text"
                    value={scheduleNotes}
                    onChange={(e) => setScheduleNotes(e.target.value)}
                    placeholder="Fecha, hora o notas (ej: 06:30 · 2 valijas)"
                    aria-label="Fecha y notas"
                    className="w-full py-2.5 text-xs bg-transparent border-b border-white/15 text-white placeholder-gray-500 focus:outline-none focus:border-champagne-gold"
                  />
                </div>
              </div>

              <div className="space-y-2 pt-3 border-t border-white/10">
                {WHATSAPP_LINES.map((line) => (
                  <button
                    key={line.id}
                    type="button"
                    onClick={() => handleOpenWhatsAppService(line.number)}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all cursor-pointer"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>WhatsApp {line.displayPhone}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'track' && (
            <form
              onSubmit={handleTrackSubmit}
              className="flex-1 pt-14 px-5 pb-4 flex flex-col justify-between gap-4"
            >
              <div className="space-y-4">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-champagne-gold">
                    Modo Invitado (/track)
                  </p>
                  <h3 className="text-base font-bold text-white mt-0.5">
                    Seguí tu traslado en vivo sin instalar la app
                  </h3>
                  <p className="text-xs text-gray-400 mt-1.5 leading-relaxed">
                    Si un familiar o tu empresa pidió un Transfer Black para vos, pegá el link o código recibido por WhatsApp.
                  </p>
                </div>

                <input
                  type="text"
                  value={trackingInput}
                  onChange={(e) => setTrackingInput(e.target.value)}
                  placeholder="Pegá el link o token del viaje..."
                  aria-label="Código o enlace de seguimiento"
                  className="w-full py-2.5 text-xs bg-transparent border-b border-white/20 text-white placeholder-gray-500 focus:outline-none focus:border-champagne-gold"
                />

                <div className="flex items-start gap-2.5 pt-2 text-[11.5px] text-gray-400">
                  <ShieldCheck className="w-4 h-4 text-champagne-gold shrink-0 mt-0.5" />
                  <span>
                    Muestra patente, modelo del vehículo, chofer verificado y ubicación GPS en tiempo real.
                  </span>
                </div>
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 py-3 rounded-full bg-champagne-gold text-obsidian text-xs font-extrabold hover:brightness-110 transition-all cursor-pointer"
              >
                <span>Abrir mapa en vivo</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* Native Mobile Bottom Tab Bar */}
          <div
            role="tablist"
            aria-label="Navegación simulada de la app Transfer Black"
            className="px-4 pt-2 pb-2 bg-[#0A0A0D] border-t border-white/10"
          >
            <div className="grid grid-cols-3 gap-1">
              <button
                type="button"
                role="tab"
                aria-selected={activeTab === 'ride'}
                onClick={() => setActiveTab('ride')}
                className={`flex flex-col items-center gap-1 py-1.5 rounded-xl transition-colors cursor-pointer ${
                  activeTab === 'ride'
                    ? 'text-champagne-gold'
                    : 'text-gray-500 hover:text-gray-200'
                }`}
              >
                <Car className="w-4 h-4" />
                <span className="text-[10px] font-bold">Viajar</span>
              </button>

              <button
                type="button"
                role="tab"
                aria-selected={activeTab === 'reserve'}
                onClick={() => setActiveTab('reserve')}
                className={`flex flex-col items-center gap-1 py-1.5 rounded-xl transition-colors cursor-pointer ${
                  activeTab === 'reserve'
                    ? 'text-champagne-gold'
                    : 'text-gray-500 hover:text-gray-200'
                }`}
              >
                <CalendarClock className="w-4 h-4" />
                <span className="text-[10px] font-bold">Especiales</span>
              </button>

              <button
                type="button"
                role="tab"
                aria-selected={activeTab === 'track'}
                onClick={() => setActiveTab('track')}
                className={`flex flex-col items-center gap-1 py-1.5 rounded-xl transition-colors cursor-pointer ${
                  activeTab === 'track'
                    ? 'text-champagne-gold'
                    : 'text-gray-500 hover:text-gray-200'
                }`}
              >
                <Compass className="w-4 h-4" />
                <span className="text-[10px] font-bold">Seguir</span>
              </button>
            </div>

            {/* iOS Home Indicator */}
            <div className="mt-2 flex justify-center">
              <span className="w-28 h-1 rounded-full bg-white/25" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
