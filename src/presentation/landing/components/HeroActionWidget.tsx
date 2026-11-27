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

const SHORT_CORRIDOR_LABELS: Record<string, string> = {
  aeropuerto: 'Centro → Aeropuerto',
  'ciudad-empresaria': 'Nva. Cba → C. Empresaria',
  cerro: 'Cerro → Patio Olmos',
  terminal: 'V. Belgrano → Terminal',
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
    <div className="relative mx-auto w-full max-w-[392px] select-none">
      {/* Ambient Champagne Glow behind the phone */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -inset-6 rounded-[64px] bg-gradient-to-tr from-champagne-gold/25 via-champagne-gold/5 to-transparent blur-3xl"
      />

      {/* Side Hardware Buttons (Left: Volume, Right: Power) */}
      <div
        aria-hidden="true"
        className="hidden sm:block absolute -left-[3px] top-28 h-8 w-[3px] rounded-l bg-white/20"
      />
      <div
        aria-hidden="true"
        className="hidden sm:block absolute -left-[3px] top-40 h-12 w-[3px] rounded-l bg-white/20"
      />
      <div
        aria-hidden="true"
        className="hidden sm:block absolute -left-[3px] top-56 h-12 w-[3px] rounded-l bg-white/20"
      />
      <div
        aria-hidden="true"
        className="hidden sm:block absolute -right-[3px] top-44 h-16 w-[3px] rounded-r bg-white/20"
      />

      {/* Flagship Phone Bezel */}
      <div className="relative rounded-[48px] p-[10px] bg-gradient-to-b from-[#34343D] via-[#19191F] to-[#0D0D11] shadow-[0_32px_90px_rgba(0,0,0,0.85),0_0_0_1px_rgba(255,255,255,0.14)]">
        {/* Inner OLED Screen */}
        <div className="relative rounded-[39px] bg-[#0B0B0E] text-white overflow-hidden border border-white/10 flex flex-col min-h-[640px]">
          {/* Mobile Status Bar + Dynamic Island */}
          <div className="relative px-6 pt-3 pb-2 flex items-center justify-between text-[11px] font-semibold text-white/90">
            <span className="tracking-tight">9:41</span>

            {/* Dynamic Island */}
            <div
              aria-hidden="true"
              className="absolute left-1/2 -translate-x-1/2 top-2.5 w-24 h-6 rounded-full bg-black border border-white/10 flex items-center justify-end pr-2.5"
            >
              <span className="w-2 h-2 rounded-full bg-[#1C2333] ring-1 ring-white/10" />
            </div>

            <div className="flex items-center gap-1.5 text-white/85">
              <Signal className="w-3 h-3" />
              <Wifi className="w-3 h-3" />
              <BatteryFull className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* App Top Bar */}
          <div className="px-5 pt-2 pb-2.5 flex items-center justify-between border-b border-white/10">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-md bg-champagne-gold text-obsidian font-extrabold text-[10px] flex items-center justify-center">
                TB
              </span>
              <div>
                <p className="text-[11px] font-bold tracking-[0.16em] text-white leading-none">
                  TRANSFER BLACK
                </p>
                <p className="text-[9.5px] text-champagne-gold mt-0.5">App Pasajero · Córdoba</p>
              </div>
            </div>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 text-[9.5px] font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              En línea
            </span>
          </div>

          {/* App Screen Body */}
          <div className="flex-1 px-4 py-3.5 flex flex-col justify-between gap-3">
            {activeTab === 'ride' && (
              <>
                {/* Realistic Dark-Mode Córdoba Live Map Preview inside the Phone */}
                <PhoneLiveMapPreview
                  corridorId={activeCorridor.id}
                  routeLabel={SHORT_CORRIDOR_LABELS[activeCorridor.id] ?? activeCorridor.label}
                  estimatedMinutes={estimatedMinutes}
                />

                {/* Day / Night Pill */}
                <div className="grid grid-cols-2 gap-1 p-1 rounded-xl bg-white/[0.04] border border-white/10">
                  <button
                    type="button"
                    onClick={() => setIsNightTariff(false)}
                    className={`flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-[11px] font-bold transition-colors cursor-pointer ${
                      !isNightTariff
                        ? 'bg-champagne-gold text-obsidian'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    <Sun className="w-3 h-3" />
                    Diurna (06–22h)
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsNightTariff(true)}
                    className={`flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-[11px] font-bold transition-colors cursor-pointer ${
                      isNightTariff
                        ? 'bg-champagne-gold text-obsidian'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    <Moon className="w-3 h-3" />
                    Nocturna (22–06h)
                  </button>
                </div>

                {/* Corridor Chips */}
                <div className="grid grid-cols-2 gap-2">
                  {CORDOBA_PRESET_CORRIDORS.map((corridor) => {
                    const isSelected =
                      selectedCorridorId === corridor.id && customKm === corridor.km;
                    return (
                      <button
                        key={corridor.id}
                        type="button"
                        onClick={() => handleSelectCorridor(corridor.id)}
                        className={`text-left px-2.5 py-2 rounded-xl border transition-all cursor-pointer ${
                          isSelected
                            ? 'border-champagne-gold bg-champagne-gold/12 text-white'
                            : 'border-white/10 bg-white/[0.03] text-gray-300 hover:border-white/25'
                        }`}
                      >
                        <p className="text-[11px] font-bold truncate">
                          {SHORT_CORRIDOR_LABELS[corridor.id] ?? corridor.label}
                        </p>
                        <p className="text-[10px] text-gray-400 mt-0.5">
                          {corridor.km} km · ~{corridor.minutes} min
                        </p>
                      </button>
                    );
                  })}
                </div>

                {/* Distance Slider */}
                <div className="rounded-xl bg-white/[0.03] border border-white/10 px-3 py-2.5 space-y-1.5">
                  <div className="flex items-center justify-between text-[11px]">
                    <label htmlFor="phone-km-slider" className="text-gray-300 font-medium">
                      Ajustar distancia
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
                  <div className="flex justify-between text-[9.5px] text-gray-500">
                    <span>2 km</span>
                    <span>Ficha c/{TARIFF_REFERENCE.distanceFractionMeters}m: ${fractionFare}</span>
                    <span>35 km</span>
                  </div>
                </div>

                {/* Fare Sheet Bottom inside Phone */}
                <div className="pt-2 border-t border-white/10 space-y-2.5">
                  <div className="flex items-end justify-between">
                    <div>
                      <span className="block text-[10px] uppercase tracking-wider text-gray-400">
                        Categoría Prioridad
                      </span>
                      <div className="text-2xl font-bold text-white leading-tight">
                        $<AnimatedNumber value={estimatedFare} />
                        <span className="text-[11px] font-medium text-gray-400 ml-1">ARS</span>
                      </div>
                    </div>
                    <span className="text-[10px] font-semibold text-emerald-400 text-right leading-tight">
                      MP · Efectivo
                      <br />
                      Modo Empresa
                    </span>
                  </div>

                  <a
                    href={APP_DOWNLOAD_LINKS.passengerAndroidUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-champagne-gold text-obsidian text-xs font-extrabold tracking-wide hover:brightness-110 transition-all shadow-lg"
                  >
                    <span>Pedir en la App</span>
                    <ArrowRight className="w-4 h-4" />
                  </a>
                </div>
              </>
            )}

            {activeTab === 'reserve' && (
              <div className="flex-1 flex flex-col justify-between gap-3">
                <div className="space-y-3">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-champagne-gold">
                      Reservas & Logística
                    </p>
                    <h3 className="text-sm font-bold text-white mt-0.5">
                      Coordiná directo por WhatsApp
                    </h3>
                  </div>

                  <div className="grid grid-cols-2 gap-1.5">
                    {SPECIAL_SERVICES.map((service) => (
                      <button
                        key={service.id}
                        type="button"
                        onClick={() => setSelectedServiceId(service.id)}
                        className={`p-2 rounded-xl border text-left transition-all cursor-pointer ${
                          selectedServiceId === service.id
                            ? 'border-champagne-gold bg-champagne-gold/15 text-white'
                            : 'border-white/10 bg-white/[0.03] text-gray-400 hover:border-white/25'
                        }`}
                      >
                        <span className="block text-[9.5px] font-bold uppercase text-champagne-gold">
                          {service.tag}
                        </span>
                        <span className="block text-[11px] font-bold text-white mt-0.5">
                          {service.name}
                        </span>
                      </button>
                    ))}
                  </div>

                  <div className="space-y-2">
                    <div className="relative">
                      <MapPin className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={originText}
                        onChange={(e) => setOriginText(e.target.value)}
                        placeholder="Origen (dirección o barrio)"
                        aria-label="Origen"
                        className="w-full pl-8 pr-3 py-2 rounded-xl text-xs bg-white/[0.04] border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-champagne-gold"
                      />
                    </div>
                    <div className="relative">
                      <Navigation className="w-3.5 h-3.5 text-champagne-gold absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={destinationText}
                        onChange={(e) => setDestinationText(e.target.value)}
                        placeholder="Destino"
                        aria-label="Destino"
                        className="w-full pl-8 pr-3 py-2 rounded-xl text-xs bg-white/[0.04] border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-champagne-gold"
                      />
                    </div>
                    <input
                      type="text"
                      value={scheduleNotes}
                      onChange={(e) => setScheduleNotes(e.target.value)}
                      placeholder="Fecha, hora o notas (ej: 06:30 · 2 valijas)"
                      aria-label="Fecha y notas"
                      className="w-full px-3 py-2 rounded-xl text-xs bg-white/[0.04] border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-champagne-gold"
                    />
                  </div>
                </div>

                <div className="space-y-2 pt-2 border-t border-white/10">
                  {WHATSAPP_LINES.map((line) => (
                    <button
                      key={line.id}
                      type="button"
                      onClick={() => handleOpenWhatsAppService(line.number)}
                      className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all cursor-pointer"
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
                className="flex-1 flex flex-col justify-between gap-4"
              >
                <div className="space-y-3">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-champagne-gold">
                      Modo Invitado (/track)
                    </p>
                    <h3 className="text-sm font-bold text-white mt-0.5">
                      Seguí tu traslado en vivo sin instalar la app
                    </h3>
                    <p className="text-[11.5px] text-gray-400 mt-1.5 leading-relaxed">
                      Si un familiar o tu empresa pidió un Transfer Black para vos, pegá acá el link o código recibido por WhatsApp.
                    </p>
                  </div>

                  <input
                    type="text"
                    value={trackingInput}
                    onChange={(e) => setTrackingInput(e.target.value)}
                    placeholder="Pegá el link o token del viaje..."
                    aria-label="Código o enlace de seguimiento"
                    className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-white/[0.05] border border-white/15 text-white placeholder-gray-500 focus:outline-none focus:border-champagne-gold"
                  />

                  <div className="flex items-start gap-2 rounded-xl bg-white/[0.03] border border-white/10 p-3 text-[11px] text-gray-300">
                    <ShieldCheck className="w-4 h-4 text-champagne-gold shrink-0 mt-0.5" />
                    <span>
                      Vas a ver patente, modelo del vehículo, nombre del chofer verificado y ubicación GPS en tiempo real.
                    </span>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-champagne-gold text-obsidian text-xs font-extrabold hover:brightness-110 transition-all cursor-pointer"
                >
                  <span>Abrir mapa en vivo</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            )}
          </div>

          {/* Native Mobile Bottom Tab Bar */}
          <div
            role="tablist"
            aria-label="Navegación simulada de la app Transfer Black"
            className="px-4 pt-2 pb-2 bg-[#121217] border-t border-white/10"
          >
            <div className="grid grid-cols-3 gap-1">
              <button
                type="button"
                role="tab"
                aria-selected={activeTab === 'ride'}
                onClick={() => setActiveTab('ride')}
                className={`flex flex-col items-center gap-1 py-1.5 rounded-xl transition-colors cursor-pointer ${
                  activeTab === 'ride'
                    ? 'text-champagne-gold bg-champagne-gold/10'
                    : 'text-gray-400 hover:text-white'
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
                    ? 'text-champagne-gold bg-champagne-gold/10'
                    : 'text-gray-400 hover:text-white'
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
                    ? 'text-champagne-gold bg-champagne-gold/10'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <Compass className="w-4 h-4" />
                <span className="text-[10px] font-bold">Seguir</span>
              </button>
            </div>

            {/* iOS Home Indicator */}
            <div className="mt-2.5 flex justify-center">
              <span className="w-28 h-1 rounded-full bg-white/25" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
