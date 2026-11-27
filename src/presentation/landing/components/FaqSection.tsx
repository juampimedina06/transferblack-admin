import React, { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';
import { LANDING_FAQS } from '../constants/landingData';

export const FaqSection: React.FC = () => {
  const [openId, setOpenId] = useState<string | null>(LANDING_FAQS[0].id);

  return (
    <section id="preguntas" className="py-20 sm:py-24 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
      <div className="text-center mb-12">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-widest bg-champagne-gold/15 text-champagne-gold border border-champagne-gold/30">
          <HelpCircle className="w-3.5 h-3.5" /> Preguntas Frecuentes
        </span>
        <h2 className="mt-3 text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
          Respuestas claras antes de tu próximo viaje
        </h2>
      </div>

      <div className="space-y-3">
        {LANDING_FAQS.map((item) => {
          const isOpen = openId === item.id;
          return (
            <div
              key={item.id}
              className="rounded-2xl bg-white dark:bg-dark-surface border border-gray-200/80 dark:border-white/10 overflow-hidden transition-colors"
            >
              <button
                type="button"
                aria-expanded={isOpen}
                onClick={() => setOpenId(isOpen ? null : item.id)}
                className="w-full flex items-center justify-between gap-4 p-5 text-left cursor-pointer hover:bg-gray-50/60 dark:hover:bg-white/[0.02] transition-colors"
              >
                <span className="text-sm sm:text-base font-bold text-gray-900 dark:text-white">
                  {item.question}
                </span>
                <ChevronDown
                  className={`w-5 h-5 text-champagne-gold shrink-0 transition-transform duration-200 ${
                    isOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>
              {isOpen && (
                <div className="px-5 pb-5 pt-0 text-sm text-gray-600 dark:text-gray-300 leading-relaxed border-t border-gray-100 dark:border-white/5">
                  <p className="pt-3">{item.answer}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};
