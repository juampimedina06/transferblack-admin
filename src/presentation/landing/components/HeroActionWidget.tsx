import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  CalendarClock,
  Car,
  Compass,
  MapPin,
  MessageCircle,
  Moon,
  Navigation,
  ShieldCheck,
  Sun,
} from 'lucide-react';
import { AnimatedNumber } from '../../components/common/AnimatedNumber';
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
    // Permite pegar tanto el link completo como el token/código directo
    try {
      if (raw.startsWith('http')) {
        const parsed = new URL(raw);
        navigate(`${parsed.pathname}${parsed.search}`);
        return;
      }
    } catch {
      // ignore URL parse error and pass as token/code query
    }
    const cleanParam = raw.startsWith('?') ? raw : `?token=${encodeURIComponent(raw)}`;
    navigate(`/track${cleanParam}`);
  };

  return (
    <div className="w-full rounded-2xl bg-white dark:bg-dark-surface border border-gray-200/90 dark:border-white/10 shadow-xl overflow-hidden transition-colors">
      {/* Segmented Tabs Style Uber */}
      <div
        role="tablist"
        aria-label="Herramientas rápidas de Transfer Black"
        className="grid grid-cols-3 border-b border-gray-200 dark:border-white/10 bg-gray-50/80 dark:bg-obsidian/60"
      >
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'ride'}
          onClick={() => setActiveTab('ride')}
          className={`flex items-center justify-center gap-2 py-3.5 px-3 text-xs sm:text-sm font-semibold border-b-2 transition-all cursor-pointer ${
            activeTab === 'ride'
              ? 'border-champagne-gold text-gray-900 dark:text-champagne-gold bg-white dark:bg-dark-surface'
              : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          <Car className="w-4 h-4 shrink-0" />
          <span>Viajar ahora</span>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'reserve'}
          onClick={() => setActiveTab('reserve')}
          className={`flex items-center justify-center gap-2 py-3.5 px-3 text-xs sm:text-sm font-semibold border-b-2 transition-all cursor-pointer ${
            activeTab === 'reserve'
              ? 'border-champagne-gold text-gray-900 dark:text-champagne-gold bg-white dark:bg-dark-surface'
              : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          <CalendarClock className="w-4 h-4 shrink-0" />
          <span>Reservar / Especial</span>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'track'}
          onClick={() => setActiveTab('track')}
          className={`flex items-center justify-center gap-2 py-3.5 px-3 text-xs sm:text-sm font-semibold border-b-2 transition-all cursor-pointer ${
            activeTab === 'track'
              ? 'border-champagne-gold text-gray-900 dark:text-champagne-gold bg-white dark:bg-dark-surface'
              : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          <Compass className="w-4 h-4 shrink-0" />
          <span>Seguir viaje</span>
        </button>
      </div>

      {/* Panel Body */}
      <div className="p-5 sm:p-6">
        {activeTab === 'ride' && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-champagne-gold">
                  Simulador de tarifa · Categoría Prioridad
                </span>
                <h3 className="text-base font-bold text-gray-900 dark:text-white">
                  Calculá tu traslado en Córdoba al instante
                </h3>
              </div>

              {/* Day / Night toggle */}
              <div className="inline-flex rounded-lg p-1 bg-gray-100 dark:bg-obsidian border border-gray-200 dark:border-white/10">
                <button
                  type="button"
                  onClick={() => setIsNightTariff(false)}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                    !isNightTariff
                      ? 'bg-obsidian dark:bg-champagne-gold text-white dark:text-obsidian'
                      : 'text-gray-600 dark:text-gray-400'
                  }`}
                >
                  <Sun className="w-3.5 h-3.5" />
                  Diurna (06–22h)
                </button>
                <button
                  type="button"
                  onClick={() => setIsNightTariff(true)}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                    isNightTariff
                      ? 'bg-obsidian dark:bg-champagne-gold text-white dark:text-obsidian'
                      : 'text-gray-600 dark:text-gray-400'
                  }`}
                >
                  <Moon className="w-3.5 h-3.5" />
                  Nocturna (22–06h)
                </button>
              </div>
            </div>

            {/* Preset corridors */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {CORDOBA_PRESET_CORRIDORS.map((corridor) => {
                const isSelected =
                  selectedCorridorId === corridor.id && customKm === corridor.km;
                return (
                  <button
                    key={corridor.id}
                    type="button"
                    onClick={() => handleSelectCorridor(corridor.id)}
                    className={`text-left p-2.5 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'border-champagne-gold bg-champagne-gold/10 dark:bg-champagne-gold/10'
                        : 'border-gray-200 dark:border-white/10 hover:border-champagne-gold/50 bg-gray-50/60 dark:bg-white/[0.02]'
                    }`}
                  >
                    <p className="text-xs font-semibold text-gray-900 dark:text-white truncate">
                      {corridor.label}
                    </p>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                      {corridor.km} km · ~{corridor.minutes} min
                    </p>
                  </button>
                );
              })}
            </div>

            {/* Distance slider */}
            <div className="bg-gray-50 dark:bg-obsidian/70 border border-gray-200/80 dark:border-white/10 rounded-xl p-3.5 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <label
                  htmlFor="landing-km-slider"
                  className="font-semibold text-gray-700 dark:text-gray-300"
                >
                  Distancia del recorrido ({activeCorridor.origin.split(',')[0]} →{' '}
                  {activeCorridor.destination.split(',')[0]})
                </label>
                <span className="font-bold text-gray-900 dark:text-champagne-gold">
                  {customKm.toFixed(1)} km
                </span>
              </div>
              <input
                id="landing-km-slider"
                type="range"
                min={2}
                max={35}
                step={0.5}
                value={customKm}
                onChange={(e) => setCustomKm(Number(e.target.value))}
                className="w-full accent-champagne-gold cursor-pointer"
              />
              <div className="flex justify-between text-[10.5px] text-gray-400">
                <span>2 km (tramo corto)</span>
                <span>Ficha c/{TARIFF_REFERENCE.distanceFractionMeters}m: ${fractionFare}</span>
                <span>35 km (interurbano)</span>
              </div>
            </div>

            {/* Estimated Result + CTA */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
              <div>
                <span className="text-[11px] text-gray-500 dark:text-gray-400 block">
                  Tarifa estimada en categoría Prioridad
                </span>
                <div className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
                  $<AnimatedNumber value={estimatedFare} />
                  <span className="text-xs font-medium text-gray-500 dark:text-gray-400 ml-1.5">
                    ARS
                  </span>
                </div>
                <span className="text-[11px] text-emerald-700 dark:text-emerald-400 font-medium">
                  Mercado Pago · Efectivo · Modo Empresa
                </span>
              </div>

              <a
                href={APP_DOWNLOAD_LINKS.passengerAndroidUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-obsidian dark:bg-champagne-gold text-white dark:text-obsidian font-bold text-sm hover:brightness-110 transition-all shadow-md"
              >
                <span>Pedir en la App</span>
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>
        )}

        {activeTab === 'reserve' && (
          <div className="space-y-4">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-champagne-gold">
                Atención directa por WhatsApp · Córdoba
              </span>
              <h3 className="text-base font-bold text-gray-900 dark:text-white">
                Reservá un traslado o pedí Grúa, Colectivo o Flete
              </h3>
            </div>

            {/* Service pills */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {SPECIAL_SERVICES.map((service) => (
                <button
                  key={service.id}
                  type="button"
                  onClick={() => setSelectedServiceId(service.id)}
                  className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                    selectedServiceId === service.id
                      ? 'border-champagne-gold bg-champagne-gold/10 text-gray-900 dark:text-white'
                      : 'border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-400 hover:border-champagne-gold/40'
                  }`}
                >
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-champagne-gold">
                    {service.tag}
                  </span>
                  <span className="block text-xs font-bold mt-0.5 text-gray-900 dark:text-white">
                    {service.name}
                  </span>
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label
                  htmlFor="wa-origin"
                  className="block text-[11px] font-semibold text-gray-600 dark:text-gray-300 mb-1"
                >
                  Origen
                </label>
                <div className="relative">
                  <MapPin className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    id="wa-origin"
                    type="text"
                    value={originText}
                    onChange={(e) => setOriginText(e.target.value)}
                    placeholder="Dirección o barrio de retiro"
                    className="w-full pl-8 pr-3 py-2 rounded-lg text-xs bg-gray-50 dark:bg-obsidian border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white focus:outline-none focus:border-champagne-gold"
                  />
                </div>
              </div>
              <div>
                <label
                  htmlFor="wa-dest"
                  className="block text-[11px] font-semibold text-gray-600 dark:text-gray-300 mb-1"
                >
                  Destino
                </label>
                <div className="relative">
                  <Navigation className="w-3.5 h-3.5 text-champagne-gold absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    id="wa-dest"
                    type="text"
                    value={destinationText}
                    onChange={(e) => setDestinationText(e.target.value)}
                    placeholder="Hacia dónde vas"
                    className="w-full pl-8 pr-3 py-2 rounded-lg text-xs bg-gray-50 dark:bg-obsidian border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white focus:outline-none focus:border-champagne-gold"
                  />
                </div>
              </div>
            </div>

            <div>
              <label
                htmlFor="wa-notes"
                className="block text-[11px] font-semibold text-gray-600 dark:text-gray-300 mb-1"
              >
                Fecha, hora o detalles del pedido (opcional)
              </label>
              <input
                id="wa-notes"
                type="text"
                value={scheduleNotes}
                onChange={(e) => setScheduleNotes(e.target.value)}
                placeholder="Ej: Mañana 06:30 hs · 3 pasajeros con valijas"
                className="w-full px-3 py-2 rounded-lg text-xs bg-gray-50 dark:bg-obsidian border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white focus:outline-none focus:border-champagne-gold"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
              {WHATSAPP_LINES.map((line) => (
                <button
                  key={line.id}
                  type="button"
                  onClick={() => handleOpenWhatsAppService(line.number)}
                  className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4 shrink-0" />
                  <span>
                    Coordinar por {line.displayPhone}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'track' && (
          <form onSubmit={handleTrackSubmit} className="space-y-4">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-champagne-gold">
                Seguimiento Público en Tiempo Real
              </span>
              <h3 className="text-base font-bold text-gray-900 dark:text-white">
                ¿Pidieron un Transfer Black para vos? Seguilo acá sin instalar nada
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
                Cuando un familiar o tu empresa solicita un viaje en Modo Invitado, recibís un enlace de seguimiento. Pegá el código o link para ver el vehículo acercándose en el mapa en vivo.
              </p>
            </div>

            <div>
              <label
                htmlFor="track-code-input"
                className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5"
              >
                Código o enlace de seguimiento
              </label>
              <input
                id="track-code-input"
                type="text"
                value={trackingInput}
                onChange={(e) => setTrackingInput(e.target.value)}
                placeholder="Pegá el link recibido por WhatsApp o el token del viaje..."
                className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-gray-50 dark:bg-obsidian border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white focus:outline-none focus:border-champagne-gold"
              />
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
              <div className="flex items-center gap-2 text-[11.5px] text-gray-500 dark:text-gray-400">
                <ShieldCheck className="w-4 h-4 text-champagne-gold shrink-0" />
                <span>Muestra patente, modelo, chofer verificado y posición GPS en vivo.</span>
              </div>

              <button
                type="submit"
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-obsidian dark:bg-champagne-gold text-white dark:text-obsidian text-xs font-bold hover:brightness-110 transition-all cursor-pointer shrink-0"
              >
                <span>Abrir mapa en vivo</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
