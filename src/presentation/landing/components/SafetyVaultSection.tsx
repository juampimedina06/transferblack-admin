import React, { useState } from 'react';
import {
  CheckCircle2,
  Clock,
  FileCheck2,
  Radio,
  ShieldAlert,
  ShieldCheck,
  UserCheck,
} from 'lucide-react';
import { SAFETY_SEVEN_POINTS } from '../constants/landingData';

export const SafetyVaultSection: React.FC = () => {
  const [selectedId, setSelectedId] = useState<string>(
    SAFETY_SEVEN_POINTS[SAFETY_SEVEN_POINTS.length - 1].id,
  );

  const activeItem =
    SAFETY_SEVEN_POINTS.find((item) => item.id === selectedId) ??
    SAFETY_SEVEN_POINTS[SAFETY_SEVEN_POINTS.length - 1];

  return (
    <section id="seguridad" className="py-20 sm:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="max-w-3xl mb-12">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-widest bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/25">
          <ShieldCheck className="w-3.5 h-3.5" /> Estándar de Seguridad Córdoba
        </span>
        <h2 className="mt-3 text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white tracking-tight">
          Ningún conductor sale a la calle sin aprobar 7 validaciones y una entrevista presencial.
        </h2>
        <p className="mt-3 text-base text-gray-600 dark:text-gray-400 leading-relaxed">
          A diferencia de las plataformas donde el alta es un formulario automático, en Transfer Black auditamos cada documento y entrevistamos en persona a cada conductor en nuestra oficina de Córdoba.
        </p>
      </div>

      {/* Interactive 7-Point Vault */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left: 7 Checkpoints List */}
        <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-3">
          {SAFETY_SEVEN_POINTS.map((item) => {
            const isSelected = item.id === activeItem.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setSelectedId(item.id)}
                className={`text-left p-4 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 ${
                  item.isHighlight ? 'sm:col-span-2' : ''
                } ${
                  isSelected
                    ? 'bg-obsidian text-white border-champagne-gold shadow-lg'
                    : 'bg-white dark:bg-dark-surface text-gray-900 dark:text-white border-gray-200/80 dark:border-white/10 hover:border-champagne-gold/50'
                }`}
              >
                <span
                  className={`font-mono text-xs font-bold px-2 py-1 rounded-lg shrink-0 ${
                    isSelected
                      ? 'bg-champagne-gold text-obsidian'
                      : 'bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-champagne-gold'
                  }`}
                >
                  {item.number}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <h3
                      className={`text-sm font-bold truncate ${
                        isSelected ? 'text-white' : 'text-gray-900 dark:text-white'
                      }`}
                    >
                      {item.title}
                    </h3>
                    <CheckCircle2
                      className={`w-4 h-4 shrink-0 ${
                        isSelected ? 'text-champagne-gold' : 'text-emerald-500'
                      }`}
                    />
                  </div>
                  <p
                    className={`text-xs mt-0.5 ${
                      isSelected ? 'text-gray-300' : 'text-gray-500 dark:text-gray-400'
                    }`}
                  >
                    {item.subtitle}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Right: Active Checkpoint Detail + Operational Protections */}
        <div className="lg:col-span-5 flex flex-col justify-between rounded-3xl bg-obsidian text-white border border-white/15 p-6 sm:p-8 shadow-xl">
          <div>
            <div className="flex items-center justify-between gap-2 pb-4 border-b border-white/10">
              <span className="text-xs font-bold uppercase tracking-widest text-champagne-gold">
                Requisito #{activeItem.number} · Verificación Obligatoria
              </span>
              {activeItem.isHighlight ? (
                <UserCheck className="w-5 h-5 text-champagne-gold" />
              ) : (
                <FileCheck2 className="w-5 h-5 text-champagne-gold" />
              )}
            </div>

            <h3 className="mt-5 text-xl font-bold text-white">{activeItem.title}</h3>
            <p className="mt-1 text-xs font-semibold text-champagne-gold uppercase tracking-wider">
              {activeItem.subtitle}
            </p>
            <p className="mt-3 text-sm text-gray-300 leading-relaxed">{activeItem.detail}</p>
          </div>

          {/* 3 Operational Pillars in Route */}
          <div className="mt-8 pt-6 border-t border-white/10 space-y-3.5">
            <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
              Protección Activa Durante el Viaje
            </p>

            <div className="flex items-start gap-3">
              <Clock className="w-4 h-4 text-champagne-gold shrink-0 mt-0.5" />
              <div className="text-xs">
                <strong className="text-white">Cumplimiento Ordenanza 13.549:</strong>{' '}
                <span className="text-gray-300">
                  Auditoría automática de tiempo máximo de conducción para prevenir fatiga al volante.
                </span>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <ShieldAlert className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div className="text-xs">
                <strong className="text-white">Botón SOS y Red de Alerta:</strong>{' '}
                <span className="text-gray-300">
                  Asistencia inmediata conectada con emergencias (911), alerta a flota cercana y consola central.
                </span>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Radio className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
              <div className="text-xs">
                <strong className="text-white">Control diario de vencimientos:</strong>{' '}
                <span className="text-gray-300">
                  Si una póliza o licencia vence, el sistema pausa automáticamente el despacho hasta su regularización.
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
