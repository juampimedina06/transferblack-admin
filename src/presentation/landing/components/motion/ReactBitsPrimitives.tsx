import React, { useEffect, useRef, useState } from 'react';

interface BlurTextProps {
  text: string;
  className?: string;
  delayStepMs?: number;
  highlightWords?: readonly string[];
  highlightClassName?: string;
}

/**
 * Inspirado en React Bits (BlurText): entrada escalonada palabra por palabra
 * desde blur suave hasta nitidez total al entrar en viewport.
 */
export const BlurText: React.FC<BlurTextProps> = ({
  text,
  className = '',
  delayStepMs = 55,
  highlightWords = [],
  highlightClassName = 'tb-shiny-text',
}) => {
  const ref = useRef<HTMLSpanElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const words = text.split(' ');
  const normalizedHighlights = new Set(highlightWords.map((w) => w.toLowerCase()));

  return (
    <span ref={ref} className={className}>
      {words.map((word, idx) => {
        const cleanWord = word.replace(/[.,;:!?]/g, '').toLowerCase();
        const isHighlighted = normalizedHighlights.has(cleanWord);

        return (
          <span
            key={`${word}-${idx}`}
            style={{ transitionDelay: `${idx * delayStepMs}ms` }}
            className={`inline-block mr-[0.28em] transition-all duration-700 ease-out will-change-transform ${
              visible
                ? 'opacity-100 blur-0 translate-y-0'
                : 'opacity-0 blur-[8px] translate-y-3'
            } ${isHighlighted ? highlightClassName : ''}`}
          >
            {word}
          </span>
        );
      })}
    </span>
  );
};

interface ShinyTextProps {
  children: React.ReactNode;
  className?: string;
}

/** Inspirado en React Bits (ShinyText): destello metálico Champagne Gold. */
export const ShinyText: React.FC<ShinyTextProps> = ({ children, className = '' }) => (
  <span className={`tb-shiny-text ${className}`}>{children}</span>
);

interface RevealOnScrollProps {
  children: React.ReactNode;
  className?: string;
  delayMs?: number;
}

export const RevealOnScroll: React.FC<RevealOnScrollProps> = ({
  children,
  className = '',
  delayMs = 0,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.12 },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delayMs}ms` }}
      className={`transition-all duration-700 ease-out ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
      } ${className}`}
    >
      {children}
    </div>
  );
};

interface SpotlightSurfaceProps {
  children: React.ReactNode;
  className?: string;
  spotlightColor?: string;
}

/**
 * Inspirado en React Bits (SpotlightCard): brillo radial sutil que sigue al cursor.
 */
export const SpotlightSurface: React.FC<SpotlightSurfaceProps> = ({
  children,
  className = '',
  spotlightColor = 'rgba(212, 175, 55, 0.14)',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [coords, setCoords] = useState({ x: 0, y: 0, active: false });

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    setCoords({
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
      active: true,
    });
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setCoords((prev) => ({ ...prev, active: false }))}
      className={`relative overflow-hidden ${className}`}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 transition-opacity duration-300"
        style={{
          opacity: coords.active ? 1 : 0,
          background: `radial-gradient(460px circle at ${coords.x}px ${coords.y}px, ${spotlightColor}, transparent 60%)`,
        }}
      />
      {children}
    </div>
  );
};

interface InfiniteMarqueeProps {
  items: readonly string[];
  className?: string;
}

export const InfiniteMarquee: React.FC<InfiniteMarqueeProps> = ({ items, className = '' }) => {
  const duplicated = [...items, ...items];

  return (
    <div
      className={`w-full overflow-hidden border-y border-gray-200 dark:border-white/10 bg-white dark:bg-[#0D0D10] py-4 select-none ${className}`}
      aria-label="Servicios y diferenciales de Transfer Black"
    >
      <div className="tb-marquee-track flex items-center gap-10">
        {duplicated.map((item, idx) => (
          <div key={`${item}-${idx}`} className="flex items-center gap-10 shrink-0">
            <span className="text-[11px] font-bold uppercase tracking-[0.22em] text-gray-700 dark:text-gray-300 whitespace-nowrap">
              {item}
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-champagne-gold shrink-0" />
          </div>
        ))}
      </div>
    </div>
  );
};
