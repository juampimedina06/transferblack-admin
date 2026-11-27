import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { LANDING_FAQS } from '../constants/landingData';
import { RevealOnScroll, ShinyText } from './motion/ReactBitsPrimitives';

export const FaqSection: React.FC = () => {
  const [openId, setOpenId] = useState<string | null>(LANDING_FAQS[0].id);

  return (
    <section id="preguntas" className="py-24 sm:py-32 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
      <RevealOnScroll className="mb-12">
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-champagne-gold mb-3">
          <ShinyText>Preguntas Frecuentes</ShinyText>
        </p>
        <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white tracking-tight">
          Respuestas claras antes de tu próximo viaje
        </h2>
      </RevealOnScroll>

      {/* Open Hairline Accordion (no nested cards) */}
      <div className="divide-y divide-gray-200 dark:divide-white/10 border-y border-gray-200 dark:border-white/10">
        {LANDING_FAQS.map((item) => {
          const isOpen = openId === item.id;
          return (
            <div key={item.id}>
              <button
                type="button"
                aria-expanded={isOpen}
                onClick={() => setOpenId(isOpen ? null : item.id)}
                className="w-full flex items-center justify-between gap-6 py-6 text-left cursor-pointer group"
              >
                <span className="text-base sm:text-lg font-bold text-gray-900 dark:text-white group-hover:text-champagne-gold transition-colors">
                  {item.question}
                </span>
                <ChevronDown
                  className={`w-5 h-5 text-champagne-gold shrink-0 transition-transform duration-200 ${
                    isOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>
              {isOpen && (
                <div className="pb-6 pr-8 text-sm sm:text-base text-gray-600 dark:text-gray-300 leading-relaxed">
                  <p>{item.answer}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};
